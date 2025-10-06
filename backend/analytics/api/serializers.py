from rest_framework import serializers

from analytics.models import Trip, RouteStop, DailyLog, LogEntry


class RouteStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = RouteStop
        fields = '__all__'


class LogEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = LogEntry
        fields = '__all__'


class DailyLogSerializer(serializers.ModelSerializer):
    entries = LogEntrySerializer(many=True, read_only=True)

    class Meta:
        model = DailyLog
        fields = '__all__'


class TripSerializer(serializers.ModelSerializer):
    route_stops = RouteStopSerializer(many=True, read_only=True)
    daily_logs = DailyLogSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = '__all__'


class TripCreateSerializer(serializers.Serializer):
    current_location = serializers.CharField(max_length=500)
    current_lat = serializers.FloatField()
    current_lng = serializers.FloatField()
    pickup_location = serializers.CharField(max_length=500)
    pickup_lat = serializers.FloatField()
    pickup_lng = serializers.FloatField()
    dropoff_location = serializers.CharField(max_length=500)
    dropoff_lat = serializers.FloatField()
    dropoff_lng = serializers.FloatField()
    current_cycle_hours = serializers.FloatField()
    driver_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    home_terminal = serializers.CharField(max_length=500, required=False, allow_blank=True)

