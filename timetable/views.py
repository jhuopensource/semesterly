# -*- coding: utf-8 -*-
# Copyright (C) 2017 Semester.ly Technologies, LLC
#
# Semester.ly is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Semester.ly is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

import itertools
import logging

from django.db import transaction
from django.utils import timezone
from django.http import Http404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from analytics.models import SharedTimetable, SharedTimetableOperation
from analytics.views import save_analytics_timetable
from courses.serializers import CourseSerializer
from student.utils import get_student
from timetable.serializers import DisplayTimetableSerializer
from timetable.models import Semester, Course, Section
from timetable.realtime import build_shared_timetable_payload, broadcast_shared_timetable_payload
from timetable.share_links import (
    get_shared_timetable_slug,
    resolve_shared_timetable_by_slug,
)
from timetable.utils import (
    update_locked_sections,
    courses_to_timetables,
)
from helpers.mixins import ValidateSubdomainMixin, FeatureFlowView, CsrfExemptMixin
from semesterly.settings import ENABLE_SOCIAL_SYNC_COLLAB, ENABLE_SOCIAL_SYNC_GHOST

logger = logging.getLogger(__name__)


def is_share_access_valid(shared_timetable):
    if shared_timetable.revoked_at is not None:
        return False
    if (
        shared_timetable.expires_at is not None
        and shared_timetable.expires_at <= timezone.now()
    ):
        return False
    return True


def can_edit_shared_timetable(shared_timetable, edit_token):
    return (
        shared_timetable.permission == "edit"
        and shared_timetable.edit_token
        and edit_token
        and shared_timetable.edit_token == edit_token
    )


class TimetableView(CsrfExemptMixin, ValidateSubdomainMixin, APIView):
    """
    This view is responsible for responding to any requests dealing with the
    generation of timetables and the satisfaction of constraints provided by
    the frontend/user.
    """

    def post(self, request):
        """Generate best timetables given the user's selected courses"""
        school = request.subdomain
        params = request.data
        student = get_student(request)
        course_ids = list(params["courseSections"].keys())
        courses = [Course.objects.get(id=cid) for cid in course_ids]
        locked_sections = params["courseSections"]

        self.set_params_semester(params)
        save_analytics_timetable(
            courses, params["semester"], school, get_student(request)
        )
        self.update_courses_and_locked_sections(
            params, course_ids, courses, locked_sections
        )
        custom_events = params.get("customSlots", [])
        preferences = params["preferences"]
        with_conflicts = preferences.get("tryWithConflicts", False)
        show_weekend = preferences.get("showWeekend", False)
        timetables = [
            timetable
            for timetable in courses_to_timetables(
                courses,
                locked_sections,
                params["semester"],
                params["school"],
                custom_events,
                with_conflicts,
                show_weekend,
            )
        ]

        context = self.create_context(request, params, student)
        response = self.create_response(courses, locked_sections, timetables, context)
        return Response(response, status=status.HTTP_200_OK)

    def update_courses_and_locked_sections(
        self, params, course_ids, courses, locked_sections
    ):
        for updated_course in params.get("updated_courses", []):
            cid = str(updated_course["course_id"])
            locked_sections.setdefault(cid, {})
            if cid not in course_ids:
                courses.append(Course.objects.get(id=int(cid)))

            for locked_section in filter(bool, updated_course["section_codes"]):
                update_locked_sections(
                    locked_sections, cid, locked_section, params["semester"]
                )

    def set_params_semester(self, params):
        try:
            params["semester"] = Semester.objects.get_or_create(**params["semester"])[0]
        except TypeError:  # handle deprecated cached semesters from frontend
            params["semester"] = (
                Semester.objects.get(name="Fall", year="2016")
                if params["semester"] == "F"
                else Semester.objects.get(name="Spring", year="2017")
            )

    def create_response(self, courses, locked_sections, timetables, context):
        return {
            "timetables": DisplayTimetableSerializer(timetables, many=True).data,
            "new_c_to_s": locked_sections,
            "courses": CourseSerializer(courses, context=context, many=True).data,
        }

    def create_context(self, request, params, student):
        return {
            "semester": params["semester"],
            "school": request.subdomain,
            "student": student,
        }


