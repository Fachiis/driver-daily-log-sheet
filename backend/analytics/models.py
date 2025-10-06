from django.db import models

class Trip(models.Model):
    current_location = models.CharField(max_length=500)
    current_lat = models.FloatField()
    current_lng = models.FloatField()
    pickup_location = models.CharField(max_length=500)
    pickup_lat = models.FloatField()
    pickup_lng = models.FloatField()
    dropoff_location = models.CharField(max_length=500)
    dropoff_lat = models.FloatField()
    dropoff_lng = models.FloatField()
    current_cycle_hours = models.FloatField(help_text="Hours already used in current 8-day cycle")
    driver_name = models.CharField(max_length=200, null=True, blank=True)

    total_distance = models.FloatField(null=True, blank=True)
    estimated_drive_time = models.FloatField(null=True, blank=True)
    total_trip_time = models.FloatField(null=True, blank=True)
    fuel_stops_needed = models.IntegerField(null=True, blank=True)
    rest_breaks_needed = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Trip {self.id} - {self.driver_name} ({self.created_at.strftime('%Y-%m-%d')})"

    class Meta:
        ordering = ['-created_at']


class RouteStop(models.Model):

    PICKUP_LOCATION = 'pickup'
    DROPOFF_LOCATION = 'dropoff'
    FUEL_STOP = 'fuel'
    REST_BREAK = 'rest'

    STOP_TYPE_CHOICES = [
        (PICKUP_LOCATION, 'Pickup'),
        (DROPOFF_LOCATION, 'Dropoff'),
        (FUEL_STOP, 'Fuel Stop'),
        (REST_BREAK, 'Rest Break'),
    ]

    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='route_stops')
    stop_type = models.CharField(max_length=20, choices=STOP_TYPE_CHOICES)
    location_name = models.CharField(max_length=500)
    latitude = models.FloatField()
    longitude = models.FloatField()
    order = models.IntegerField()
    duration_hours = models.FloatField(help_text="Duration of stop in hours")
    distance_from_previous = models.FloatField(help_text="Distance from previous stop in miles")
    cumulative_hours = models.FloatField(help_text="Total hours from trip start")

    def __str__(self):
        return f"{self.stop_type} - {self.location_name} (Stop #{self.order})"

    class Meta:
        ordering = ['trip', 'order']


class DailyLog(models.Model):
    STATUS_CHOICES = [
        ('off_duty', 'Off Duty'),
        ('sleeper', 'Sleeper Berth'),
        ('driving', 'Driving'),
        ('on_duty', 'On Duty (Not Driving)'),
    ]

    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='daily_logs')
    date = models.DateField()
    driver_name = models.CharField(max_length=200)
    home_terminal = models.CharField(max_length=500, blank=True)
    total_miles_today = models.FloatField(default=0)
    total_hours_driving = models.FloatField(default=0, help_text="Total hours spent driving today")
    total_hours_on_duty = models.FloatField(default=0, help_text="Total hours on duty (not driving) today")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Daily Log - {self.driver_name} - {self.date}"

    class Meta:
        ordering = ['trip', 'date']
        unique_together = ['trip', 'date']


class LogEntry(models.Model):
    OFF_DUTY = 'off_duty'
    SLEEPER_BERTH = 'sleeper'
    DRIVING = 'driving'
    ON_DUTY = 'on_duty'

    STATUS_CHOICES = [
        (OFF_DUTY, 'Off Duty'),
        (SLEEPER_BERTH, 'Sleeper Berth'),
        (DRIVING, 'Driving'),
        (ON_DUTY, 'On Duty (Not Driving)'),
    ]

    daily_log = models.ForeignKey(DailyLog, on_delete=models.CASCADE, related_name='entries')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_hours = models.FloatField()
    location = models.CharField(max_length=500, blank=True)
    remarks = models.TextField(blank=True)

    def __str__(self):
        return f"{self.status} - {self.start_time} to {self.end_time}"

    class Meta:
        ordering = ['daily_log', 'start_time']
