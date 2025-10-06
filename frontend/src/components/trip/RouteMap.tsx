import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Bed, Fuel, Map, MapPin, Package } from 'lucide-react'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from '@/components/ui/card.tsx'
import type { RouteStop } from '@/types/trip.ts'

const DefaultIcon = L.icon({
   iconUrl: icon,
   shadowUrl: iconShadow,
   iconSize: [25, 41],
   iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface RouteMapProps {
   routeStops: RouteStop[]
   currentLat: number
   currentLng: number
}

const getStopIcon = (stopType: string) => {
   const iconMap = {
      pickup: '📦',
      dropoff: '🏁',
      fuel: '⛽',
      rest: '🛏️',
   }
   return iconMap[stopType as keyof typeof iconMap] ?? '📍'
}

const getStopColor = (stopType: string) => {
   const colorMap = {
      pickup: '#3b82f6',
      dropoff: '#22c55e',
      fuel: '#f59e0b',
      rest: '#8b5cf6',
   }
   return colorMap[stopType as keyof typeof colorMap] || '#6b7280'
}

export default function RouteMap({
   routeStops,
   currentLat,
   currentLng,
}: Readonly<RouteMapProps>) {
   const mapRef = useRef<L.Map | null>(null)
   const mapContainerRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      if (!mapContainerRef.current) return

      if (!mapRef.current) {
         mapRef.current = L.map(mapContainerRef.current).setView(
            [currentLat, currentLng],
            6
         )

         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
         }).addTo(mapRef.current)
      }

      mapRef.current.eachLayer((layer) => {
         if (layer instanceof L.Marker || layer instanceof L.Polyline) {
            mapRef.current?.removeLayer(layer)
         }
      })

      L.marker([currentLat, currentLng], {
         icon: L.divIcon({
            html: '<div style="font-size: 24px;">📍</div>',
            className: 'custom-div-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
         }),
      })
         .addTo(mapRef.current)
         .bindPopup('<b>Current Location</b>')

      const coordinates: [number, number][] = [[currentLat, currentLng]]

      routeStops.forEach((stop) => {
         coordinates.push([stop.latitude, stop.longitude])

         const stopColor = getStopColor(stop.stop_type)
         const icon = L.divIcon({
            html: `<div style="font-size: 24px; color: ${stopColor};">${getStopIcon(stop.stop_type)}</div>`,
            className: 'custom-div-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
         })

         L.marker([stop.latitude, stop.longitude], { icon })
            .addTo(mapRef.current!)
            .bindPopup(
               `<b>${stop.location_name}</b><br/>
          Type: ${stop.stop_type}<br/>
          Duration: ${stop.duration_hours}h<br/>
          Distance from previous: ${stop.distance_from_previous.toFixed(1)} mi<br/>
          Cumulative hours: ${stop.cumulative_hours.toFixed(1)}h`
            )
      })

      L.polyline(coordinates, {
         color: '#3b82f6',
         weight: 3,
         opacity: 0.7,
      }).addTo(mapRef.current)

      if (coordinates.length > 1) {
         mapRef.current.fitBounds(L.latLngBounds(coordinates), {
            padding: [50, 50],
         })
      }
   }, [routeStops, currentLat, currentLng])

   return (
      <Card className="w-full">
         <CardHeader>
            <div className="flex items-center gap-2">
               <Map className="h-5 w-5 text-primary" />
               <CardTitle>Route Map</CardTitle>
            </div>
         </CardHeader>
         <CardContent>
            <div
               ref={mapContainerRef}
               className="h-[550px] w-full rounded-lg overflow-hidden border"
            />

            <div className="mt-4 flex flex-wrap gap-3">
               <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#3b82f6]" />
                  <span className="text-sm">Pickup</span>
               </div>
               <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#22c55e]" />
                  <span className="text-sm">Dropoff</span>
               </div>
               <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-[#f59e0b]" />
                  <span className="text-sm">Fuel Stop</span>
               </div>
               <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-[#8b5cf6]" />
                  <span className="text-sm">Rest Break</span>
               </div>
            </div>
         </CardContent>
      </Card>
   )
}
