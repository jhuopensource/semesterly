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

from django.http import HttpResponse, Http404
from django.template.loader import get_template
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.core.mail import send_mail
import datetime, hashlib, hmac, json, pprint, requests, time
from django.db import connections
from django.core.cache import cache
from django.test import Client

@csrf_exempt
def deploy_staging(request):
    if not getattr(settings, "SECRET_TOKEN", False) or not getattr(
        settings, "STAGING", False
    ):
        return HttpResponse("Invalid URL", status=404)
    if not verify_hmac_hash(request):
        raise Http404

    event_type = request.META.get("HTTP_X_GITHUB_EVENT")
    if event_type == "ping":
        return HttpResponse("ok", status=200)

    elif event_type == "push":
        body = json.loads(request.body)
        ref = body["ref"]
        email_info = {"ref": ref, "link": body["compare"]}
        try:
            commit = body["commits"][0]
            set_commit_info(email_info, commit)
        except IndexError:
            set_merge_info(body, email_info)

        branch_name = ref.split("/")[-1]
        if branch_name != "staging":
            default_send_email(
                "Semester.ly Branch: " + branch_name + " Updated",
                pprint.pformat(email_info, indent=4),
            )
            return HttpResponse("200")

        default_send_email(
            "Semester.ly Staging Server Being Updated",
            pprint.pformat(email_info, indent=4),
        )
        return HttpResponse(status=200)
    else:
        return HttpResponse(status=403)

def set_commit_info(email_info, commit):
    email_info.update(
        {
            "type": "Commit",
            "sender_username": commit["committer"]["username"],
            "commit_hash": commit["id"],
            "commit_link": commit["url"],
            "time": commit["timestamp"],
        }
    )


def set_merge_info(body, email_info):
    email_info.update(
        {
            "type": "Merge [?]",
            "sender_username": body["sender"]["login"],
            "time": str(datetime.datetime.now()),
        }
    )


# Compare the HMAC hash signature
def verify_hmac_hash(request):
    SECRET_TOKEN = getattr(settings, "SECRET_TOKEN", False)
    signature = request.META.get("HTTP_X_HUB_SIGNATURE")
    computed_signature = (
        "sha1=" + hmac.new(SECRET_TOKEN, request.body, hashlib.sha1).hexdigest()
    )
    return signature == computed_signature


def default_send_email(subject, message):
    send_mail(
        subject,
        message,
        getattr(settings, "DEFAULT_FROM_EMAIL"),
        getattr(settings, "STAGING_NOTIFIED_ADMINS"),
    )


def manifest_json(request, js):
    template = get_template("manifest.json")
    html = template.render()
    return HttpResponse(html, content_type="application/json")

def health_check(request):
    try:
        database_check()
        endpoint_check()
        return HttpResponse(
            json.dumps({"status": "healthy"}),
            content_type="application/json",
            status=200
        )
    except Exception as e:
        alert_discord(str(e))
        return HttpResponse(
            json.dumps({"status": "unhealthy", "error": str(e)}),
            content_type="application/json",
            status=500
        )

def database_check():
    db_conn = connections["default"]
    cursor = db_conn.cursor()
    cursor.execute("SELECT 1;")
    # Check auth_user and student_student table connections
    cursor.execute("SELECT COUNT(*) FROM auth_user LIMIT 1;")
    cursor.execute("SELECT COUNT(*) FROM student_student LIMIT 1;")

def endpoint_check():
    from django.test import Client
    client = Client()
    
    response = client.get("/courses/")
    if response.status_code not in [200, 302]:
        raise Exception(f"Course listing endpoint failed with status {response.status_code}")

    response = client.get("/search/fall/2024/test/")
    if response.status_code not in [200, 302, 404]:
        raise Exception(f"Search endpoint failed with status {response.status_code}")
    
    response = client.get("/timetables/")
    if response.status_code not in [200, 302]:
        raise Exception(f"Timetables endpoint failed with status {response.status_code}")

def alert_discord(message, cooldown=1800):
    """Send Discord alert through Semester.ly bot"""
    BOT_TOKEN = getattr(settings, "DISCORD_BOT_TOKEN", None)
    CHANNEL_ID = getattr(settings, "DISCORD_CHANNEL_ID", None)
    
    # Check last alert time
    last_alert_time = cache.get(message, 0)
    current_time = time.time()
    if current_time - last_alert_time > cooldown:
        response = requests.post(
            f"https://discord.com/api/v10/channels/{CHANNEL_ID}/messages", 
            json={"content": f"@here Semester.ly Health Check Failed\n{message}"}, 
            headers={"Authorization": f"Bot {BOT_TOKEN}"}
        )
        
        # If successful, update the last alert time
        if response.status_code == 200:
            cache.set(message, current_time, timeout=cooldown)
    