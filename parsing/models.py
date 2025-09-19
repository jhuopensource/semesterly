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

from datetime import datetime
from django.db import models
from django.core.exceptions import ValidationError
from collections import OrderedDict
from timetable.models import Semester


class DataUpdate(models.Model):
    """
    Stores the date/time that the school's data was last updated.

    Scheduled updates occur when digestion into the database completes.

    Attributes:
        school (CharField): the school code that was updated (e.g. jhu)
        semester (:obj:`ForeignKey` to :obj:`Semester`): the semester for the
            update
        last_updated (DateTimeField): the datetime last updated
        reason (CharField): the reason it was updated
            (default Scheduled Update)
        update_type (CharField): which field was updated
        UPDATE_TYPE (:obj:`tuple` of :obj:`tuple`): Update types allowed.
        COURSES (str): Update type.
        EVALUATIONS (str): Update type.
        MISCELLANEOUS (str): Update type.
    """

    COURSES = "C"
    EVALUATIONS = "E"
    MISCELLANEOUS = "M"
    UPDATE_TYPE = (
        (COURSES, "courses"),
        (EVALUATIONS, "evaluations"),
        (MISCELLANEOUS, "miscellaneous"),
    )

    school = models.CharField(max_length=100)
    semester = models.ForeignKey(Semester, on_delete=models.deletion.CASCADE)
    timestamp = models.DateTimeField(auto_now=True)
    reason = models.CharField(max_length=200, default="Scheduled Update")
    update_type = models.CharField(
        max_length=1, choices=UPDATE_TYPE, default=MISCELLANEOUS
    )


class DataUpdateSettings(models.Model):
    """
    Stores the settings for the data update used by the ingestion process
    and configures the active semesters users allowed to see.

    Attributes:
        year (IntegerField): the year the parser ingesting courses is for
        term (CharField): the term the parser ingesting courses is for
        active (BooleanField): whether to run the parser

        min_allowed_year (IntegerField): the minimum year the user can select in the UI
        min_allowed_term (CharField): the minimum term the user can select in the UI
        max_allowed_year (IntegerField): the maximum year the user can select in the UI
        max_allowed_term (CharField): the maximum term the user can select in the UI
    """

    SPRING = "Spring"
    FALL = "Fall"
    TERM_CHOICES = [
        (SPRING, "Spring"),
        (FALL, "Fall"),
    ]

    term = models.CharField(
        max_length=10,
        choices=TERM_CHOICES,
        default=FALL,
        help_text="Select either Spring or Fall term",
    )

    year = models.IntegerField()
    active = models.BooleanField(default=True)

    # the min and max terms user can select in the UI
    min_allowed_year = models.IntegerField(default=2020)
    min_allowed_term = models.CharField(
        max_length=10,
        choices=TERM_CHOICES,
        default=FALL,
        help_text="Select either Spring or Fall term",
    )
    max_allowed_year = models.IntegerField(default=datetime.now().year)
    max_allowed_term = models.CharField(
        max_length=10,
        choices=TERM_CHOICES,
        default=FALL,
        help_text="Select either Spring or Fall term",
    )

    def save(self, *args, **kwargs):
        if not self.pk and DataUpdateSettings.objects.exists():
            # If trying to create a new object while one exists, update the existing one
            return DataUpdateSettings.objects.first()
        return super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        exists = cls.objects.exists()
        if not exists:
            cls.objects.create(year=datetime.now().year, term="Spring", active=True)

        return cls.objects.first()

    def clean(self):
        super().clean()
        if self.term not in [self.SPRING, self.FALL]:
            raise ValidationError({"term": "Term must be either Spring or Fall"})

        # Validate min and max allowed years
        if self.min_allowed_year > self.max_allowed_year:
            raise ValidationError(
                {
                    "min_allowed_year": "Minimum allowed year cannot be greater than maximum allowed year",
                    "max_allowed_year": "Maximum allowed year cannot be less than minimum allowed year",
                }
            )

        # Validate years are in 2000s
        if not (2000 <= self.min_allowed_year <= 2099):
            raise ValidationError(
                {"min_allowed_year": "Year must be between 2000 and 2099"}
            )

        if not (2000 <= self.max_allowed_year <= 2099):
            raise ValidationError(
                {"max_allowed_year": "Year must be between 2000 and 2099"}
            )

    def get_active_semesters(self):
        """
        Returns an OrderedDict of active semesters based on the model's settings.
        The format matches the config.json structure with years as keys and lists of terms as values.
        Fall terms appear before Spring terms in the list.
        """
        from collections import OrderedDict

        active_semesters = OrderedDict()

        # Generate semesters from min to max year
        for year in range(self.min_allowed_year, self.max_allowed_year + 1):
            terms = []

            # For each year, determine which terms should be included
            if year == self.min_allowed_year:
                # For min year, only include terms from min_term onwards
                if self.min_allowed_term == self.SPRING:
                    terms = [self.FALL, self.SPRING]
                else:
                    terms = [self.FALL]
            elif year == self.max_allowed_year:
                # For max year, only include terms up to max_term
                if self.max_allowed_term == self.FALL:
                    terms = [self.FALL, self.SPRING]
                else:
                    terms = [self.SPRING]
            else:
                # For years in between, include both terms
                terms = [self.FALL, self.SPRING]

            if terms:
                active_semesters[str(year)] = terms

        return active_semesters

    class Meta:
        verbose_name = "Data Update Settings"
        verbose_name_plural = "Data Update Settings"
