from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.db.models import Q
from django.contrib.auth.models import User
from student.models import Student
from friends.models import FriendRequest


def get_student_data(student):
    """
    Returns relevant data for a given student.
    """
    return {
        "userId": student.user.id,
        "email": student.user.email,
        "first_name": student.user.first_name,
        "last_name": student.user.last_name,
        "username": student.user.username,
        "major": student.major,
        "class_year": student.class_year,
        "img_url": getattr(student, "img_url", None),
    }


def get_friend_request_data(friend_request):
    """
    Returns relevant data for a given friend request.
    """
    return {
        "friendRequestId": friend_request.id,
        "userId": friend_request.to_friend.user.id,
        "email": friend_request.to_friend.user.email,
        "sender": get_student_data(friend_request.from_friend.user.student),
        "receiver": get_student_data(friend_request.to_friend.user.student),
        "img_url": getattr(friend_request.to_friend, "img_url", None),
    }


def get_friends(request):
    """
    Returns a list of the logged-in student's friends.
    """
    logged_in_student = get_object_or_404(Student, user=request.user)
    friends_queryset = logged_in_student.friends.all().select_related("user")
    friends = [get_student_data(friend) for friend in friends_queryset]
    return JsonResponse(friends, safe=False)


def remove_friend(request, userId):
    """
    Removes a friend from the logged-in student's friends list.
    """
    from_student = get_object_or_404(Student, user=request.user)
    to_student = get_object_or_404(Student, user__id=userId)
    from_student.friends.remove(to_student)
    to_student.friends.remove(from_student)
    return JsonResponse({"message": "Friend removed"})


def search_friends(request, query):
    """
    Searches for friends based on the given query and returns a list of matches. Excludes existing friends.
    """
    logged_in_student = get_object_or_404(Student, user=request.user)
    search_results = (
        User.objects.filter(
            Q(first_name__icontains=query)
            | Q(last_name__icontains=query)
            | Q(username__icontains=query)
        )
        .select_related("student")
        .only("email", "first_name", "last_name", "username", "student__img_url")
    )
    search_results_excluding_friends = []
    for user in search_results:
        if (
            hasattr(user, "student")
            and user.student not in logged_in_student.friends.all()
        ):
            search_results_excluding_friends.append(get_student_data(user.student))
    return JsonResponse(search_results_excluding_friends, safe=False)


def send_friend_request(request, userId):
    """
    Sends a friend request from the logged-in student to the student with the given user ID.
    """
    from_student = get_object_or_404(Student, user=request.user)
    to_student = get_object_or_404(Student, user__id=userId)
    friend_request, created = FriendRequest.objects.get_or_create(
        from_friend=from_student, to_friend=to_student
    )
    if created:
        return JsonResponse({"message": "Friend request created"}, status=201)
    else:
        return JsonResponse({"message": "Friend request already exists"}, status=400)


def get_requests_sent(request):
    """
    Returns a list of friend requests sent by the logged-in student.
    """
    from_student = get_object_or_404(Student, user=request.user)
    friend_requests = FriendRequest.objects.filter(
        from_friend=from_student
    ).select_related("to_friend__user")
    friends = [
        get_friend_request_data(friend_request) for friend_request in friend_requests
    ]
    return JsonResponse(friends, safe=False)


def get_requests_received(request):
    """
    Returns a list of friend requests received by the logged-in student.
    """
    to_student = get_object_or_404(Student, user=request.user)
    friend_requests = FriendRequest.objects.filter(to_friend=to_student).select_related(
        "from_friend__user"
    )
    friends = [
        get_friend_request_data(friend_request) for friend_request in friend_requests
    ]
    return JsonResponse(friends, safe=False)


def accept_friend_request(request, friendRequestId):
    """
    Accepts a friend request with the given ID for the logged-in student and returns a JSON response.
    """
    friend_request = get_object_or_404(FriendRequest, id=friendRequestId)
    friend_request.to_friend.friends.add(friend_request.from_friend)
    friend_request.from_friend.friends.add(friend_request.to_friend)
    friend_request.delete()
    return JsonResponse({"message": "Friend request accepted"})


def reject_friend_request(request, friendRequestId):
    """
    Rejects a friend request with the given ID for the logged-in student and returns a JSON response.
    """
    friend_request = get_object_or_404(FriendRequest, id=friendRequestId)
    friend_request.delete()
    return JsonResponse({"message": "Friend request rejected"})
