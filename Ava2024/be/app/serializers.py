from rest_framework import serializers
from .models import LocationActivities, Vessel, Location

class LocationActivitiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationActivities
        fields = '__all__'

class VesselSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vessel
        fields = ['id', 'name', 'type']

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name']

class TransponderPingCustomSerializer(serializers.Serializer):
    vesselid = serializers.CharField()
    vesselname = serializers.CharField()
    vesseltype = serializers.CharField()
    locationid = serializers.CharField()
    locationname = serializers.CharField()
    dwell = serializers.CharField()
    date_added = serializers.CharField()

class HarborReportCustomSerializer(serializers.Serializer):
    vesselid = serializers.CharField()
    vesselname = serializers.CharField()
    vesseltype = serializers.CharField()
    locationid = serializers.CharField()
    locationname = serializers.CharField()
    date_added = serializers.CharField()
    date = serializers.CharField()