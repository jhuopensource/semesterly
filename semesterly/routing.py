from django.urls import re_path

from timetable.consumers import SharedTimetableConsumer

websocket_urlpatterns = [
    re_path(
        r"^ws/timetables/links/(?P<slug>[^/]+)/$",
        SharedTimetableConsumer.as_asgi(),
    ),
]
