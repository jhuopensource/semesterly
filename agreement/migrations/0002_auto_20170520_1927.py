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
# Generated by Django 1.9.2 on 2017-05-21 00:27


from datetime import datetime

from django.db import migrations


def load_agreement(apps, schema_editor):
    agreement_model = apps.get_model("agreement", "Agreement")
    agreement_model.objects.create(last_updated=datetime.now())


class Migration(migrations.Migration):

    dependencies = [
        ("agreement", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(load_agreement),
    ]
