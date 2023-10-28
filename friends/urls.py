from django.urls import path
from friends.views import send_friend_request, accept_friend_request, reject_friend_request
urlpatterns = [
path('send_friend_request/<int:userId>/', send_friend_request, name="send friend request"),
path('accept_friend_request/<int:friendRequestId>/', accept_friend_request, name="accept friend request"),
path('reject_friend_request/<int:friendRequestId>/', reject_friend_request, name="reject friend request"),
]

