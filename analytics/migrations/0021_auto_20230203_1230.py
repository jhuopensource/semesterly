# Generated by Django 3.2.12 on 2023-02-03 17:30

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("analytics", "0020_delete_finalexammodalview"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="facebookalertview",
            name="student",
        ),
        migrations.DeleteModel(
            name="FacebookAlertClick",
        ),
        migrations.DeleteModel(
            name="FacebookAlertView",
        ),
    ]
