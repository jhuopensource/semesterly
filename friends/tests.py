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
from friends.views import (
    send_friend_request,
    accept_friend_request,
    reject_friend_request,
)


class FriendRequestTest(APITestCase):
    def setUp(self):
        self.user1 = create_user(username="Alice", password="security")
        self.student1 = create_student(user=self.user1)
        self.user2 = create_user(username="Bob", password="security2")
        self.student2 = create_student(user=self.user2)
        self.user3 = create_user(username="Charlie", password="security3")
        self.student3 = create_student(user=self.user3)

    def test_get_friends(self):
        self.client.force_login(self.user1)
        response = self.client.get(reverse("get friends"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 0)

    def test_get_friends_with_data(self):
        self.student1.friends.add(self.student2)
        self.client.force_login(self.user1)
        response = self.client.get(reverse("get friends"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_remove_friend(self):
        self.student1.friends.add(self.student2)
        self.client.force_login(self.user1)
        response = self.client.post(reverse("remove friend", args=[self.user2.id]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.student1.friends.count(), 0)

    def test_remove_nonexistent_friend(self):
        self.client.force_login(self.user1)
        response = self.client.post(reverse("remove friend", args=[self.user2.id]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.student1.friends.count(), 0)

    def test_send_request(self):
        self.client.force_login(self.user1)
        response = self.client.post(
            reverse("send friend request", args=[self.user2.id])
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(FriendRequest.objects.count(), 1)
        self.assertEqual(response.json()["message"], "Friend request created")

    def test_send_duplicate_request(self):
        FriendRequest.objects.create(from_friend=self.student1, to_friend=self.student2)
        self.client.force_login(self.user1)
        response = self.client.post(
            reverse("send friend request", args=[self.user2.id])
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(FriendRequest.objects.count(), 1)
        self.assertEqual(response.json()["message"], "Friend request already exists")

    def test_requests_sent(self):
        FriendRequest.objects.create(from_friend=self.student1, to_friend=self.student2)
        self.client.force_login(self.user1)
        response = self.client.get(reverse("friend requests sent"))
        self.assertEqual(response.status_code, 200)
        requests_sent = response.json()
        self.assertEqual(len(requests_sent), 1)
        self.assertIn(
            self.user1.username,
            [request["sender"]["username"] for request in requests_sent],
        )
        self.assertIn(
            self.user2.username,
            [request["receiver"]["username"] for request in requests_sent],
        )

    def test_requests_sent_empty(self):
        self.client.force_login(self.user1)
        response = self.client.get(reverse("friend requests sent"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 0)

    def test_requests_received(self):
        FriendRequest.objects.create(from_friend=self.student2, to_friend=self.student1)
        self.client.force_login(self.user1)
        response = self.client.get(reverse("friend requests received"))
        self.assertEqual(response.status_code, 200)
        requests_received = response.json()
        self.assertEqual(len(requests_received), 1)
        self.assertIn(
            self.user2.username,
            [request["sender"]["username"] for request in requests_received],
        )
        self.assertIn(
            self.user1.username,
            [request["receiver"]["username"] for request in requests_received],
        )

    def test_requests_received_empty(self):
        self.client.force_login(self.user1)
        response = self.client.get(reverse("friend requests received"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 0)

    def test_accept_request(self):
        friend_request = FriendRequest.objects.create(
            from_friend=self.student2, to_friend=self.student1
        )
        self.client.force_login(self.user1)
        response = self.client.post(
            reverse("accept friend request", args=[friend_request.id])
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(FriendRequest.objects.count(), 0)
        self.assertTrue(self.student1.friends.filter(id=self.student2.id).exists())
        self.assertEqual(response.json()["message"], "Friend request accepted")

    def test_accept_nonexistent_request(self):
        self.client.force_login(self.user1)
        response = self.client.post(reverse("accept friend request", args=[999]))
        self.assertEqual(response.status_code, 404)
        self.assertEqual(FriendRequest.objects.count(), 0)
        self.assertFalse(self.student1.friends.filter(id=self.student2.id).exists())

    def test_reject_request(self):
        friend_request = FriendRequest.objects.create(
            from_friend=self.student2, to_friend=self.student1
        )
        self.client.force_login(self.user1)
        response = self.client.post(
            reverse("reject friend request", args=[friend_request.id])
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(FriendRequest.objects.count(), 0)
        self.assertFalse(self.student1.friends.filter(id=self.student2.id).exists())
        self.assertEqual(response.json()["message"], "Friend request rejected")

    def test_reject_nonexistent_request(self):
        self.client.force_login(self.user1)
        response = self.client.post(reverse("reject friend request", args=[999]))
        self.assertEqual(response.status_code, 404)
        self.assertEqual(FriendRequest.objects.count(), 0)
        self.assertFalse(self.student1.friends.filter(id=self.student2.id).exists())

    def test_search_friends(self):
        self.client.force_login(self.user1)
        response = self.client.get(reverse("search friends", args=["Bob"]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_search_friends_no_results(self):
        self.client.force_login(self.user1)
        response = self.client.get(reverse("search friends", args=["David"]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 0)
