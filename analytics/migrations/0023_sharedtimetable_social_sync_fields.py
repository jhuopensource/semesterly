from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("student", "0046_delete_registrationtoken"),
        ("analytics", "0022_uierrorlog_squashed_0024_alter_uierrorlog_options"),
    ]

    operations = [
        migrations.AddField(
            model_name="sharedtimetable",
            name="updated_at",
            field=models.DateTimeField(auto_now=True, null=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="sharedtimetable",
            name="source_timetable",
            field=models.ForeignKey(
                blank=True,
                default=None,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="shared_timetables",
                to="student.personaltimetable",
            ),
        ),
        migrations.AddField(
            model_name="sharedtimetable",
            name="share_token",
            field=models.CharField(
                blank=True, db_index=True, max_length=64, null=True, unique=True
            ),
        ),
        migrations.AddField(
            model_name="sharedtimetable",
            name="permission",
            field=models.CharField(
                choices=[("view", "View"), ("edit", "Edit")],
                default="view",
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="sharedtimetable",
            name="expires_at",
            field=models.DateTimeField(blank=True, default=None, null=True),
        ),
        migrations.AddField(
            model_name="sharedtimetable",
            name="revoked_at",
            field=models.DateTimeField(blank=True, default=None, null=True),
        ),
    ]
