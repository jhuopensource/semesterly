# Copyright (C) 2017 Semester.ly Technologies, LLC
#
# Semester.ly is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Semester.ly is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

import json
from urllib.request import Request, urlopen
import requests
from django.conf import settings
from django.contrib.auth.models import User
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from django.db.models import F
from hashids import Hashids
import logging
import re

from student.models import Student
from semesterly.settings import get_secret

hashids = Hashids(salt=get_secret("HASHING_SALT"))

logger = logging.getLogger(__name__)


def check_student_token(student, token):
    """
    Validates a token: checks that it is at most 2 days old and that it
    matches the currently authenticated student.
    """
    try:
        key = "%s:%s" % (student.id, token)
        TimestampSigner().unsign(key, max_age=60 * 60 * 48)  # Valid for 2 days
    except (BadSignature, SignatureExpired):
        return False
    return True


def associate_students(strategy, details, response, user, *args, **kwargs):
    """
    Part of our custom Python Social Auth authentication pipeline. If a user
    already has an account associated with an email, associates that user with
    the new provider (e.g. Facebook, JHED, or Google).
    """
    kwargs["user"] = user
    user_updated_in_this_function = False

    # Expected behavior: If 'user' is updated by one of the following three functions, stop and simply exit
    #       with current user in kwargs. For example, if try_associate_email finds a User, do not further
    #       attempt matching via try_associate_jhed_oidc or try_associate_jhed_token.
    #
    #       If a user is not matched using this function, 'kwargs' will contain the old User found before
    #       this function -- but a warning will be logged out. Ideally, for any existing account, the User
    #       should be found within this function only.
    user_updated_in_this_function = try_associate_email(response, kwargs)

    if not user_updated_in_this_function:
        user_updated_in_this_function = try_associate_jhed_oidc(response, kwargs)

    if not user_updated_in_this_function:
        user_updated_in_this_function = try_associate_token(strategy, kwargs)

    # LOGGING CLAUSE
    try:
        logger.debug(
            f"associate_students: end of function, kwargs['user']={kwargs['user']}, User id={kwargs['user'].id}"
        )

        if not user_updated_in_this_function:
            logger.warning(
                "associate_students: User was not matched using this function, returning User associated previously in the pipeline."
            )
    except Exception as e:
        logger.debug(f"kwargs['user'] error: {e}")

    return kwargs


# precondition: users_queryset consists of Users, and has length >= 1
def get_most_recently_logged_in_user(users_queryset):
    """
    Given a queryset of users, return the user with the most recent 'last_login'.
    If no user has a last_login (i.e., they never logged in), throw an exception.
    """
    user = users_queryset.order_by(
        "-last_login"
    ).first()  # `-last_login` ensures descending order
    if user is None:
        raise Exception(
            "get_most_recently_logged_in_user: received queryset with no Users. THIS SHOULD NEVER HAPPEN. YOU SHOULD NEVER SEE THIS LOG!"
        )
    return user


# precondition: students_queryset consists of Students, and has length >= 1
def get_most_recently_logged_in_student(students_queryset):
    """
    Given a queryset of Student objects, return the User associated with the
    Student that has the most recent 'last_login' field (from the associated User).
    If no student has a 'last_login' set, return None.
    """
    students_with_last_login = students_queryset.annotate(
        last_login=F("user__last_login")
    )

    most_recent_student = students_with_last_login.order_by("-last_login").first()

    if most_recent_student:
        return most_recent_student, most_recent_student.user
    raise Exception(
        "get_most_recently_logged_in_student: received queryset with no Students. THIS SHOULD NEVER HAPPEN. YOU SHOULD NEVER SEE THIS LOG!"
    )


def try_associate_email(response, kwargs):
    try:
        kwargs_base = kwargs.get("details") or kwargs
        if kwargs_base is None:
            raise Exception("try_associate_email: 'kwargs_base' is None")

        email = kwargs_base.get("email")
        if email is None:
            logger.debug(
                "try_associate_email: 'email' from kwargs_base is None. trying from 'response'..."
            )
            email = response.get("email")
            if email is None:
                raise Exception("try_associate_email: 'email' is None")

        logger.debug(f"found email: {email}")
        found_users = User.objects.filter(email=email)
        if not found_users.exists():
            # It is possible that the 'email' found is unexpectedly in @jhu.edu format, for Hopkins students.
            # Before raising an exception, try one more time to correctly match an email...
            email = re.sub(r"(?<=@)jhu(?=\.edu)", "jh", email)
            found_users = User.objects.filter(email=email)
            if not found_users.exists():
                raise Exception(
                    f"try_associate_email: No student found for email: {email}"
                )

        final_user = get_most_recently_logged_in_user(found_users)

        # LOGGING CLAUSE
        if found_users.count() > 1:
            logger.debug(
                f"try_associate_email: Found multiple users for email: {email}. Returning the user that has most recently logged in, with id={final_user.id}."
            )

        kwargs["user"] = final_user
        logger.debug("try_associate_email: successfully associated student via email.")
        return True
    except Exception as e:
        logger.debug(
            f"try_associate_email: error while trying to associate via email: {e}"
        )
        return False