class TimetableLinkView(FeatureFlowView):
    """
    A subclass of :obj:`FeatureFlowView` (see :ref:`flows`) for the
    viewing of shared timetable links. Provides the logic for preloading
    the shared timetable into initData when a user hits the corresponding
    url. The frontend can then act on this data to load the shared timetable
    for viewing.

    Additionally, on POST provides the functionality for the creation of
    shared timetables.
    """

    feature_name = "SHARE_TIMETABLE"

    def get_feature_flow(self, request, slug):
        """
        Overrides :obj:`FeatureFlowView` *get_feature_flow* method. Takes the slug,
        decrypts the hashed database id, and either retrieves the corresponding
        timetable or hits a 404.
        """
        shared_timetable = resolve_shared_timetable_by_slug(slug, request.subdomain)
        if not is_share_access_valid(shared_timetable):
            raise Http404
        edit_token = request.GET.get("edit")
        can_edit = ENABLE_SOCIAL_SYNC_COLLAB and can_edit_shared_timetable(
            shared_timetable, edit_token
        )
        context = {
            "semester": shared_timetable.semester,
            "school": request.subdomain,
            "student": get_student(request),
        }
        return {
            "semester": shared_timetable.semester,
            "courses": CourseSerializer(
                shared_timetable.courses, context=context, many=True
            ).data,
            "sharedTimetable": DisplayTimetableSerializer.from_model(
                shared_timetable
            ).data,
            "slug": get_shared_timetable_slug(shared_timetable),
            "permission": shared_timetable.permission,
            "revision": shared_timetable.revision,
            "updatedAt": shared_timetable.updated_at.isoformat(),
            "canEdit": can_edit,
            "editorToken": edit_token if can_edit else None,
        }

    def post(self, request):
        """
        Creates a :obj:`SharedTimetable` and returns the hashed database id
        as the slug for the url which students then share and access.
        """
        school = request.subdomain
        timetable = request.data["timetable"]
        has_conflict = timetable.get("has_conflict", False)
        semester, _ = Semester.objects.get_or_create(**request.data["semester"])
        student = get_student(request)
        source_timetable = None
        timetable_id = timetable.get("id")
        if student is not None and timetable_id:
            source_timetable = (
                student.personaltimetable_set.filter(
                    id=timetable_id, school=school, semester=semester
                ).first()
            )
        if source_timetable is None and student is not None:
            # Fallback for legacy clients that omit timetable id in share payload.
            source_timetable = (
                student.personaltimetable_set.filter(
                    school=school, semester=semester
                )
                .order_by("-last_updated")
                .first()
            )
        permission = request.data.get("permission", "view")
        if permission not in {"view", "edit"}:
            permission = "view"
        shared_timetable = SharedTimetable.objects.create(
            student=student,
            school=school,
            semester=semester,
            has_conflict=has_conflict,
            source_timetable=source_timetable,
            permission=permission,
        )
        shared_timetable.save()
        if not self.save_courses(timetable, shared_timetable):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        shared_timetable.ensure_share_token()
        if permission == "edit" and ENABLE_SOCIAL_SYNC_COLLAB:
            shared_timetable.ensure_edit_token()
        response = {"slug": get_shared_timetable_slug(shared_timetable)}
        if shared_timetable.edit_token:
            response["editorToken"] = shared_timetable.edit_token
        return Response(response, status=status.HTTP_200_OK)

    def save_courses(self, timetable: dict, shared_timetable: SharedTimetable):
        added_courses = set()
        for slot in timetable["slots"]:
            course_id, section_id = slot["course"], slot["section"]
            if course_id not in added_courses:
                course_obj = Course.objects.get(id=course_id)
                shared_timetable.courses.add(course_obj)
                added_courses.add(course_id)

            section_obj = Section.objects.get(id=section_id)
            shared_timetable.sections.add(section_obj)
            if section_obj.course.id not in added_courses:
                return False
        shared_timetable.save()
        return True


class SharedTimetableGhostView(ValidateSubdomainMixin, APIView):
    """
    Read-only API for loading a shared timetable as a ghost overlay.
    """

    def get(self, request, slug):
        if not ENABLE_SOCIAL_SYNC_COLLAB:
            return Response(status=status.HTTP_404_NOT_FOUND)
        shared_timetable = resolve_shared_timetable_by_slug(slug, request.subdomain)
        if not is_share_access_valid(shared_timetable):
            return Response(status=status.HTTP_404_NOT_FOUND)
        response = build_shared_timetable_payload(shared_timetable)
        return Response(response, status=status.HTTP_200_OK)


