import {
   Bed,
   Clock,
   Clock7,
   Fuel,
   LandPlot,
   MapPin,
   Navigation,
   Package,
} from 'lucide-react'
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from '@/components/ui/card.tsx'
import type { RouteStop } from '@/types/trip.ts'
import { Badge } from '@/components/ui/badge.tsx'

interface RouteStopsListProps {
   routeStops: RouteStop[]
}

const getStopIcon = (stopType: string) => {
   switch (stopType) {
      case 'pickup':
         return <Package className="h-4 w-4" />
      case 'dropoff':
         return <MapPin className="h-4 w-4" />
      case 'fuel':
         return <Fuel className="h-4 w-4" />
      case 'rest':
         return <Bed className="h-4 w-4" />
      default:
         return <Navigation className="h-4 w-4" />
   }
}

const getStopVariant = (
   stopType: string
): 'default' | 'secondary' | 'destructive' | 'outline' => {
   switch (stopType) {
      case 'pickup':
         return 'default'
      case 'dropoff':
         return 'default'
      case 'fuel':
         return 'secondary'
      case 'rest':
         return 'outline'
      default:
         return 'outline'
   }
}

export default function RouteStopsList({ routeStops }: RouteStopsListProps) {
   return (
      <Card className="w-full">
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <Navigation className="h-5 w-5" />
               Route Stops & Timeline
            </CardTitle>
         </CardHeader>
         <CardContent>
            <div className="space-y-4">
               {routeStops.map((stop, index) => (
                  <div
                     key={stop.id}
                     className="flex gap-4 p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                     <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                           {getStopIcon(stop.stop_type)}
                        </div>
                        {index < routeStops.length - 1 && (
                           <div className="w-0.5 h-full bg-border mt-2" />
                        )}
                     </div>

                     <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                           <div>
                              <h4 className="font-semibold">
                                 {stop.location_name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                 Stop #{stop.order}
                              </p>
                           </div>
                           <Badge variant={getStopVariant(stop.stop_type)}>
                              {stop.stop_type.replace('_', ' ').toUpperCase()}
                           </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                           <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{stop.duration_hours}h duration</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <LandPlot className="h-4 w-4 text-muted-foreground" />
                              <span>
                                 {stop.distance_from_previous.toFixed(1)} mi
                              </span>
                           </div>
                           <div className="flex items-center gap-2">
                              <Clock7 className="h-4 w-4 text-muted-foreground" />
                              <span>
                                 {stop.cumulative_hours.toFixed(1)}h total
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </CardContent>
      </Card>
   )
}
