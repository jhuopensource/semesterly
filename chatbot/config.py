def get_system_prompt():
    return (
        "You are a helpful university course assistant. When a user asks about courses, your job is to extract the key topic (e.g., 'AI', 'history', 'creative writing'), "
        "the semester (Fall, Spring, Summer, or Intersession), and the year, and pass them to the `advanced_course_search` function. "
        "Only use this tool if a course-related search is clearly requested.\n\n"
        "If the user includes filters, capture them:\n"
        "- If a department is mentioned (e.g., 'CS', 'biology'), use the `departments` filter.\n"
        "- If a course level is mentioned (e.g., 'intro', 'upper-level', 'graduate'), use the `levels` filter.\n"
        "- If days and times are mentioned (e.g., 'Monday mornings', 'classes after 3pm'), map to `times` using:\n"
        "    - 'day': full day name (e.g., 'Tuesday')\n"
        "    - 'min' and 'max': times in minutes after midnight (e.g., 540 = 9:00am, 1020 = 5:00pm)\n"
        "- If a distribution area is mentioned (e.g., 'Humanities', 'Sciences'), use the `areas` filter.\n\n"
        "Avoid using generic terms like 'courses', 'classes', or 'subjects' in the `query` field—extract the real topic of interest.\n"
        "If the query is vague or too broad (e.g., 'good classes', 'easy A'), ask a clarifying follow-up question instead of using the tool.\n\n"
        "If the tool call returns more than 5 courses, summarize the results and ask the user how they want to narrow it down (e.g., department, time, level).\n"
        "If no results are found, respond politely and suggest trying another query.\n"
        "Do not list courses in your reply — the UI will show them. Keep your responses short, relevant, and polite."
    )


def get_tool_schema():
    return {
        "type": "function",
        "function": {
            "name": "advanced_course_search",
            "description": "Query-based search for courses with optional filters like department, level, or meeting time.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Main keyword or topic to search courses by (e.g., 'AI', 'economics', 'machine learning').",
                    },
                    "sem_name": {
                        "type": "string",
                        "description": "Semester name, such as Fall, Spring, Summer, or Intersession.",
                    },
                    "year": {
                        "type": "string",
                        "description": "Year of the semester, e.g., 2025.",
                    },
                    "filters": {
                        "type": "object",
                        "description": "Optional filters to narrow the course search.",
                        "properties": {
                            "departments": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Department codes, e.g., ['CS', 'MATH', 'BIO']",
                            },
                            "levels": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Course levels, e.g., ['100', '200', 'graduate']",
                            },
                            "areas": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Distribution areas or categories, e.g., ['Humanities', 'Natural Sciences']",
                            },
                            "times": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "day": {
                                            "type": "string",
                                            "description": "Day of the week, e.g., 'Monday', 'Tuesday'",
                                        },
                                        "min": {
                                            "type": "integer",
                                            "description": "Earliest start time in minutes after midnight (e.g., 540 = 9:00am)",
                                        },
                                        "max": {
                                            "type": "integer",
                                            "description": "Latest end time in minutes after midnight (e.g., 1020 = 5:00pm)",
                                        },
                                    },
                                    "required": ["day", "min", "max"],
                                },
                                "description": "List of preferred class meeting times",
                            },
                        },
                    },
                    "page": {
                        "type": "integer",
                        "default": 1,
                        "description": "Pagination: which page of results to return",
                    },
                    "limit": {
                        "type": "integer",
                        "default": 10,
                        "description": "Number of results per page",
                    },
                },
                "required": ["query"],
            },
        },
    }
