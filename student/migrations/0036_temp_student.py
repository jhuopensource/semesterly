# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2021-03-04 16:52
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('student', '0035_temp'),
    ]

    operations = [
        migrations.AddField(
            model_name='temp',
            name='student',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='student.Student'),
        ),
    ]
