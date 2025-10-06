from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from analytics.models import Trip, RouteStop
from .serializers import TripSerializer, TripCreateSerializer, DailyLogSerializer
from ..constants import TripConstants
from ..util import generate_route_stops, generate_daily_logs


class TripViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows trips to be viewed or created.
    On creation, it calculates route stops (fuel and rest breaks) and generates daily logs.

    @api {get} /trips/ List Trips
    @api {post} /trips/ Create Trip
    @api {get} /trips/{id}/ Retrieve Trip
    @api {get} /trips/{id}/daily_logs/ Get Daily Logs for Trip
    """
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

    def create(self, request, *args, **kwargs):
        serializer = TripCreateSerializer(data=request.data)
        if serializer.is_valid():
            trip_data = serializer.validated_data

            route_stops, total_distance, total_time = generate_route_stops(trip_data)

            trip = Trip.objects.create(
                driver_name=trip_data['driver_name'],
                current_location=trip_data['current_location'],
                current_lat=trip_data['current_lat'],
                current_lng=trip_data['current_lng'],
                pickup_location=trip_data['pickup_location'],
                pickup_lat=trip_data['pickup_lat'],
                pickup_lng=trip_data['pickup_lng'],
                dropoff_location=trip_data['dropoff_location'],
                dropoff_lat=trip_data['dropoff_lat'],
                dropoff_lng=trip_data['dropoff_lng'],
                current_cycle_hours=trip_data['current_cycle_hours'],
                total_distance=total_distance,
                estimated_drive_time=total_distance / TripConstants.AVERAGE_SPEED_MILES_PER_HOUR,
                total_trip_time=total_time,
                fuel_stops_needed=len([s for s in route_stops if s['stop_type'] == 'fuel']),
                rest_breaks_needed=len([s for s in route_stops if s['stop_type'] == 'rest'])
            )

            for stop_data in route_stops:
                RouteStop.objects.create(trip=trip, **stop_data)

            generate_daily_logs(trip, route_stops)

            response_serializer = TripSerializer(trip)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def daily_logs(self, request, pk=None):
        """Get daily logs for a specific trip"""
        trip = self.get_object()
        daily_logs = trip.daily_logs.all()
        serializer = DailyLogSerializer(daily_logs, many=True)
        return Response(serializer.data)
