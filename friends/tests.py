from django.test import TestCase
from django.urls import reverse
from .models import FriendRequest
from .models import Student
from helpers.test.utils import (
    create_user,
    create_student,
    get_response,
    get_auth_response,
)
from rest_framework.test import APITestCase
from friends.views import send_friend_request, accept_friend_request, reject_friend_request
# Create your tests here.


class FriendRequestTest(APITestCase):
    def setUp(self):
        self.user1 = create_user(username="Alice", password="security")
        self.student1 = create_student(user=self.user1)
        self.user2 = create_user(username="Bob", password="security2")
        self.student2 = create_student(user=self.user2)
        
    def test_send_request(self):
        self.client.force_login(self.user1)
        response = self.client.post(reverse("send friend request", args=[self.student1.id]))
        self.assertEquals(response.status_code, 200)
        self.assertEqual(1, len(FriendRequest.objects.all()))
        print(response) 
        
    
    # def test_accept_request(self):
    #      send = self.client.post(f"accept_friend_request/{self.student1.id}/", send_friend_request(request=self.student1, UserId=self.student2.id),  name="send friend request")
    #      response = self.client.get(f"accept_friend_request/{self.student1.id}/", accept_friend_request(request=self.student2, requestId=self.student1.id),  name="accept friend request")
    #      self.assertEquals(response.status_code, 200)
   
    #    #  self.assertEquals(response, self.student1.id)
    #      self.assertEqual(0, len(FriendRequest.objects.all()))