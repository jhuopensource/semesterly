from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .chatbot import get_chatbot_response, advanced_course_search_from_view
from searches.utils import search


class ChatbotQueryView(APIView):
    def post(self, request):
        query = request.data.get("query")
        if not query:
            return Response(
                {"error": "No query provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        subdomain = request.subdomain
        sem_name = request.data.get("sem_name") or None
        year = request.data.get("year") or None

        response = get_chatbot_response(query, subdomain, sem_name, year)

        return Response(
            {"response": response["response"], "tool_output": response["tool_output"]},
            status=status.HTTP_200_OK,
        )


class ChatbotSearchCoursesView(APIView):
    def post(self, request):
        query = request.data.get("query", "").strip()
        page = int(request.data.get("page", 1))
        limit = int(request.data.get("limit", 5))
        sem_name = request.data.get("sem_name", "").strip() or None
        year = request.data.get("year") or None
        school = request.subdomain

        if len(query) <= 1:
            return Response({"data": [], "page": page}, status=status.HTTP_200_OK)

        try:
            result = advanced_course_search_from_view(
                query=query,
                sem_name=sem_name,
                year=year,
                filters={},
                school=school,
                page=page,
                limit=limit,
            )

            return Response(
                {"data": result["data"], "page": page}, status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
