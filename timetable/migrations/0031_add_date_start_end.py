# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2019-10-15 15:23
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timetable', '0030_add_pilot_s19'),
    ]

    operations = [
        migrations.AddField(
            model_name='offering',
            name='date_end',
            field=models.CharField(max_length=15, null=True),
        ),
        migrations.AddField(
            model_name='offering',
            name='date_start',
            field=models.CharField(max_length=15, null=True),
        ),
    ]
