from asgiref.sync import async_to_sync
from django.utils import timezone

from courses.serializers import CourseSerializer
from semesterly.settings import ENABLE_SOCIAL_SYNC_GHOST
from timetable.serializers import DisplayTimetableSerializer
from timetable.share_links import get_shared_timetable_slug


def get_shared_timetable_group(slug):
    return f"shared_timetable_{slug}"


def build_shared_timetable_payload(shared_timetable):
    serializer_context = {
        "semester": shared_timetable.semester,
        "school": shared_timetable.school,
        "student": None,
    }
    return {
        "type": "timetable.updated",
        "slug": get_shared_timetable_slug(shared_timetable),
        "permission": shared_timetable.permission,
        "revision": shared_timetable.revision,
        "updatedAt": (
            shared_timetable.updated_at.isoformat()
            if hasattr(shared_timetable.updated_at, "isoformat")
            else timezone.now().isoformat()
        ),
        "sharedTimetable": DisplayTimetableSerializer.from_model(shared_timetable).data,
        "courses": CourseSerializer(
            shared_timetable.courses, context=serializer_context, many=True
        ).data,
    }


def broadcast_shared_timetable_payload(payload):
    try:
        from channels.layers import get_channel_layer
    except ImportError:
        return

    channel_layer = get_channel_layer()
    if channel_layer is None:
        return

    async_to_sync(channel_layer.group_send)(
        get_shared_timetable_group(payload["slug"]),
        {"type": "timetable_update", "payload": payload},
    )


def broadcast_presence_payload(slug, peers):
    payload = {
        "type": "presence.sync",
        "slug": slug,
        "peers": peers,
        "updatedAt": timezone.now().isoformat(),
    }
    broadcast_shared_timetable_payload(payload)


def _refresh_shared_timetable_snapshot(shared_timetable, source_timetable):
    shared_timetable.school = source_timetable.school
    shared_timetable.semester = source_timetable.semester
    shared_timetable.has_conflict = source_timetable.has_conflict
    shared_timetable.revision = shared_timetable.revision + 1
    shared_timetable.courses.set(source_timetable.courses.all())
    shared_timetable.sections.set(source_timetable.sections.all())
    shared_timetable.save(update_fields=["school", "semester", "has_conflict", "revision"])


def sync_and_broadcast_shared_timetables_for_source(source_timetable):
    if not ENABLE_SOCIAL_SYNC_GHOST:
        return
    from analytics.models import SharedTimetable

    shared_timetables = SharedTimetable.objects.filter(
        source_timetable=source_timetable, revoked_at__isnull=True
    )
    for shared_timetable in shared_timetables:
        _refresh_shared_timetable_snapshot(shared_timetable, source_timetable)
        payload = build_shared_timetable_payload(shared_timetable)
        broadcast_shared_timetable_payload(payload)
