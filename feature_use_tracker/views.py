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

from rest_framework.views import APIView
from rest_framework.response import Response
from feature_use_tracker.models import FeatureUse, Feature
from feature_use_tracker.serializers import FeatureUseSerializer


# Create your views here.
class FeatureUseView(APIView):
    """
    List relevant feature use entries (for red-dot rendering logic), or create a new entry
    """

    def post(self, request):
        # drop the 'user' field if client supplies it (we only want to get User through inference)
        data = request.data.copy()
        data.pop("user", None)

        feature = data.get("feature_name")

        # delete duplicates if necessary
        exists = FeatureUse.objects.filter(user=request.user, feature_name=feature).exists()
        if exists:
            return Response(status=204)

        serializer = FeatureUseSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data)
    
    
    def get(self, request):
        rows = FeatureUse.objects.filter(user=request.user)
        serializer = FeatureUseSerializer(rows, many=True)
        return Response(serializer.data)
