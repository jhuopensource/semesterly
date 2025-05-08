import json
import requests
from semesterly.settings import get_secret
from timetable.models import Semester
from searches.utils import search
from courses.serializers import CourseSearchSerializer
from django.core.paginator import Paginator, EmptyPage
from datetime import datetime
from searches.views import CourseSearchList
from .config import get_system_prompt, get_tool_schema


def advanced_course_search_from_view(
    query, sem_name, year, filters, school, page=1, limit=10
):
    sem_name = sem_name.capitalize().strip() if sem_name else None

    if not sem_name or not year:
        latest = get_latest_semester()
        if not latest:
            raise ValueError("No semesters available.")
        sem_name = sem_name or latest.name
        year = year or latest.year

    sem = Semester.objects.filter(name=sem_name, year=year).first()
    if not sem:
        raise ValueError(f"Semester '{sem_name} {year}' not found")

    if not school:
        raise ValueError("Missing school/subdomain for search")

    # Call the same search engine as the view
    course_matches = search(school, query, sem)

    # Instantiate the view just to reuse filter logic
    view = CourseSearchList()
    course_matches = view.filter_course_matches(course_matches, filters, sem)
    course_matches = course_matches[:100]

    # Pagination
    paginator = Paginator(course_matches, limit)
    try:
        paginated_data = paginator.page(page)
    except EmptyPage:
        return {"data": [], "page": page}

    # Serialization (you can switch to CourseSerializer if needed)
    serialized = CourseSearchSerializer(
        paginated_data, context={"semester": sem, "school": school}, many=True
    ).data

    return {
        "data": serialized,
        "page": page,
        "total_courses": paginator.count,
        "total_pages": paginator.num_pages,
    }


def get_chatbot_response(query, subdomain, default_sem_name=None, default_year=None):

    API_KEY = get_secret("OPENAI_API_KEY")

    URL = "https://api.openai.com/v1/chat/completions"

    prompt = {"role": "system", "content": get_system_prompt()}

    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

    tools = [get_tool_schema()]

    data = {
        "model": "gpt-3.5-turbo",
        "messages": [prompt, {"role": "user", "content": query}],
        "tools": tools,
        "tool_choice": "auto",
    }

    try:
        initial_response = requests.post(URL, headers=headers, json=data)
        initial_response.raise_for_status()

        # Extract chatbot response from the JSON
        data = initial_response.json()
        gpt_message = data["choices"][0]["message"]
        print("Initial response: ", gpt_message)

        if "tool_calls" in gpt_message:
            tool_call = gpt_message["tool_calls"][0]
            tool_name = tool_call["function"]["name"]
            tool_args = json.loads(tool_call["function"]["arguments"])

            if tool_name == "advanced_course_search":
                print("Query: ", query)
                tool_output = advanced_course_search_from_view(
                    query=tool_args["query"],
                    sem_name=tool_args.get("sem_name"),
                    year=tool_args.get("year"),
                    filters=tool_args.get("filters", {}),
                    page=tool_args.get("page", 1),
                    limit=tool_args.get("limit", 10),
                    school=subdomain,
                )
                print("Tool output: ", tool_output)

            # Add tool output and send it back to GPT
            followup_response = requests.post(
                URL,
                headers=headers,
                json={
                    "model": "gpt-4-0613",
                    "messages": [
                        prompt,
                        gpt_message,
                        {
                            "role": "tool",
                            "tool_call_id": tool_call["id"],
                            "name": tool_name,
                            "content": json.dumps(tool_output),
                        },
                    ],
                },
            )

            followup_response.raise_for_status()
            final = followup_response.json()
            return {
                "response": final["choices"][0]["message"]["content"],
                "tool_output": tool_output,
                "used_sem_name": tool_args.get("sem_name"),
                "used_year": tool_args.get("year"),
            }

        return {"response": gpt_message.get("content", ""), "tool_output": None}

    except requests.exceptions.RequestException as e:
        print("Error:", e)
        return {
            "response": "Sorry, I couldn't process your request right now.",
            "tool_output": None,
        }
