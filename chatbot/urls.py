from django.urls import path
from .views import ChatbotQueryView, ChatbotSearchCoursesView

urlpatterns = [
    path("query/", ChatbotQueryView.as_view(), name="chatbot-query"),
    path("search/", ChatbotSearchCoursesView.as_view(), name="chatbot-search"),
]
