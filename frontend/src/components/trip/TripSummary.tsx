import { Bed, Clock, Fuel, MapMinus, MapPin, Navigation } from 'lucide-react'
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from '@/components/ui/card.tsx'
import type { Trip } from '@/types/trip.ts'

interface TripSummaryProps {
   trip: Trip
}

export default function TripSummary({ trip }: Readonly<TripSummaryProps>) {
   return (
      <Card className="w-full">
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <MapMinus className="h-5 w-5" />
               Trip Summary
            </CardTitle>
         </CardHeader>
         <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                     <Navigation className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                     <p className="text-sm text-muted-foreground">
                        Total Distance
                     </p>
                     <p className="text-2xl font-bold">
                        {trip.total_distance.toFixed(0)} mi
                     </p>
                  </div>
               </div>

               <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                     <Clock className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                     <p className="text-sm text-muted-foreground">
                        Estimated Drive Time
                     </p>
                     <p className="text-2xl font-bold">
                        {trip.estimated_drive_time.toFixed(1)} hrs
                     </p>
                  </div>
               </div>

               <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                     <Clock className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                     <p className="text-sm text-muted-foreground">
                        Total Trip Time
                     </p>
                     <p className="text-2xl font-bold">
                        {trip.total_trip_time.toFixed(1)} hrs
                     </p>
                  </div>
               </div>

               <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                     <Fuel className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                     <p className="text-sm text-muted-foreground">Fuel Stops</p>
                     <p className="text-2xl font-bold">
                        {trip.fuel_stops_needed}
                     </p>
                  </div>
               </div>

               <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                     <Bed className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                     <p className="text-sm text-muted-foreground">
                        Rest Breaks
                     </p>
                     <p className="text-2xl font-bold">
                        {trip.rest_breaks_needed}
                     </p>
                  </div>
               </div>

               <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                     <MapPin className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                     <p className="text-sm text-muted-foreground">
                        Total Stops
                     </p>
                     <p className="text-2xl font-bold">
                        {trip.route_stops.length}
                     </p>
                  </div>
               </div>
            </div>

            <div className="mt-6 space-y-3">
               <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                     <p className="text-sm font-medium">Current Location</p>
                     <p className="text-sm text-muted-foreground">
                        {trip.current_location}
                     </p>
                  </div>
               </div>
               <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-blue-500" />
                  <div>
                     <p className="text-sm font-medium">Pickup Location</p>
                     <p className="text-sm text-muted-foreground">
                        {trip.pickup_location}
                     </p>
                  </div>
               </div>
               <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-green-500" />
                  <div>
                     <p className="text-sm font-medium">Dropoff Location</p>
                     <p className="text-sm text-muted-foreground">
                        {trip.dropoff_location}
                     </p>
                  </div>
               </div>
            </div>
         </CardContent>
      </Card>
   )
}
