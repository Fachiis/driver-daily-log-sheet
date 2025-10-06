from datetime import date, timedelta

from django.test import TestCase
from django.utils import timezone

from analytics.models import Trip, RouteStop, DailyLog, LogEntry


class TripModelTest(TestCase):
    """Test cases for Trip model"""

    def setUp(self):
        self.trip = Trip.objects.create(
            current_location="New York, NY",
            current_lat=40.7128,
            current_lng=-74.0060,
            pickup_location="Philadelphia, PA",
            pickup_lat=39.9526,
            pickup_lng=-75.1652,
            dropoff_location="Washington, DC",
            dropoff_lat=38.9072,
            dropoff_lng=-77.0369,
            current_cycle_hours=10.5,
            driver_name="John Doe",
            total_distance=250.5,
            estimated_drive_time=4.5,
            total_trip_time=6.0,
            fuel_stops_needed=1,
            rest_breaks_needed=0
        )

    def test_trip_creation(self):
        """Test that a trip can be created successfully"""
        self.assertEqual(Trip.objects.count(), 1)
        self.assertEqual(self.trip.driver_name, "John Doe")
        self.assertEqual(self.trip.current_location, "New York, NY")
        self.assertIsNotNone(self.trip.created_at)

    def test_trip_str_representation(self):
        """Test the string representation of a trip"""
        expected = f"Trip {self.trip.id} - John Doe ({self.trip.created_at.strftime('%Y-%m-%d')})"
        self.assertEqual(str(self.trip), expected)

    def test_trip_optional_fields(self):
        """Test that optional fields can be null or blank"""
        minimal_trip = Trip.objects.create(
            current_location="Miami, FL",
            current_lat=25.7617,
            current_lng=-80.1918,
            pickup_location="Tampa, FL",
            pickup_lat=27.9506,
            pickup_lng=-82.4572,
            dropoff_location="Orlando, FL",
            dropoff_lat=28.5383,
            dropoff_lng=-81.3792,
            current_cycle_hours=0.0
        )

        self.assertIsNone(minimal_trip.driver_name)
        self.assertIsNone(minimal_trip.total_distance)
        self.assertIsNone(minimal_trip.fuel_stops_needed)


class RouteStopModelTest(TestCase):
    """Test cases for RouteStop model"""

    def setUp(self):
        self.trip = Trip.objects.create(
            current_location="New York, NY",
            current_lat=40.7128,
            current_lng=-74.0060,
            pickup_location="Philadelphia, PA",
            pickup_lat=39.9526,
            pickup_lng=-75.1652,
            dropoff_location="Washington, DC",
            dropoff_lat=38.9072,
            dropoff_lng=-77.0369,
            current_cycle_hours=0.0,
            driver_name="John Doe"
        )

        self.pickup_stop = RouteStop.objects.create(
            trip=self.trip,
            stop_type=RouteStop.PICKUP_LOCATION,
            location_name="Philadelphia, PA",
            latitude=39.9526,
            longitude=-75.1652,
            order=1,
            duration_hours=1.0,
            distance_from_previous=95.0,
            cumulative_hours=1.5
        )

    def test_route_stop_creation(self):
        """Test that a route stop can be created"""
        self.assertEqual(RouteStop.objects.count(), 1)
        self.assertEqual(self.pickup_stop.stop_type, RouteStop.PICKUP_LOCATION)
        self.assertEqual(self.pickup_stop.location_name, "Philadelphia, PA")

    def test_route_stop_relationship(self):
        """Test the foreign key relationship with Trip"""
        self.assertEqual(self.pickup_stop.trip, self.trip)
        self.assertEqual(self.trip.route_stops.count(), 1)
        self.assertEqual(self.trip.route_stops.first(), self.pickup_stop)

    def test_route_stop_types(self):
        """Test all stop type choices"""
        fuel_stop = RouteStop.objects.create(
            trip=self.trip,
            stop_type=RouteStop.FUEL_STOP,
            location_name="Rest Area Mile 150",
            latitude=39.5,
            longitude=-76.0,
            order=2,
            duration_hours=0.5,
            distance_from_previous=50.0,
            cumulative_hours=2.0
        )

        rest_stop = RouteStop.objects.create(
            trip=self.trip,
            stop_type=RouteStop.REST_BREAK,
            location_name="Truck Stop",
            latitude=38.9,
            longitude=-76.8,
            order=3,
            duration_hours=10.0,
            distance_from_previous=30.0,
            cumulative_hours=12.5
        )

        self.assertEqual(fuel_stop.stop_type, RouteStop.FUEL_STOP)
        self.assertEqual(rest_stop.stop_type, RouteStop.REST_BREAK)


