# Spotter ELD - Electronic Logging Device & Route Planner

A full-stack application for property-carrying drivers that generates optimized routes with automatic fuel stops, HOS-compliant rest breaks, and ELD daily logs.

## 🚀 Features

- **Smart Route Planning**: Automatically calculates optimal routes from current location to pickup and dropoff
- **Fuel Stop Management**: Automatic fuel stops every 1,000 miles (1-hour duration each)
- **HOS Compliance**: Enforces 10-hour rest breaks after 11 hours of driving
- **ELD Daily Logs**: Auto-generates compliant daily log sheets with timeline visualization
- **Interactive Map**: Visual route display with markers for all stops using Leaflet
- **Real-time Geocoding**: Location search using OpenStreetMap Nominatim API
- **Modern UI**: Clean, responsive interface with shadcn/ui components

## 🛠️ Tech Stack

### Backend
- **Django 5.2.7** - Python web framework
- **Django REST Framework 3.16.1** - API development
- **SQLite** - Database
- **django-cors-headers 4.9.0** - CORS support
- **python-dotenv 1.1.1** - Environment variable management

### Frontend
- **React 19** - UI library
- **TypeScript 5.8** - Type safety
- **Vite 7** - Build tool & dev server
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Component library (Radix UI primitives)
- **Leaflet 1.9** - Interactive maps
- **React Leaflet 5.0** - React bindings for Leaflet
- **Axios 1.12** - HTTP client
- **TanStack Query 5.90** - Data fetching & caching
- **React Hook Form 7.64** - Form management & validation
- **Lucide React** - Icon library
- **Yarn** - Package manager

## 📋 Prerequisites

- Python 3.9+
- Node.js 18+
- Yarn package manager (`npm install -g yarn`)

## 🏃 Getting Started

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On macOS/Linux
# or
.venv\Scripts\activate  # On Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Start the development server:
```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
yarn install
```

3. Start the development server:
```bash
yarn dev
```

The frontend will be available at `http://localhost:5173`

## 📖 Usage

1. **Open the application** at `http://localhost:5173`

2. **Fill in the trip form**:
   - Current Location - Enter address and click the map pin icon to geocode
   - Pickup Location - Enter address and click the map pin icon to geocode
   - Dropoff Location - Enter address and click the map pin icon to geocode
   - Current Cycle Hours (hours already used in 8-day cycle, 0-70)
   - Driver Name (Optional)

3. **Click "Generate Trip Plan"** to create your route

4. **View your results**:
   - **Trip Summary**: Overview of distance, time, and stops
   - **Route Map**: Interactive map showing all stops with colored markers
   - **Route Stops**: Detailed timeline of all stops with durations and distances
   - **Daily Logs**: Complete ELD daily log sheets with 24-hour timelines

## 🧮 Calculations & Assumptions

### Trip Planning Logic
- **Average Speed**: 48 mph
- **Fueling Frequency**: Every 1,000 miles
- **Fuel Stop Duration**: 1 hour
- **Pickup/Dropoff Duration**: 1 hour each
- **Rest Break Trigger**: After 11 hours of driving
- **Rest Break Duration**: 10 hours (sleeper berth)
- **70-Hour Rule**: Tracks cumulative hours in 8-day cycle

### Route Stop Generation
1. Calculate total distance using Haversine formula
2. Divide route into segments (current→pickup, pickup→dropoff)
3. Insert fuel stops every 1,000 miles along the route
4. Insert mandatory rest breaks when driver reaches 11 hours of driving
5. Account for pickup/dropoff time (1 hour each)
6. Calculate cumulative hours for each stop
7. Use spherical interpolation to determine coordinates for fuel and rest stops

### Daily Log Generation
- Starts at 8:00 AM (configurable)
- Tracks all status changes (driving, on_duty, sleeper, off_duty)
- Automatically splits entries across midnight when necessary
- Calculates total driving hours and on-duty hours per day
- Generates visual timeline for each 24-hour period

## 🎯 HOS Compliance

The application enforces FMCSA Hours of Service regulations:
- **11-Hour Driving Limit**: Rest break required after 11 hours of driving
- **10-Hour Rest Break**: Sleeper berth time before resuming driving
- **70-Hour/8-Day Limit**: Tracks cumulative hours in the cycle
- **Automatic Enforcement**: Rest breaks inserted automatically in route

## 📊 API Endpoints

### Trips
- `POST /api/trips/` - Create a new trip with route planning
- `GET /api/trips/` - List all trips
- `GET /api/trips/{id}/` - Get trip details with route stops and daily logs
- `GET /api/trips/{id}/daily_logs/` - Get daily logs for a specific trip

### Request Body (POST /api/trips/)
```json
{
  "current_location": "123 Main St, City, State",
  "current_lat": 40.7128,
  "current_lng": -74.0060,
  "pickup_location": "456 Pickup Ave, City, State",
  "pickup_lat": 41.8781,
  "pickup_lng": -87.6298,
  "dropoff_location": "789 Dropoff Rd, City, State",
  "dropoff_lat": 34.0522,
  "dropoff_lng": -118.2437,
  "current_cycle_hours": 15.5
}
```

## 🗂️ Project Structure

