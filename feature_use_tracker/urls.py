from django.urls import re_path
from .views import FeatureUseView, csrf_cookie_view

urlpatterns = [
    re_path(r"^feature_use/csrf/$", csrf_cookie_view, name="feature_use_get_csrf"),
    re_path(r"^feature_use/$", FeatureUseView.as_view(), name="feature_use"),
]
