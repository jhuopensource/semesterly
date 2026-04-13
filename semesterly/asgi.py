"""
ASGI config for semesterly project.
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.contrib.staticfiles.handlers import ASGIStaticFilesHandler
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "semesterly.settings")

django_asgi_app = get_asgi_application()
from .routing import websocket_urlpatterns

application = ProtocolTypeRouter(
    {
        "http": ASGIStaticFilesHandler(django_asgi_app),
        "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
    }
)