# Look for openid field (present if logging in via OIDC)
def try_associate_jhed_oidc(response, kwargs):
    try:
        jh_email = response.get("openid")
        if not jh_email or "@" not in jh_email:
            raise Exception("try_associate_jhed_oidc: openid key format invalid")

        jhed = jh_email.split("@", 1)[0]
        students = Student.objects.filter(jhed=jhed)

        if not students.exists():
            raise Exception(
                f"try_associate_jhed_oidc: No student found for JHED: {jhed}"
            )

        final_student, final_user = get_most_recently_logged_in_student(students)

        # LOGGING CLAUSE
        if students.count() > 1:
            logger.debug(
                f"try_associate_jhed_oidc: Multiple students found for JHED: {jhed}. Returning the most recently logged in 'student' with id={final_student.id}, with associated User id={final_user.id}."
            )

        kwargs["user"] = final_user
        logger.debug(
            f"try_associate_jhed_oidc: successfully associated student via JHED={jhed}, auth_user id={final_student.user.id}, student_student id={final_student.id}."
        )
        return True
    except Exception as e:
        logger.debug(
            f"try_associate_jhed_oidc: error while trying to associate via JHED: {e}"
        )
        return False


def try_associate_token(strategy, kwargs):
    try:
        token = strategy.session_get("student_token")
        ref = strategy.session_get("login_hash")
        if not token or not ref:
            raise Exception(
                "try_associate_token: strategy.token and/or strategy.ref invalid"
            )

        decrypted_ref = hashids.decrypt(ref)
        if not decrypted_ref:
            raise Exception("try_associate_token: hashids.decrypt(ref) invalid")

        students = Student.objects.filter(id=decrypted_ref[0])
        if not students.exists():
            raise Exception(
                f"try_associate_token: no student found for token reference: {ref}"
            )

        final_student, final_user = get_most_recently_logged_in_student(students)

        # LOGGING CLAUSE
        if students.count() > 1:
            logger.debug(
                f"try_associate_token: Found multiple students for token reference: {ref}. Returning the most recently logged in student with id={students.first().id}."
            )

        if check_student_token(final_student, token):
            kwargs["user"] = final_user
            logger.debug(
                "try_associate_token: successfully associated student via token."
            )
            return True
        else:
            raise Exception("try_associate_token: failed to associate via token.")
    except Exception as e:
        logger.debug(
            f"try_associate_token: error while trying to associate via token: {e}"
        )
        return False


def create_student(strategy, details, response, user, *args, **kwargs):
    """
    Part of the Python Social Auth pipeline which creates a student upon
    signup. If student already exists, updates information from Facebook
    or Google (depending on the provider).
    Saves friends and other information to fill database.
    """
    backend_name = kwargs["backend"].name
    student, status = Student.objects.get_or_create(user=user)

    # LOGGING CLAUSE
    if status is True:
        logger.debug(
            f"create_student: could not find existing Student for user with id={user.id}, so created a new one"
        )

    # LOGGING CLAUSE
    if Student.objects.filter(user=user).count() > 1:
        logger.debug(
            f"create_student: multiple Student objects found for user with id={user.id}. Returned first student, with id={student.id}."
        )

    social_user = user.social_auth.filter(provider=backend_name).first()
    hasFacebook = user.social_auth.filter(provider="facebook").exists()
    if backend_name == "facebook":
        update_student_facebook(student, social_user)
    elif backend_name == "oidc":
        update_student_jhed_oidc(student, response)
    elif backend_name == "google-oauth2":
        update_student_google(student, social_user, hasFacebook)
    student.save()
    return kwargs


def update_student_facebook(student, social_user):
    try:
        access_token = social_user.extra_data["access_token"]
    except TypeError:
        access_token = json.loads(social_user.extra_data)["access_token"]

    student.img_url = (
        f"https://graph.facebook.com/v9.0/{social_user.uid}/picture?type=normal"
    )
    student.fbook_uid = social_user.uid
    friends = get_facebook_friends(social_user, access_token)
    update_facebook_friends(student, friends)


def get_facebook_friends(social_user, access_token):
    url = (
        f"https://graph.facebook.com/{social_user.uid}"
        f"/friends?fields=id&access_token={access_token}"
    )
    request = Request(url)
    return json.loads(urlopen(request).read().decode("utf-8")).get("data")


def update_facebook_friends(student, friends):
    for friend in friends:
        if Student.objects.filter(fbook_uid=friend["id"]).exists():
            friend_student = Student.objects.get(fbook_uid=friend["id"])
            if not student.friends.filter(user=friend_student.user).exists():
                student.friends.add(friend_student)
                friend_student.save()


def update_student_jhed(student, response):
    student.jhed = response["unique_name"]
    student.preferred_name = response["name"]


# This step here should fill in the 'email' field in the auth_user table correctly, i.e. not with @jhu.edu, but @jh.edu (using openid field in response)
# Should also fill in the 'jhed' field in the student_student table
def update_student_jhed_oidc(student, response):
    student_openid = response["openid"]
    if not student_openid or "@" not in student_openid:
        return
    student.jhed = student_openid.split("@", 1)[0]
    student.preferred_name = response["given_name"]

    user_obj = student.user
    user_obj.email = student_openid
    user_obj.save()


def update_student_google(student, social_user, hasFacebook):
    try:
        access_token = social_user.extra_data["access_token"]
    except TypeError:
        access_token = json.loads(social_user.extra_data)["access_token"]
    # prioritize facebook picture if available
    if not hasFacebook:
        set_img_url_google(student, social_user, access_token)


def set_img_url_google(student, social_user, access_token):
    response = requests.get(
        "https://www.googleapis.com/userinfo/v2/me".format(
            social_user.uid, get_secret("GOOGLE_API_KEY")
        ),
        params={"access_token": access_token},
    )
    student.img_url = response.json()["picture"]
