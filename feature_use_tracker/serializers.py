from rest_framework import serializers
from .models import FeatureUse

class FeatureUseSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeatureUse
        fields = ["id", "user", "feature_name", "time_used"]
        read_only_fields = ["time_used"]
