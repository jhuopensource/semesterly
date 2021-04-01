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

from __future__ import unicode_literals

from django.shortcuts import render
from helpers.mixins import ValidateSubdomainMixin, RedirectToSignupMixin
from student.models import Student
from timetable.models import Semester
from forum.models import Transcript, Comment
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from serializers import TranscriptSerializer, CommentSerializer


class ForumView(ValidateSubdomainMixin, RedirectToSignupMixin, APIView):
    """ Handles the accessing of all user forum transcripts collectively. """

    def get(self, request):
        """
        Returns all forum transcripts for the user making the request.
        """
        student = Student.objects.get(user=request.user)
        return Response(
            {'invited_transcripts': TranscriptSerializer(
                student.invited_transcripts, many=True).data,
             'owned_transcripts': TranscriptSerializer(
                 student.owned_transcripts, many=True).data},
            status=status.HTTP_200_OK)


class ForumTranscriptView(ValidateSubdomainMixin, RedirectToSignupMixin, APIView):
    """ Handles the accessing of individual user forum transcripts. """

    def get(self, request, sem_name, year):
        """
        Returns the forum transcript associated with a
        particular semester for the user making the request.
        """

        student = Student.objects.get(user=request.user)
        semester = Semester.objects.get(name=sem_name, year=year)
        transcript = Transcript.objects.get(owner=student, semester=semester)
        return Response({'transcript': TranscriptSerializer(transcript).data},
                        status=status.HTTP_200_OK)

    def post(self, request, sem_name, year):
        """
        Saves a comment in the backend.

        Requests:
        The content and timestamp of the comment.
        The jhed id of the owner of the forum transcript the comment
        is written in.
        """

        student = Student.objects.get(user=request.user)
        semester = Semester.objects.get(name=sem_name, year=year)
        transcript = Transcript.objects.get(owner=Student.objects.get(jhed=request.data['jhed']),
                                            semester=semester)

        if ((not student in transcript.advisors.all()) and
                (student.jhed != transcript.owner.jhed)):
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        comment = Comment.objects.create(author=student,
                                         content=request.data['content'],
                                         timestamp=request.data['timestamp'],
                                         transcript=transcript)
        comment.save()

        return Response(status=status.HTTP_200_OK)

    def put(self, request, sem_name, year):
        """
        Creates a forum transcript associated with a certain semester.
        """

        student = Student.objects.get(user=request.user)
        semester = Semester.objects.get(name=sem_name, year=year)

        transcript = Transcript.objects.create(
            owner=student, semester=semester)
        transcript.save()

        return Response({'transcript': TranscriptSerializer(transcript).data},
                        status=status.HTTP_200_OK)

    def patch(self, request, sem_name, year):
        """
        Adds or removes one advisor from a forum transcript.

        Requests:
        The jhed id of the advisor being added or removed.
        Whether the advisor is being added or removed.
        """

        student = Student.objects.get(user=request.user)
        semester = Semester.objects.get(name=sem_name, year=year)

        transcript = Transcript.objects.get(owner=student, semester=semester)
        if request.data['action'] == 'add':
            transcript.advisors.add(Student.objects.get(jhed=request.data['jhed']))
        elif request.data['action'] == 'remove':
            transcript.advisors.remove(Student.objects.get(jhed=request.data['jhed']))
        transcript.save()

        return Response({'transcript': TranscriptSerializer(transcript).data},
                        status=status.HTTP_200_OK)

    def delete(self, request, sem_name, year):
        """
        Deletes one forum transcript associated with a particular
        semester.
        """

        student = Student.objects.get(user=request.user)
        semester = Semester.objects.get(name=sem_name, year=year)
        transcript = Transcript.objects.get(owner=student, semester=semester)
        transcript.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)