# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2021-02-28 23:01
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('student', '0037_auto_20210223_1507'),
    ]

    operations = [
        migrations.CreateModel(
            name='MockModel',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('mock_one', models.IntegerField(blank=True, null=True)),
                ('mock_two', models.CharField(default=-1, max_length=300)),
                ('mock_three', models.NullBooleanField()),
            ],
        ),
    ]
