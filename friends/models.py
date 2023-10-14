from django.db import models
from student.models import Student

# Create your models here.

class FriendRequest(models.Model):
    from_friend = models.ForeignKey(Student, related_name="from_friend", on_delete=models.CASCADE)
    to_friend = models.ForeignKey(Student, related_name="to_friend", on_delete=models.CASCADE)