class DailyLogModelTest(TestCase):
    """Test cases for DailyLog model"""

    def setUp(self):
        self.trip = Trip.objects.create(
            current_location="New York, NY",
            current_lat=40.7128,
            current_lng=-74.0060,
            pickup_location="Philadelphia, PA",
            pickup_lat=39.9526,
            pickup_lng=-75.1652,
            dropoff_location="Washington, DC",
            dropoff_lat=38.9072,
            dropoff_lng=-77.0369,
            current_cycle_hours=0.0,
            driver_name="John Doe"
        )

        self.daily_log = DailyLog.objects.create(
            trip=self.trip,
            date=date.today(),
            driver_name="John Doe",
            home_terminal="New York Terminal",
            total_miles_today=450.0,
            total_hours_driving=8.5,
            total_hours_on_duty=1.5
        )

    def test_daily_log_creation(self):
        """Test that a daily log can be created"""
        self.assertEqual(DailyLog.objects.count(), 1)
        self.assertEqual(self.daily_log.driver_name, "John Doe")
        self.assertEqual(self.daily_log.total_miles_today, 450.0)

    def test_daily_log_defaults(self):
        """Test default values for optional fields"""
        minimal_log = DailyLog.objects.create(
            trip=self.trip,
            date=date.today() + timedelta(days=2),
            driver_name="Jane Smith"
        )

        self.assertEqual(minimal_log.total_miles_today, 0)
        self.assertEqual(minimal_log.total_hours_driving, 0)
        self.assertEqual(minimal_log.total_hours_on_duty, 0)


class LogEntryModelTest(TestCase):
    """Test cases for LogEntry model"""

    def setUp(self):
        self.trip = Trip.objects.create(
            current_location="New York, NY",
            current_lat=40.7128,
            current_lng=-74.0060,
            pickup_location="Philadelphia, PA",
            pickup_lat=39.9526,
            pickup_lng=-75.1652,
            dropoff_location="Washington, DC",
            dropoff_lat=38.9072,
            dropoff_lng=-77.0369,
            current_cycle_hours=0.0,
            driver_name="John Doe"
        )

        self.daily_log = DailyLog.objects.create(
            trip=self.trip,
            date=date.today(),
            driver_name="John Doe",
            total_miles_today=450.0
        )

        self.log_entry = LogEntry.objects.create(
            daily_log=self.daily_log,
            status=LogEntry.DRIVING,
            start_time=timezone.now().time(),
            end_time=(timezone.now() + timedelta(hours=2)).time(),
            duration_hours=2.0,
            location="On I-95 South",
            remarks="Driving to pickup location"
        )

    def test_log_entry_creation(self):
        """Test that a log entry can be created"""
        self.assertEqual(LogEntry.objects.count(), 1)
        self.assertEqual(self.log_entry.status, LogEntry.DRIVING)
        self.assertEqual(self.log_entry.duration_hours, 2.0)

    def test_log_entry_status_choices(self):
        """Test all status choices for log entries"""
        off_duty_entry = LogEntry.objects.create(
            daily_log=self.daily_log,
            status=LogEntry.OFF_DUTY,
            start_time=timezone.now().time(),
            end_time=(timezone.now() + timedelta(hours=1)).time(),
            duration_hours=1.0,
            location="Rest Area"
        )

        sleeper_entry = LogEntry.objects.create(
            daily_log=self.daily_log,
            status=LogEntry.SLEEPER_BERTH,
            start_time=timezone.now().time(),
            end_time=(timezone.now() + timedelta(hours=10)).time(),
            duration_hours=10.0,
            location="Truck Stop"
        )

        self.assertEqual(off_duty_entry.status, LogEntry.OFF_DUTY)
        self.assertEqual(sleeper_entry.status, LogEntry.SLEEPER_BERTH)
