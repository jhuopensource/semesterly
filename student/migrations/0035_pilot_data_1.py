from __future__ import unicode_literals

from django.db import migrations, models
from timetable.models import Integration, Course, Semester, Section, CourseIntegration


def add_data(apps, schema_editor):

	pilot_codes = [
		"AS.110.106",
		"AS.110.107",
		"AS.110.109",
		"AS.110.202",
		"AS.110.201",
		"AS.110.302",
		"EN.553.171",
		"EN.500.112",
		"EN.553.111",
		"EN.553.112",
		"AS.280.350",
		"AS.030.102",
		"AS.030.206",
		"AS.180.102",
		"AS.171.101",
		"AS.171.102",
		"AS.171.104",
		"AS.171.108"
	]

	integration, created = Integration.objects.get_or_create(name="PILOT")
	integration.save()
	PilotOffering = apps.get_model('student', 'PilotOffering')



	if Semester.objects.filter(year="2020", name="Spring").exists():
		s20 = Semester.objects.get(year="2020", name="Spring")
		#SPANISH ELEMENTS 2
		if Course.objects.filter(school="jhu", code="AS.210.112").exists():
			course = Course.objects.get(school="jhu", code="AS.210.112")
			courseint, created = CourseIntegration.objects.get_or_create(course_id=course.id, integration_id=integration.id)
			courseint.semester.add(s20)
			courseint.save()
			if Section.objects.filter(course_id=course.id, semester=s20).exists():
				sections = list(Section.objects.filter(course_id=course.id, semester=s20))
				for section in sections:
					offering1, created = PilotOffering.objects.get_or_create(day='W', time_start="6:00pm", time_end="7:30pm", size=12, course_name=course.name)
					offering1.sections.add(section.id)
					offering1.save()
					offering2, created = PilotOffering.objects.get_or_create(day='T', time_start="6:30pm", time_end="8:00pm", size=12,course_name=course.name)
					offering2.sections.add(section.id)
					offering2.save()
		#CALC 1 BIO
		if Course.objects.filter(school="jhu", code="AS.110.106").exists():
			course = Course.objects.get(school="jhu", code="AS.110.106")
			courseint, created = CourseIntegration.objects.get_or_create(course_id=course.id, integration_id=integration.id)
			courseint.semester.add(s20)
			courseint.save()
			if Section.objects.filter(course_id=course.id, semester=s20).exists():
				sections = list(Section.objects.filter(course_id=course.id, semester=s20))
				for section in sections:
					offering1, created = PilotOffering.objects.get_or_create(day='M', time_start="5:30pm", time_end="7:00pm", size=12, course_name=course.name)
					offering1.sections.add(section.id)
					offering1.save()
					offering2, created = PilotOffering.objects.get_or_create(day='T', time_start="6:00pm", time_end="7:30pm", size=12,course_name=course.name)
					offering2.sections.add(section.id)
					offering2.save()
		#CALC 2 BIO
		if Course.objects.filter(school="jhu", code="AS.110.107").exists():
			course = Course.objects.get(school="jhu", code="AS.110.107")
			courseint, created = CourseIntegration.objects.get_or_create(course_id=course.id, integration_id=integration.id)
			courseint.semester.add(s20)
			courseint.save()
			if Section.objects.filter(course_id=course.id, semester=s20).exists():
				sections = list(Section.objects.filter(course_id=course.id, semester=s20))
				for section in sections:
					offering1, created = PilotOffering.objects.get_or_create(day='M', time_start="5:00pm", time_end="6:30pm", size=10, course_name=course.name)
					offering1.sections.add(section.id)
					offering1.save()
					offering2, created = PilotOffering.objects.get_or_create(day='M', time_start="6:30pm", time_end="8:00pm", size=20,course_name=course.name)
					offering2.sections.add(section.id)
					offering2.save()
					offering3, created = PilotOffering.objects.get_or_create(day='W', time_start="7:30pm", time_end="9:00pm", size=10,course_name=course.name)
					offering3.sections.add(section.id)
					offering3.save()
					offering4, created = PilotOffering.objects.get_or_create(day='Th', time_start="7:30pm", time_end="9:00pm", size=10,course_name=course.name)
					offering4.sections.add(section.id)
					offering4.save()
					offering5, created = PilotOffering.objects.get_or_create(day='Th', time_start="7:00pm", time_end="8:30pm", size=10,course_name=course.name)
					offering5.sections.add(section.id)
					offering5.save()
					offering6, created = PilotOffering.objects.get_or_create(day='Th', time_start="8:00pm", time_end="9:30pm", size=10,course_name=course.name)
					offering6.sections.add(section.id)
					offering6.save()
		#CALC 2 ENGINEERING
		if Course.objects.filter(school="jhu", code="AS.110.109").exists():
			course = Course.objects.get(school="jhu", code="AS.110.109")
			courseint, created = CourseIntegration.objects.get_or_create(course_id=course.id, integration_id=integration.id)
			courseint.semester.add(s20)
			courseint.save()
			if Section.objects.filter(course_id=course.id, semester=s20).exists():
				sections = list(Section.objects.filter(course_id=course.id, semester=s20))
				for section in sections:
					offering1, created = PilotOffering.objects.get_or_create(day='M', time_start="6:00pm", time_end="7:30pm", size=10, course_name=course.name)
					offering1.sections.add(section.id)
					offering1.save()
					offering2, created = PilotOffering.objects.get_or_create(day='M', time_start="6:30pm", time_end="8:00pm", size=9,course_name=course.name)
					offering2.sections.add(section.id)
					offering2.save()
					offering3, created = PilotOffering.objects.get_or_create(day='M', time_start="7:00pm", time_end="8:30pm", size=10, course_name=course.name)
					offering3.sections.add(section.id)
					offering3.save()
					offering4, created = PilotOffering.objects.get_or_create(day='M', time_start="7:30pm", time_end="9:00pm", size=10,course_name=course.name)
					offering4.sections.add(section.id)
					offering4.save()

					offering5, created = PilotOffering.objects.get_or_create(day='T', time_start="6:00pm", time_end="7:30pm", size=10,course_name=course.name)
					offering5.sections.add(section.id)
					offering5.save()
					offering6, created = PilotOffering.objects.get_or_create(day='T', time_start="7:00pm", time_end="8:30pm", size=10,course_name=course.name)
					offering6.sections.add(section.id)
					offering6.save()
					offering7, created = PilotOffering.objects.get_or_create(day='T', time_start="7:30pm", time_end="9:00pm", size=10,course_name=course.name)
					offering7.sections.add(section.id)
					offering7.save()
					offering8, created = PilotOffering.objects.get_or_create(day='T', time_start="8:30pm", time_end="10:00pm", size=8,course_name=course.name)
					offering8.sections.add(section.id)
					offering8.save()

					offering3, created = PilotOffering.objects.get_or_create(day='W', time_start="5:00pm", time_end="6:30pm", size=10,course_name=course.name)
					offering3.sections.add(section.id)
					offering3.save()
					offering3, created = PilotOffering.objects.get_or_create(day='W', time_start="6:30pm", time_end="8:00pm", size=10,course_name=course.name)
					offering3.sections.add(section.id)
					offering3.save()
					offering3, created = PilotOffering.objects.get_or_create(day='W', time_start="7:00pm", time_end="8:30pm", size=9,course_name=course.name)
					offering3.sections.add(section.id)
					offering3.save()

					offering4, created = PilotOffering.objects.get_or_create(day='Th', time_start="7:00pm", time_end="8:30pm", size=10,course_name=course.name)
					offering4.sections.add(section.id)
					offering4.save()

		#CALC 3
		if Course.objects.filter(school="jhu", code="AS.110.202").exists():
			course = Course.objects.get(school="jhu", code="AS.110.202")
			courseint, created = CourseIntegration.objects.get_or_create(course_id=course.id, integration_id=integration.id)
			courseint.semester.add(s20)
			courseint.save()
			if Section.objects.filter(course_id=course.id, semester=s20).exists():
				sections = list(Section.objects.filter(course_id=course.id, semester=s20))
				for section in sections:
					offering1, created = PilotOffering.objects.get_or_create(day='M', time_start="6:30pm", time_end="8:00pm", size=22,course_name=course.name)
					offering1.sections.add(section.id)
					offering1.save()
					offering2, created = PilotOffering.objects.get_or_create(day='M', time_start="7:00pm", time_end="8:30pm", size=11, course_name=course.name)
					offering2.sections.add(section.id)
					offering2.save()
					offering3, created = PilotOffering.objects.get_or_create(day='M', time_start="8:30pm", time_end="10:00pm", size=11,course_name=course.name)
					offering3.sections.add(section.id)
					offering3.save()
					offering4, created = PilotOffering.objects.get_or_create(day='T', time_start="6:30pm", time_end="8:00pm", size=11,course_name=course.name)
					offering4.sections.add(section.id)
					offering4.save()
					offering5, created = PilotOffering.objects.get_or_create(day='T', time_start="7:00pm", time_end="8:30pm", size=11, course_name=course.name)
					offering5.sections.add(section.id)
					offering5.save()
					offering6, created = PilotOffering.objects.get_or_create(day='W', time_start="8:30pm", time_end="10:00pm", size=11,course_name=course.name)
					offering6.sections.add(section.id)
					offering6.save()
					offering7, created = PilotOffering.objects.get_or_create(day='Th', time_start="6:00pm", time_end="7:30pm", size=22, course_name=course.name)
					offering7.sections.add(section.id)
					offering7.save()
					offering8, created = PilotOffering.objects.get_or_create(day='Th', time_start="7:00pm", time_end="8:30pm", size=11, course_name=course.name)
					offering8.sections.add(section.id)
					offering8.save()
					offering9, created = PilotOffering.objects.get_or_create(day='Th', time_start="7:30pm", time_end="9:00pm", size=10,course_name=course.name)
					offering9.sections.add(section.id)
					offering9.save()
					offering10, created = PilotOffering.objects.get_or_create(day='Th', time_start="8:30pm", time_end="10:00pm", size=22,course_name=course.name)
					offering10.sections.add(section.id)
					offering10.save()

		#Linear Algebra
		if Course.objects.filter(school="jhu", code="AS.110.202").exists():
			course = Course.objects.get(school="jhu", code="AS.110.202")
			courseint, created = CourseIntegration.objects.get_or_create(course_id=course.id, integration_id=integration.id)
			courseint.semester.add(s20)
			courseint.save()
			if Section.objects.filter(course_id=course.id, semester=s20).exists():
				sections = list(Section.objects.filter(course_id=course.id, semester=s20))
				for section in sections:
					offering1, created = PilotOffering.objects.get_or_create(day='M', time_start="6:00pm", time_end="7:30pm", size=10, course_name=course.name)
					offering1.sections.add(section.id)
					offering1.save()
					offering2, created = PilotOffering.objects.get_or_create(day='M', time_start="7:30pm", time_end="9:00pm", size=10,course_name=course.name)
					offering2.sections.add(section.id)
					offering2.save()
					offering3, created = PilotOffering.objects.get_or_create(day='M', time_start="8:00pm", time_end="9:30pm", size=10,course_name=course.name)
					offering3.sections.add(section.id)
					offering3.save()
					offering4, created = PilotOffering.objects.get_or_create(day='T', time_start="8:30pm", time_end="10:00pm", size=10,course_name=course.name)
					offering4.sections.add(section.id)
					offering4.save()
					offering5, created = PilotOffering.objects.get_or_create(day='W', time_start="7:30pm", time_end="9:00pm", size=7,course_name=course.name)
					offering5.sections.add(section.id)
					offering5.save()
					offering6, created = PilotOffering.objects.get_or_create(day='Th', time_start="6:00pm", time_end="7:30pm", size=10,course_name=course.name)
					offering6.sections.add(section.id)
					offering6.save()
					offering7, created = PilotOffering.objects.get_or_create(day='Th', time_start="7:00pm", time_end="8:30pm", size=10, course_name=course.name)
					offering7.sections.add(section.id)
					offering7.save()
					offering8, created = PilotOffering.objects.get_or_create(day='Th', time_start="7:30pm", time_end="9:00pm", size=10, course_name=course.name)
					offering8.sections.add(section.id)
					offering8.save()

		#DiffEq
		if Course.objects.filter(school="jhu", code="AS.110.302").exists():
			course = Course.objects.get(school="jhu", code="AS.110.302")
			courseint, created = CourseIntegration.objects.get_or_create(course_id=course.id, integration_id=integration.id)
			courseint.semester.add(s20)
			courseint.save()
			if Section.objects.filter(course_id=course.id, semester=s20).exists():
				sections = list(Section.objects.filter(course_id=course.id, semester=s20))
				for section in sections:
					offering1, created = PilotOffering.objects.get_or_create(day='M', time_start="6:00pm", time_end="7:30pm", size=20, course_name=course.name)
					offering1.sections.add(section.id)
					offering1.save()
					offering2, created = PilotOffering.objects.get_or_create(day='M', time_start="7:00pm", time_end="8:30pm", size=10, course_name=course.name)
					offering2.sections.add(section.id)
					offering2.save()
					offering3, created = PilotOffering.objects.get_or_create(day='M', time_start="8:30pm", time_end="10:00pm", size=10,course_name=course.name)
					offering3.sections.add(section.id)
					offering3.save()
					offering4, created = PilotOffering.objects.get_or_create(day='T', time_start="5:30pm", time_end="7:00pm", size=10,course_name=course.name)
					offering4.sections.add(section.id)
					offering4.save()
					offering5, created = PilotOffering.objects.get_or_create(day='W', time_start="6:00pm", time_end="7:30pm", size=10, course_name=course.name)
					offering5.sections.add(section.id)
					offering5.save()
					offering6, created = PilotOffering.objects.get_or_create(day='W', time_start="8:30pm", time_end="10:00pm", size=10,course_name=course.name)
					offering6.sections.add(section.id)
					offering6.save()


class Migration(migrations.Migration):

	dependencies = [
		('student', '0034_merge'),
	]

	operations = [
		migrations.RunPython(add_data)
	]