class SharedTimetableOpsView(ValidateSubdomainMixin, APIView):
    """
    Write API for realtime collaboration on shared timetable links.
    """

    def post(self, request, slug):
        if not ENABLE_SOCIAL_SYNC_GHOST:
            return Response(status=status.HTTP_404_NOT_FOUND)
        shared_timetable = resolve_shared_timetable_by_slug(slug, request.subdomain)
        if not is_share_access_valid(shared_timetable):
            return Response(status=status.HTTP_404_NOT_FOUND)

        edit_token = request.data.get("editToken") or request.GET.get("edit")
        if not can_edit_shared_timetable(shared_timetable, edit_token):
            return Response(
                {"detail": "Edit token is invalid for this shared timetable."},
                status=status.HTTP_403_FORBIDDEN,
            )

        base_revision = request.data.get("baseRevision")
        operations = request.data.get("operations") or []
        if base_revision is None or not isinstance(base_revision, int):
            return Response(
                {"detail": "baseRevision must be provided as an integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not operations or not isinstance(operations, list):
            return Response(
                {"detail": "operations must be a non-empty list."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(operations) != 1:
            return Response(
                {"detail": "This endpoint currently supports exactly one operation."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        actor = get_student(request)
        with transaction.atomic():
            locked_shared = SharedTimetable.objects.select_for_update().get(
                id=shared_timetable.id
            )
            if base_revision != locked_shared.revision:
                latest = build_shared_timetable_payload(locked_shared)
                return Response(
                    {
                        "detail": "Stale baseRevision.",
                        "latest": latest,
                    },
                    status=status.HTTP_409_CONFLICT,
                )

            revision_counter = locked_shared.revision
            for operation in operations:
                op_type = operation.get("type")
                payload = operation.get("payload") or {}
                if op_type != "replace_timetable":
                    return Response(
                        {"detail": f"Unsupported operation type: {op_type}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                timetable_payload = payload.get("timetable") or {}
                apply_error = self._apply_replace_timetable(
                    locked_shared, timetable_payload
                )
                if apply_error is not None:
                    return Response(
                        {"detail": apply_error},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                revision_counter += 1
                locked_shared.revision = revision_counter
                locked_shared.save(update_fields=["revision", "updated_at"])
                SharedTimetableOperation.objects.create(
                    shared_timetable=locked_shared,
                    actor=actor,
                    operation_type=op_type,
                    payload=payload,
                    base_revision=base_revision,
                    applied_revision=revision_counter,
                )
                base_revision = revision_counter

        response_payload = build_shared_timetable_payload(locked_shared)
        broadcast_shared_timetable_payload(response_payload)
        return Response(response_payload, status=status.HTTP_200_OK)

    def _apply_replace_timetable(self, shared_timetable, timetable_payload):
        slots = timetable_payload.get("slots")
        if slots is None or not isinstance(slots, list):
            return "replace_timetable payload must include a slots list."
        section_ids = []
        for slot in slots:
            section_id = slot.get("section")
            if section_id is None:
                return "Each slot must include a section id."
            section_ids.append(section_id)

        sections = list(
            Section.objects.filter(
                id__in=section_ids,
                semester=shared_timetable.semester,
                course__school=shared_timetable.school,
            )
        )
        section_by_id = {section.id: section for section in sections}
        missing_ids = [sid for sid in section_ids if sid not in section_by_id]
        if missing_ids:
            return "One or more sections are invalid for this timetable semester/school."

        unique_sections = []
        seen = set()
        for section_id in section_ids:
            if section_id in seen:
                continue
            seen.add(section_id)
            unique_sections.append(section_by_id[section_id])

        unique_courses = []
        seen_course_ids = set()
        for section in unique_sections:
            if section.course_id in seen_course_ids:
                continue
            seen_course_ids.add(section.course_id)
            unique_courses.append(section.course)

        shared_timetable.sections.set(unique_sections)
        shared_timetable.courses.set(unique_courses)
        shared_timetable.has_conflict = timetable_payload.get("has_conflict", False)
        shared_timetable.save(update_fields=["has_conflict", "updated_at"])
        return None
