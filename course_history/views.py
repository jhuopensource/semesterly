from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import ensure_csrf_cookie
import fitz
import logging
import tempfile
import re


@ensure_csrf_cookie
def csrf_cookie_view(request):
    return JsonResponse({"detail": "CSRF cookie set"})


# structure: "name" + "as.xxx.xxx / en.xxx.xxx / tr.xxx.xxx"
def parse_transfer_course(text):
    matches = re.findall(r"\b((EN|AS|TR)\.\d{3}\.\d{3}\b)", text)
    course_ids = [f"{match[0]}" for match in matches]
    return course_ids


# structure: "en / as" + "dept" + "xxx.xxx"
def parse_hopkins_course(text):
    regex = r"(EN|AS)\n*.*\n.*\s(\d{3}\.\d{3})"
    matches = re.findall(regex, text)
    course_ids = [f"{match[0]}.{match[1]}" for match in matches]
    return course_ids


class TranscriptUploadView(View):
    # reads in all courses from transcript and saves as a json file
    def get_course_history(self, file):
        courses = []
        try:
            file.seek(0)
            with fitz.open(stream=file.read(), filetype="pdf") as transcript:
                for page in transcript:
                    text = page.get_text("text")
                    courses.extend(parse_transfer_course(text))
                    courses.extend(parse_hopkins_course(text))
        except Exception as e:
            raise
        return sorted(courses)

    def post(self, request):
        if not request.FILES:
            return JsonResponse({"error": "No file uploaded"}, status=400)
        uploaded_file = request.FILES.get("file")

        # validate the uploaded file
        if not uploaded_file:
            return JsonResponse({"error": "No file uploaded"}, status=400)
        if not uploaded_file.name.endswith(".pdf"):
            return JsonResponse({"error": "File is not a PDF"}, status=400)

        try:
            courses = self.get_course_history(uploaded_file)
            return JsonResponse(
                {
                    "status": "success",
                    "message": "File processed successfully",
                    "courses": courses,
                },
                status=200,
            )
        except Exception as e:
            return JsonResponse(
                {"error": "Internal server error", "details": str(e)}, status=500
            )
