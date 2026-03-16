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

from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _

class Feature(models.TextChoices):
        COMPARE_TIMETABLES = "CT", _("Compare Timetables")
        SIS_ADD_TO_CART = "SATC", _("SIS Add To Cart")
        SCREENSHOT = "SS", _("Screenshot")
        CUSTOM_EVENT = "CE", _("Custom Event")
        DRAG_SEARCH = "DS", _("Custom Event")
        EXPORT_TIMETABLE_TO_CALENDAR = "ETTC", _("Export Timetable to Calendar")
        FRIENDS = "F", _("Friends")
        ADVANCED_SEARCH = "AS", _("Advanced Search")
        COURSE_OPTIMIZER = "CO", _("Course Optimizer")


class FeatureUse(models.Model):
    """Database object containing indicators which provide information about whether
        a User has used a certain feature or not
    """
    user = models.OneToOneField(User, on_delete=models.deletion.CASCADE)
    feature_name = models.CharField(max_length=4, choices=Feature)
    time_used = models.DateTimeField(auto_now_add=True)