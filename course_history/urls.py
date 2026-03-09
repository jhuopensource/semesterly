from django.urls import re_path
from course_history.views import csrf_cookie_view, TranscriptUploadView

urlpatterns = [
    re_path(r"^transcript/$", csrf_cookie_view, name="get_csrf"),
    re_path(
        r"^transcript/upload/$",
        TranscriptUploadView.as_view(),
        name="transcript_upload",
    ),
]
