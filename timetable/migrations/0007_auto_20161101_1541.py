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
# Generated by Django 1.9.2 on 2016-11-01 20:41
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timetable', '0006_merge'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='areas',
            field=models.CharField(default=b'', max_length=600, null=True),
        ),
    ]
