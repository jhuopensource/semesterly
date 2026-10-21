import re

from django.http import Http404
from hashids import Hashids

from analytics.models import SharedTimetable
from semesterly.settings import get_secret

hashids = Hashids(salt=get_secret("HASHING_SALT"))
HASHID_PATTERN = re.compile(r"^[A-Za-z0-9]+$")


def get_shared_timetable_slug(shared_timetable):
    if shared_timetable.share_token:
        return shared_timetable.share_token
    return hashids.encrypt(shared_timetable.id)


def resolve_shared_timetable_by_slug(slug, school):
    by_token = SharedTimetable.objects.filter(share_token=slug, school=school).first()
    if by_token is not None:
        return by_token

    if not HASHID_PATTERN.match(slug):
        raise Http404

    decoded = hashids.decrypt(slug)
    if not decoded:
        raise Http404

    timetable_id = decoded[0]
    try:
        return SharedTimetable.objects.get(id=timetable_id, school=school)
    except SharedTimetable.DoesNotExist as exc:
        raise Http404 from exc
