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

from django.conf.urls import include, re_path

import authpipe.views


urlpatterns = [
    # auth
    re_path("", include("social_django.urls", namespace="social")),
    re_path("", include(("django.contrib.auth.urls", "auth"), namespace="auth")),
    re_path(r"^saml/metadata$", authpipe.views.saml_metadata_view),
]