```
Spotter/
├── backend/
│   ├── analytics/                  
│   │   ├── models.py                
│   │   ├── constants.py             
│   │   ├── util.py                  
│   │   ├── admin.py                 
│   │   ├── api/
│   │   │   ├── serializers.py       
│   │   │   ├── views.py             
│   │   │   └── urls.py              
│   │   └── migrations/              
│   ├── backend/
│   │   ├── settings.py              
│   │   ├── urls.py                  
│   │   └── wsgi.py                  
│   ├── manage.py                    
│   ├── requirements.txt             
│   └── db.sqlite3                   
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Entry.tsx            
    │   │   ├── entry/
    │   │   │   ├── NavBar.tsx       
    │   │   │   ├── MainContent.tsx  
    │   │   │   └── Footer.tsx      
    │   │   ├── trip/
    │   │   │   ├── TripForm.tsx     
    │   │   │   ├── TripSummary.tsx  
    │   │   │   ├── RouteMap.tsx     
    │   │   │   ├── RouteStopsList.tsx 
    │   │   │   └── DailyLogSheet.tsx  
    │   │   └── ui/                  
    │   │       ├── card.tsx
    │   │       ├── button.tsx
    │   │       ├── input.tsx
    │   │       ├── label.tsx
    │   │       ├── tabs.tsx
    │   │       ├── badge.tsx
    │   │       ├── shimmer-button.tsx
    │   │       └── interactive-grid-pattern.tsx
    │   ├── types/
    │   │   └── trip.ts              
    │   ├── lib/
    │   │   ├── api.ts               
    │   │   └── utils.ts             
    │   ├── App.tsx                  
    │   ├── main.tsx                 
    │   └── index.css                
    ├── public/                      
    ├── package.json                 
    ├── tsconfig.json                
    ├── vite.config.ts               
    └── components.json             
```

## 🗺️ Map Features

- **Custom Markers**: Visual indicators for each stop type
  - 📍 Current location (red marker)
  - 📦 Pickup location (blue marker)
  - 🏁 Dropoff location (green marker)
  - ⛽ Fuel stops (amber markers)
  - 🛏️ Rest breaks (purple markers)
- **Polylines**: Route visualization connecting all stops in sequence
- **Popups**: Detailed stop information on marker click
- **Auto-fit Bounds**: Automatically adjusts zoom to show entire route
- **Responsive**: Works on mobile and desktop devices

## 📝 Daily Log Features

- **24-Hour Timeline**: Visual representation with colored status bars
- **Status Colors**:
  - 🟢 **Green**: Driving
  - 🟡 **Amber**: On Duty (Not Driving)
  - 🟣 **Purple**: Sleeper Berth
  - ⚫ **Gray**: Off Duty
- **Log Entries Table**: Detailed breakdown of all status changes with times
- **Hour Summaries**: Total driving and on-duty hours per day
- **Multi-day Support**: Automatically creates separate logs for each day

## 🚦 Status Codes

### Stop Types (RouteStop)
- **pickup**: Loading cargo at pickup location
- **dropoff**: Unloading cargo at dropoff location
- **fuel**: Refueling stop (1 hour)
- **rest**: Mandatory rest break (10 hours)

### Driver Status (LogEntry)
- **driving**: Actively driving the vehicle
- **on_duty**: On duty but not driving (loading, fueling, inspection)
- **sleeper**: In sleeper berth (rest break)
- **off_duty**: Off duty time

## 🔧 Development

### Backend Development
```bash
# Create new migration after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser for admin panel
python manage.py createsuperuser

# Access admin panel
http://localhost:8000/admin

# Run tests
python manage.py test
```

### Frontend Development
```bash
# Run development server with hot reload
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Lint code
yarn lint

# Format code with Prettier
yarn format
```

## 🔍 Key Algorithms

### Haversine Distance Calculation
Calculates great-circle distance between two coordinate points on Earth:
```python
def calculate_distance(lat1, lon1, lat2, lon2) -> float:
    pass
```

### Spherical Interpolation
Determines intermediate coordinates along a route:
```python
def interpolate_point(lat1, lon1, lat2, lon2, fraction) -> (float, float):
    pass
```

### Route Stop Generation
Complex algorithm that:
1. Calculates segment distances
2. Inserts fuel stops at 1,000-mile intervals
3. Enforces 11-hour driving limits with rest breaks
4. Tracks cumulative hours and distances
5. Handles multiple segments (current→pickup→dropoff)

### Daily Log Generation
Converts route stops into ELD-compliant daily logs:
1. Maps stop types to driver statuses
2. Splits entries across midnight boundaries
3. Calculates duration for each status
4. Aggregates total driving and on-duty hours

## 🌐 External APIs

### OpenStreetMap Nominatim API
Used for geocoding address searches:
- **Endpoint**: `https://nominatim.openstreetmap.org/search`
- **Usage**: Convert addresses to latitude/longitude coordinates

## 👨‍💻 Development Notes

- All times are handled in 24-hour format
- Distances are in miles, speeds in mph
- Uses Django's timezone-aware datetime handling
- Frontend uses TanStack Query for efficient data caching
- Form validation on both client and server side
- Responsive design works on mobile, tablet, and desktop

