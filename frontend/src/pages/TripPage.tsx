import { Card, CardContent } from '@/components/ui/card.tsx'
import { AlertCircle } from 'lucide-react'
import TripSummary from '@/components/trip/TripSummary.tsx'
import {
   Tabs,
   TabsContent,
   TabsList,
   TabsTrigger,
} from '@/components/ui/tabs.tsx'
import RouteMap from '@/components/trip/RouteMap.tsx'
import RouteStopsList from '@/components/trip/RouteStopsList.tsx'
import DailyLogSheet from '@/components/trip/DailyLogSheet.tsx'
import { tripAPI } from '@/lib/api.ts'
import { Button } from '@/components/ui/button.tsx'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'

function TripPage() {
   const navigate = useNavigate()
   const { id } = useParams<{ id: string }>()

   const tripQuery = useQuery({
      queryKey: ['trip', id],
      queryFn: () => tripAPI.getTrip(Number(id)),
      enabled: !!id,
   })

   const trip = tripQuery.data

   return (
      <main>
         <div className="space-y-6 max-w-5xl container mx-auto px-4 sm:px-0 py-10">
            {tripQuery.isLoading && (
               <div className="flex justify-center py-10">
                  <div className="animate-pulse text-center">
                     <p className="text-lg">Loading trip details...</p>
                  </div>
               </div>
            )}

            {tripQuery.isError && (
               <Card className="border-destructive">
                  <CardContent className="pt-6">
                     <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <p>Failed to load trip details. Please try again.</p>
                     </div>
                     <Button onClick={() => navigate('/')} className="mt-4">
                        Go Back to Home
                     </Button>
                  </CardContent>
               </Card>
            )}

            {trip && (
               <>
                  <TripSummary trip={trip} />

                  <Tabs defaultValue="map" className="w-full">
                     <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="map">Route Map</TabsTrigger>
                        <TabsTrigger value="stops">Route Stops</TabsTrigger>
                        <TabsTrigger value="logs">Daily Logs</TabsTrigger>
                     </TabsList>

                     <TabsContent value="map" className="space-y-6">
                        <RouteMap
                           routeStops={trip.route_stops}
                           currentLat={trip.current_lat}
                           currentLng={trip.current_lng}
                        />
                     </TabsContent>

                     <TabsContent value="stops" className="space-y-6">
                        <RouteStopsList routeStops={trip.route_stops} />
                     </TabsContent>

                     <TabsContent value="logs" className="space-y-6">
                        {trip.daily_logs.map((log) => (
                           <DailyLogSheet key={log.id} dailyLog={log} />
                        ))}
                     </TabsContent>
                  </Tabs>

                  <div className="flex justify-center pt-6">
                     <Button
                        onClick={() => navigate('/')}
                        className="p-6 bg-[#006666] text-[#E8E6E3] text-base shadow-lg hover:bg-[#005555] w-full sm:w-auto cursor-pointer"
                     >
                        Plan Another Trip
                     </Button>
                  </div>
               </>
            )}
         </div>
      </main>
   )
}

export default TripPage
