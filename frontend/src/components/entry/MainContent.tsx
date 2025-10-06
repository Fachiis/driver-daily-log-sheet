import InteractiveGrid from '@/components/ui/interactive-grid-pattern.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { AlertCircle, CircleCheckBig, NotebookPen, Truck } from 'lucide-react'
import TripForm from '@/components/trip/TripForm.tsx'
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
import type { TripFormData } from '@/types/trip.ts'
import { tripAPI } from '@/lib/api.ts'
import { Button } from '@/components/ui/button.tsx'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'

function MainContent() {
   const [activeTripId, setActiveTripId] = useState<number | null>(null)

   const tripMutation = useMutation({
      mutationFn: (data: TripFormData) => tripAPI.createTrip(data),
      onSuccess: (newTrip) => {
         setActiveTripId(newTrip.id)
      },
   })

   const tripQuery = useQuery({
      queryKey: ['trip', activeTripId],
      queryFn: () => tripAPI.getTrip(activeTripId as number),
      enabled: activeTripId !== null,
   })

   const features = [
      {
         icon: <Truck className="h-7 w-7 text-white" />,
         title: 'Smart Route Planning',
         description: 'Automatic fuel stops every 1,000 miles',
      },
      {
         icon: <CircleCheckBig className="h-7 w-7 text-white" />,
         title: 'HOS Compliance',
         description: '10-hour rest breaks after 11 hours driving',
      },
      {
         icon: <NotebookPen className="h-7 w-7 text-white" />,
         title: 'ELD Logs',
         description: 'Automatic daily log generation',
      },
   ]

   const handleTripSubmit = (data: TripFormData) => {
      tripMutation.mutate(data)
   }

   const trip = tripQuery.data

   return (
      <main>
         {!activeTripId ? (
            <div className="space-y-6">
               <div className="w-full text-center space-y-4 mb-12 relative isolate">
                  <div className="absolute inset-0 -z-20 h-full w-full">
                     <InteractiveGrid
                        className="w-full h-full"
                        size={30}
                        intensity={0.3}
                        blur={0.7}
                        stroke={0.3}
                        speed={0.4}
                        color="rgb(203 213 225)"
                     />
                  </div>
                  <div className="space-y-4 py-7 px-4 sm:px-0">
                     <h2 className="text-5xl font-bold text-[#E8E6E3] font-sans">
                        Plan Your <span className="text-[#4DE2D3]">Route</span>
                     </h2>
                     <p className="text-xl max-w-2xl mx-auto text-[#C3C2C2]">
                        Enter your trip details to automatically generate
                        optimized routes with fuel stops, rest breaks, and
                        compliant ELD daily logs.
                     </p>
                  </div>
               </div>

               {tripMutation.isError && (
                  <Card className="border-destructive">
                     <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-destructive">
                           <AlertCircle className="h-5 w-5" />
                           <p>
                              Failed to create trip. Please check your inputs
                              and try again.
                           </p>
                        </div>
                     </CardContent>
                  </Card>
               )}

               <div className="px-4 sm:px-0">
                  <TripForm
                     onSubmit={handleTripSubmit}
                     isLoading={tripMutation.isPending}
                  />
               </div>

               <div className="grid md:grid-cols-3 gap-4 mt-12 max-w-5xl container mx-auto px-4 sm:px-0">
                  {features.map((feature, index) => (
                     <Card key={index}>
                        <CardContent className="pt-6">
                           <div className="text-center space-y-2">
                              <div className="mx-auto w-14 h-14 bg-gradient-to-br from-[#16978F] to-[#097472] rounded-xl flex items-center justify-center">
                                 {feature.icon}
                              </div>
                              <h3 className="font-semibold">{feature.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                 {feature.description}
                              </p>
                           </div>
                        </CardContent>
                     </Card>
                  ))}
               </div>

               <div className="bg-[#1C1D1E] pb-10">
                  <div className="mt-12 pt-8 px-4 sm:px-0">
                     <div className="text-center mb-8  max-w-5xl container mx-auto">
                        <h3 className="text-4xl font-bold mb-2 text-[#C3BEB6]">
                           Why Choose Our{' '}
                           <span className="text-[#1A968F]">Trip Planner?</span>
                        </h3>
                        <p className="text-[#C3BEB6] max-w-2xl mx-auto">
                           Our platform is designed by truckers, for truckers.
                           We understand the unique challenges of long-haul
                           driving and build solutions that make your job
                           easier.
                        </p>
                     </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6  max-w-5xl container mx-auto px-4 sm:px-0">
                     <Card className="overflow-hidden">
                        <div className="h-60 bg-gradient-to-r from-[#16978F] to-[#097472]">
                           <img
                              src="/truck2.webp"
                              alt="Route Planning"
                              className="w-full h-full object-cover opacity-80"
                           />
                        </div>
                        <CardContent className="pt-6">
                           <h4 className="text-lg font-semibold mb-2">
                              Compliance Without Compromise
                           </h4>
                           <p className="text-muted-foreground">
                              Stay compliant with HOS regulations while
                              maximizing your driving time. Our intelligent
                              planning ensures you meet all requirements without
                              sacrificing efficiency.
                           </p>
                        </CardContent>
                     </Card>

                     <Card className="overflow-hidden">
                        <div className="h-60 bg-gradient-to-r from-[#16978F] to-[#097472]">
                           <img
                              src="/truck1.webp"
                              alt="Route Planning"
                              className="w-full h-full object-cover opacity-80"
                           />
                        </div>
                        <CardContent className="pt-6">
                           <h4 className="text-lg font-semibold mb-2">
                              Save Time & Fuel
                           </h4>
                           <p className="text-muted-foreground">
                              Our optimized route planning helps reduce
                              unnecessary miles and identifies the most
                              cost-effective fuel stops along your journey,
                              putting more money back in your pocket.
                           </p>
                        </CardContent>
                     </Card>
                  </div>
               </div>
            </div>
         ) : (
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
                        <Button
                           onClick={() => setActiveTripId(null)}
                           className="mt-4"
                        >
                           Go Back
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
                           onClick={() => setActiveTripId(null)}
                           className="p-6 bg-[#006666] text-[#E8E6E3] text-base shadow-lg hover:bg-[#005555] w-full sm:w-auto cursor-pointer"
                        >
                           Plan Another Trip
                        </Button>
                     </div>
                  </>
               )}
            </div>
         )}
      </main>
   )
}

export default MainContent
