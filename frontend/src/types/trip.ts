export interface Trip {
   id: number
   driver_name: string
   current_location: string
   current_lat: number
   current_lng: number
   pickup_location: string
   pickup_lat: number
   pickup_lng: number
   dropoff_location: string
   dropoff_lat: number
   dropoff_lng: number
   current_cycle_hours: number
   total_distance: number
   estimated_drive_time: number
   total_trip_time: number
   fuel_stops_needed: number
   rest_breaks_needed: number
   created_at: string
   updated_at: string
   route_stops: RouteStop[]
   daily_logs: DailyLog[]
}

export interface RouteStop {
   id: number
   trip: number
   stop_type: 'pickup' | 'dropoff' | 'fuel' | 'rest'
   location_name: string
   latitude: number
   longitude: number
   order: number
   duration_hours: number
   distance_from_previous: number
   cumulative_hours: number
}

export interface DailyLog {
   id: number
   trip: number
   date: string
   driver_name: string
   home_terminal: string
   main_office_address: string
   total_miles_today: number
   total_hours_driving: number
   total_hours_on_duty: number
   bill_of_lading: string
   shipper_commodity: string
   created_at: string
   entries: LogEntry[]
}

export interface LogEntry {
   id: number
   daily_log: number
   status: 'off_duty' | 'sleeper' | 'driving' | 'on_duty'
   start_time: string
   end_time: string
   duration_hours: number
   location: string
   remarks: string
}

export interface TripFormData {
   driver_name: string
   current_location: string
   current_lat: number
   current_lng: number
   pickup_location: string
   pickup_lat: number
   pickup_lng: number
   dropoff_location: string
   dropoff_lat: number
   dropoff_lng: number
   current_cycle_hours: number
}
