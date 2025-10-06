import math
from datetime import datetime, timedelta, time

from .constants import TripConstants
from .models import LogEntry, DailyLog


def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points using Haversine formula (in miles)"""
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    # Haversine formula
    a = math.sin(delta_lat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return TripConstants.EARTH_RADIUS_MILES * c

def interpolate_point(lat1, lon1, lat2, lon2, fraction):
    """Interpolate a point between two coordinates using spherical interpolation"""
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    delta_lat = lat2_rad - lat1_rad
    delta_lon = lon2_rad - lon1_rad

    a = (math.sin(delta_lat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2)
    angular_distance = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    # Spherical interpolation
    point_a_coefficient = math.sin((1 - fraction) * angular_distance) / math.sin(angular_distance)
    point_b_coefficient = math.sin(fraction * angular_distance) / math.sin(angular_distance)

    x = point_a_coefficient * math.cos(lat1_rad) * math.cos(lon1_rad) + point_b_coefficient * math.cos(lat2_rad) * math.cos(lon2_rad)
    y = point_a_coefficient * math.cos(lat1_rad) * math.sin(lon1_rad) + point_b_coefficient * math.cos(lat2_rad) * math.sin(lon2_rad)
    z = point_a_coefficient * math.sin(lat1_rad) + point_b_coefficient * math.sin(lat2_rad)

    lat_result = math.atan2(z, math.sqrt(x ** 2 + y ** 2))
    lon_result = math.atan2(y, x)

    return math.degrees(lat_result), math.degrees(lon_result)


def generate_route_stops(trip_data):
    """Generate route stops including fuel and rest breaks"""
    current_lat = trip_data['current_lat']
    current_lng = trip_data['current_lng']
    pickup_lat = trip_data['pickup_lat']
    pickup_lng = trip_data['pickup_lng']
    dropoff_lat = trip_data['dropoff_lat']
    dropoff_lng = trip_data['dropoff_lng']

    dist_to_pickup = calculate_distance(current_lat, current_lng, pickup_lat, pickup_lng)
    dist_pickup_to_dropoff = calculate_distance(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng)
    total_distance = dist_to_pickup + dist_pickup_to_dropoff

    # Average speed: 48 mph
    avg_speed = TripConstants.AVERAGE_SPEED_MILES_PER_HOUR

    route_stops = []
    stop_order = 1
    cumulative_hours = 0
    cumulative_distance = 0
    hours_since_rest = trip_data['current_cycle_hours'] % 11  # Hours since last 10-hour break

    segment_distance = dist_to_pickup
    segment_time = segment_distance / avg_speed

    # Check if we need rest breaks before pickup
    if hours_since_rest + segment_time > 11:
        time_to_rest = 11 - hours_since_rest
        distance_to_rest = time_to_rest * avg_speed
        fraction = distance_to_rest / segment_distance
        rest_lat, rest_lng = interpolate_point(current_lat, current_lng, pickup_lat, pickup_lng, fraction)

        route_stops.append({
            'stop_type': 'rest',
            'location_name': f'Rest Stop (after {time_to_rest:.1f}h driving)',
            'latitude': rest_lat,
            'longitude': rest_lng,
            'order': stop_order,
            'duration_hours': 10.0,
            'distance_from_previous': distance_to_rest,
            'cumulative_hours': cumulative_hours + time_to_rest
        })
        stop_order += 1
        cumulative_hours += time_to_rest + 10
        cumulative_distance += distance_to_rest
        hours_since_rest = 0
        segment_distance -= distance_to_rest

    # Check for fuel stops to pickup
    while cumulative_distance + segment_distance > cumulative_distance + 1000:
        distance_to_fuel = 1000 - (cumulative_distance % 1000) if cumulative_distance % 1000 != 0 else 1000
        time_to_fuel = distance_to_fuel / avg_speed

        # Check if we can reach fuel stop within hours of service
        if hours_since_rest + time_to_fuel > 11:
            time_to_rest = 11 - hours_since_rest
            distance_to_rest = time_to_rest * avg_speed
            total_dist = cumulative_distance + distance_to_rest
            remaining_from_start = dist_to_pickup - (total_dist - 0)
            fraction = (dist_to_pickup - remaining_from_start) / dist_to_pickup
            rest_lat, rest_lng = interpolate_point(current_lat, current_lng, pickup_lat, pickup_lng, fraction)

            route_stops.append({
                'stop_type': 'rest',
                'location_name': f'Rest Stop',
                'latitude': rest_lat,
                'longitude': rest_lng,
                'order': stop_order,
                'duration_hours': 10.0,
                'distance_from_previous': distance_to_rest,
                'cumulative_hours': cumulative_hours + time_to_rest
            })
            stop_order += 1
            cumulative_hours += time_to_rest + 10
            cumulative_distance += distance_to_rest
            hours_since_rest = 0
            segment_distance -= distance_to_rest
            continue

        fraction = (cumulative_distance + distance_to_fuel) / dist_to_pickup
        fuel_lat, fuel_lng = interpolate_point(current_lat, current_lng, pickup_lat, pickup_lng, fraction)

        route_stops.append({
            'stop_type': 'fuel',
            'location_name': f'Fuel Stop',
            'latitude': fuel_lat,
            'longitude': fuel_lng,
            'order': stop_order,
            'duration_hours': 1.0,
            'distance_from_previous': distance_to_fuel,
            'cumulative_hours': cumulative_hours + time_to_fuel
        })
        stop_order += 1
        cumulative_hours += time_to_fuel + 1
        cumulative_distance += distance_to_fuel
        hours_since_rest += time_to_fuel + 1
        segment_distance -= distance_to_fuel

    # Pickup stop
    remaining_time = segment_distance / avg_speed
    route_stops.append({
        'stop_type': 'pickup',
        'location_name': trip_data['pickup_location'],
        'latitude': pickup_lat,
        'longitude': pickup_lng,
        'order': stop_order,
        'duration_hours': 1.0,
        'distance_from_previous': segment_distance,
        'cumulative_hours': cumulative_hours + remaining_time
    })
    stop_order += 1
    cumulative_hours += remaining_time + 1
    cumulative_distance += segment_distance
    hours_since_rest += remaining_time + 1

    segment_distance = dist_pickup_to_dropoff

    # Continue with rest and fuel stops until dropoff
    temp_distance = 0
    while temp_distance < segment_distance:
        if hours_since_rest >= 11:
            fraction = (cumulative_distance - dist_to_pickup + temp_distance) / dist_pickup_to_dropoff
            rest_lat, rest_lng = interpolate_point(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, fraction)

            route_stops.append({
                'stop_type': 'rest',
                'location_name': f'Rest Stop',
                'latitude': rest_lat,
                'longitude': rest_lng,
                'order': stop_order,
                'duration_hours': 10.0,
                'distance_from_previous': 0,
                'cumulative_hours': cumulative_hours
            })
            stop_order += 1
            cumulative_hours += 10
            hours_since_rest = 0

        # Check fuel needs
        next_fuel_distance = 1000 - (cumulative_distance % 1000) if cumulative_distance % 1000 != 0 else 1000
        if temp_distance + next_fuel_distance < segment_distance and next_fuel_distance < segment_distance - temp_distance:
            time_to_fuel = next_fuel_distance / avg_speed

            if hours_since_rest + time_to_fuel > 11:
                time_to_rest = 11 - hours_since_rest
                distance_to_rest = time_to_rest * avg_speed
                fraction = (temp_distance + distance_to_rest) / dist_pickup_to_dropoff
                rest_lat, rest_lng = interpolate_point(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng,
                                                       fraction)

                route_stops.append({
                    'stop_type': 'rest',
                    'location_name': f'Rest Stop',
                    'latitude': rest_lat,
                    'longitude': rest_lng,
                    'order': stop_order,
                    'duration_hours': 10.0,
                    'distance_from_previous': distance_to_rest,
                    'cumulative_hours': cumulative_hours + time_to_rest
                })
                stop_order += 1
                cumulative_hours += time_to_rest + 10
                cumulative_distance += distance_to_rest
                temp_distance += distance_to_rest
                hours_since_rest = 0
                continue

            fraction = (temp_distance + next_fuel_distance) / dist_pickup_to_dropoff
            fuel_lat, fuel_lng = interpolate_point(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, fraction)

            route_stops.append({
                'stop_type': 'fuel',
                'location_name': f'Fuel Stop',
                'latitude': fuel_lat,
                'longitude': fuel_lng,
                'order': stop_order,
                'duration_hours': 1.0,
                'distance_from_previous': next_fuel_distance,
                'cumulative_hours': cumulative_hours + time_to_fuel
            })
            stop_order += 1
            cumulative_hours += time_to_fuel + 1
            cumulative_distance += next_fuel_distance
            temp_distance += next_fuel_distance
            hours_since_rest += time_to_fuel + 1
        else:
            break

    remaining_distance = segment_distance - temp_distance
    remaining_time = remaining_distance / avg_speed

    # Check if rest needed before dropoff
    if hours_since_rest + remaining_time > 11:
        time_to_rest = 11 - hours_since_rest
        distance_to_rest = time_to_rest * avg_speed
        fraction = (temp_distance + distance_to_rest) / dist_pickup_to_dropoff
        rest_lat, rest_lng = interpolate_point(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, fraction)

        route_stops.append({
            'stop_type': 'rest',
            'location_name': f'Rest Stop',
            'latitude': rest_lat,
            'longitude': rest_lng,
            'order': stop_order,
            'duration_hours': 10.0,
            'distance_from_previous': distance_to_rest,
            'cumulative_hours': cumulative_hours + time_to_rest
        })
        stop_order += 1
        cumulative_hours += time_to_rest + 10
        remaining_distance -= distance_to_rest
        remaining_time = remaining_distance / avg_speed

    route_stops.append({
        'stop_type': 'dropoff',
        'location_name': trip_data['dropoff_location'],
        'latitude': dropoff_lat,
        'longitude': dropoff_lng,
        'order': stop_order,
        'duration_hours': 1.0,
        'distance_from_previous': remaining_distance,
        'cumulative_hours': cumulative_hours + remaining_time
    })

    # +1 is for dropoff time and pickup hour
    total_time = cumulative_hours + remaining_time + 1

    return route_stops, total_distance, total_time

def generate_daily_logs(trip, route_stops):
    """Generate daily logs based on route stops"""
    daily_logs = []
    current_date = datetime.now().date()
    current_time = time(8, 0)  # Start at 8 AM

    logs_by_date = {}

    for stop in route_stops:
        drive_hours = stop['distance_from_previous'] / TripConstants.AVERAGE_SPEED_MILES_PER_HOUR if stop['distance_from_previous'] > 0 else 0

        drive_minutes = int(drive_hours * 60)
        current_datetime = datetime.combine(current_date, current_time)

        # Add driving log entry if there was driving time
        if drive_hours > 0:
            end_datetime = current_datetime + timedelta(minutes=drive_minutes)

            # Check if crosses midnight
            if end_datetime.date() > current_datetime.date():
                midnight = datetime.combine(current_datetime.date() + timedelta(days=1), time(0, 0))
                hours_before_midnight = (midnight - current_datetime).total_seconds() / 3600
                hours_after_midnight = drive_hours - hours_before_midnight

                # First day
                if current_date not in logs_by_date:
                    logs_by_date[current_date] = []
                logs_by_date[current_date].append({
                    'status': 'driving',
                    'start_time': current_time,
                    'end_time': time(23, 59),
                    'duration_hours': hours_before_midnight,
                    'location': stop['location_name']
                })

                # Next day
                current_date = end_datetime.date()
                if current_date not in logs_by_date:
                    logs_by_date[current_date] = []
                logs_by_date[current_date].append({
                    'status': 'driving',
                    'start_time': time(0, 0),
                    'end_time': end_datetime.time(),
                    'duration_hours': hours_after_midnight,
                    'location': stop['location_name']
                })
                current_time = end_datetime.time()
            else:
                if current_date not in logs_by_date:
                    logs_by_date[current_date] = []
                logs_by_date[current_date].append({
                    'status': 'driving',
                    'start_time': current_time,
                    'end_time': end_datetime.time(),
                    'duration_hours': drive_hours,
                    'location': stop['location_name']
                })
                current_time = end_datetime.time()
                current_date = end_datetime.date()

        stop_minutes = int(stop['duration_hours'] * 60)
        current_datetime = datetime.combine(current_date, current_time)
        end_datetime = current_datetime + timedelta(minutes=stop_minutes)

        # Stop scenario mapping
        status_map = {
            'pickup': 'on_duty',
            'dropoff': 'on_duty',
            'fuel': 'on_duty',
            'rest': 'sleeper'
        }

        if end_datetime.date() > current_datetime.date():
            midnight = datetime.combine(current_datetime.date() + timedelta(days=1), time(0, 0))
            hours_before_midnight = (midnight - current_datetime).total_seconds() / 3600
            hours_after_midnight = stop['duration_hours'] - hours_before_midnight

            if current_date not in logs_by_date:
                logs_by_date[current_date] = []
            logs_by_date[current_date].append({
                'status': status_map[stop['stop_type']],
                'start_time': current_time,
                'end_time': time(23, 59),
                'duration_hours': hours_before_midnight,
                'location': stop['location_name']
            })

            current_date = end_datetime.date()
            if current_date not in logs_by_date:
                logs_by_date[current_date] = []
            logs_by_date[current_date].append({
                'status': status_map[stop['stop_type']],
                'start_time': time(0, 0),
                'end_time': end_datetime.time(),
                'duration_hours': hours_after_midnight,
                'location': stop['location_name']
            })
            current_time = end_datetime.time()
        else:
            if current_date not in logs_by_date:
                logs_by_date[current_date] = []
            logs_by_date[current_date].append({
                'status': status_map[stop['stop_type']],
                'start_time': current_time,
                'end_time': end_datetime.time(),
                'duration_hours': stop['duration_hours'],
                'location': stop['location_name']
            })
            current_time = end_datetime.time()
            current_date = end_datetime.date()

    # Create DailyLog objects
    for log_date, entries in logs_by_date.items():
        total_driving = sum(e['duration_hours'] for e in entries if e['status'] == 'driving')
        total_on_duty = sum(e['duration_hours'] for e in entries if e['status'] in ['on_duty', 'driving'])

        daily_log = DailyLog.objects.create(
            trip=trip,
            date=log_date,
            driver_name=trip.driver_name,
            home_terminal=trip.current_location,
            total_hours_driving=total_driving,
            total_hours_on_duty=total_on_duty
        )

        for entry in entries:
            LogEntry.objects.create(
                daily_log=daily_log,
                status=entry['status'],
                start_time=entry['start_time'],
                end_time=entry['end_time'],
                duration_hours=entry['duration_hours'],
                location=entry['location']
            )

        daily_logs.append(daily_log)

    return daily_logs
