"""
Copyright (C) 2017 Semester.ly Technologies, LLC

Semester.ly is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Semester.ly is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
"""

# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2017-03-12 00:25
from __future__ import unicode_literals
from operator import attrgetter

from django.db import migrations

from timetable.update_semester_field import get_update_operation

tables_to_update = [
  'SharedTimetable',
  'AnalyticsTimetable',
  'AnalyticsCourseSearch',
]

class Migration(migrations.Migration):

    dependencies = [
        ('analytics', '0012_auto_20170311_1924'),
    ]

    operations = [
      migrations.RunPython(get_update_operation('analytics', 
                                                tables_to_update,
                                                attrgetter('school'))),
    ]
