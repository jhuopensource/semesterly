# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2019-02-06 15:46
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('timetable', '0024_course_pos'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='course',
            name='areas',
        ),
    ]
