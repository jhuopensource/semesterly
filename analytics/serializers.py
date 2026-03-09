from rest_framework import serializers
from .models import UIErrorLog


class CurrentUserDefault:
    requires_context = True

    def __call__(self, serializer_field):
        request = serializer_field.context.get("request")
        if request and hasattr(request, "user") and request.user.is_authenticated:
            return request.user
        return None

    def __repr__(self):
        return "%s()" % self.__class__.__name__


class UIErrorLogSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=CurrentUserDefault())

    class Meta:
        model = UIErrorLog
        fields = "__all__"
