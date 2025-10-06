# Spotter ELD - Electronic Logging Device & Route Planner

A full-stack application for property-carrying drivers that generates optimized routes with automatic fuel stops, HOS-compliant rest breaks, and ELD daily logs.

## Features

- **Smart Route Planning**: Automatically calculates optimal routes from current location to pickup and dropoff
- **Fuel Stop Management**: Automatic fuel stops every 1,000 miles (1-hour duration each)
- **HOS Compliance**: Enforces 10-hour rest breaks after 11 hours of driving
- **ELD Daily Logs**: Auto-generates compliant daily log sheets with timeline visualization
- **Interactive Map**: Visual route display with markers for all stops using Leaflet
- **Real-time Geocoding**: Location search using OpenStreetMap Nominatim API
- **Modern UI**: Clean, responsive interface with shadcn/ui components

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast builds and HMR
- **React Router** for navigation
- **Shadcn/UI** components with Radix UI primitives
- **Tailwind CSS** for styling
- **Vitest** for unit testing
- **Yarn** for package management

### Backend
- **Django 5.1** with Django REST Framework
- **SQLite** database (development)
- **Python 3.13**

## Project Structure

```
Spotter/
├── frontend/               
│   ├── src/
│   │   ├── pages/         
│   │   │   ├── LandingPage.tsx    
│   │   │   └── TripPage.tsx       
│   │   ├── components/    
│   │   │   ├── entry/     
│   │   │   ├── trip/      
│   │   │   └── ui/        
│   │   ├── lib/           
│   │   └── types/         
│   └── __tests__/         
├── backend/               
│   ├── analytics/         
│   │   ├── models.py      
│   │   ├── util.py        
│   │   ├── api/           
│   │   └── tests/         
│   └── backend/           
└── README.md
```

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- Yarn package manager

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On macOS/Linux
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set environment variables for superuser creation (optional):
```bash
export DJANGO_SUPERUSER_USERNAME=admin
export DJANGO_SUPERUSER_EMAIL=admin@example.com
export DJANGO_SUPERUSER_PASSWORD=admin123
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Create superuser (if not using environment variables):
```bash
python manage.py createsuperuser
```

7. Collect static files:
```bash
python manage.py collectstatic --noinput
```

8. Run the development server:
```bash
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables (create `.env` file):
```env
VITE_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
yarn dev
```

Frontend will be available at `http://localhost:5173`

## Running Tests

### Backend Tests
```bash
cd backend
python manage.py test analytics.tests
```

Tests include:
- DailyLog creation and validation
- Trip planning logic
- Driver assignment algorithms
- Vehicle availability checks
- API endpoint tests

### Frontend Tests
```bash
cd frontend
yarn test
```

Tests include:
- Component rendering
- Form validation
- API integration
- Trip calculation logic
- User interactions

## Pages & Routes

### `/` - Landing Page
- Main entry point of the application
- Trip planning form with:
  - Pickup location
  - Dropoff location
  - Pickup time
  - Cargo weight
- Form validation and error handling
- Submit to calculate optimal trip plan

### `/trip/:id` - Trip Results Page
- Displays trip plan results after submission
- Shows assigned driver details
- Shows assigned vehicle information
- Displays trip summary (distance, duration, cost)
- Supports browser back navigation to return to form
- SEO-optimized with dynamic meta tags

## Trip Optimization Algorithm

The trip planner uses a sophisticated algorithm that considers:

1. **Driver Availability**
   - Hours of Service (HOS) compliance
   - Current duty status
   - Available driving hours
   - Rest requirements

2. **Vehicle Availability**
   - Current vehicle status (available/in-use)
   - Vehicle capacity vs cargo weight
   - Maintenance schedules

3. **Route Optimization**
   - Distance calculation
   - Estimated travel time
   - Fuel efficiency
   - Cost estimation

4. **Regulatory Compliance**
   - DOT regulations
   - State-specific rules
   - Weight restrictions

## Calculations & Assumptions

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
