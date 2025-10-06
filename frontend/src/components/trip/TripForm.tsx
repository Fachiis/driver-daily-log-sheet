import { useState } from 'react'
import type { TripFormData } from '@/types/trip.ts'
import { geocodeLocation } from '@/lib/api.ts'
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from '@/components/ui/card.tsx'
import { Loader2, MapPin, Navigation } from 'lucide-react'
import { Label } from '@/components/ui/label.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Button } from '@/components/ui/button.tsx'
import { ShimmerButton } from '@/components/ui/shimmer-button.tsx'
import { useForm } from 'react-hook-form'

interface TripFormProps {
   onSubmit: (data: TripFormData) => void
   isLoading: boolean
}

export default function TripForm({ onSubmit, isLoading }: TripFormProps) {
   const [locationLoading, setLocationLoading] = useState({
      current: false,
      pickup: false,
      dropoff: false,
   })

   const {
      register,
      handleSubmit,
      setValue,
      watch,
      formState: { errors, isValid },
   } = useForm<TripFormData>({
      defaultValues: {
         driver_name: '',
         current_location: '',
         current_lat: 0,
         current_lng: 0,
         pickup_location: '',
         pickup_lat: 0,
         pickup_lng: 0,
         dropoff_location: '',
         dropoff_lat: 0,
         dropoff_lng: 0,
         current_cycle_hours: 0,
      },
      mode: 'onChange',
   })

   const currentLat = watch('current_lat')
   const pickupLat = watch('pickup_lat')
   const dropoffLat = watch('dropoff_lat')
   const currentLocation = watch('current_location')
   const pickupLocation = watch('pickup_location')
   const dropoffLocation = watch('dropoff_location')

   const handleLocationSearch = async (
      field: 'current' | 'pickup' | 'dropoff',
      address: string
   ) => {
      if (!address.trim()) return

      setLocationLoading((prev) => ({ ...prev, [field]: true }))
      const result = await geocodeLocation(address)
      setLocationLoading((prev) => ({ ...prev, [field]: false }))

      if (result) {
         setValue(`${field}_location`, result?.display_name, {
            shouldValidate: true,
         })
         setValue(`${field}_lat`, result?.lat, { shouldValidate: true })
         setValue(`${field}_lng`, result?.lng, { shouldValidate: true })
      }
   }

   const onFormSubmit = handleSubmit((data) => {
      onSubmit(data)
   })

   const hasValidCoordinates =
      currentLat !== 0 && pickupLat !== 0 && dropoffLat !== 0

   return (
      <Card className="w-full max-w-5xl mx-auto">
         <CardHeader>
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-gradient-to-br from-[#16978F] to-[#097472] rounded-xl items-center justify-center hidden sm:flex">
                  <Navigation className="h-7 w-7 text-white" />
               </div>
               <div>
                  <CardTitle className="text-2xl">Plan Your Trip</CardTitle>
                  <CardDescription>
                     Enter trip details to generate route and ELD logs
                  </CardDescription>
               </div>
            </div>
         </CardHeader>

         <CardContent>
            <form onSubmit={onFormSubmit} className="space-y-6">
               <div className="flex flex-col gap-2">
                  <Label
                     htmlFor="driver_name"
                     className="flex items-center gap-1"
                  >
                     Driver Name (Optional)
                  </Label>
                  <Input
                     id="driver_name"
                     type="text"
                     placeholder="James Clark"
                     className={`py-5 placeholder:text-gray-400 focus:ring-0 focus:ring-[#16978F] focus:outline-none ${
                        errors.driver_name
                           ? 'border-red-500'
                           : 'focus:border-[#16978F]'
                     }`}
                     {...register('driver_name')}
                  />
               </div>

               <div className="flex flex-col gap-2">
                  <Label
                     htmlFor="current_location"
                     className="flex items-center gap-1"
                  >
                     Current Location
                     {errors.current_location && (
                        <span className="text-red-500 text-xs">*Required</span>
                     )}
                  </Label>
                  <div className="flex gap-2">
                     <Input
                        id="current_location"
                        type="text"
                        placeholder="123 Main St, New York, NY"
                        className={`py-5 placeholder:text-gray-400 focus:ring-0 focus:ring-[#16978F] focus:outline-none ${
                           errors.current_location
                              ? 'border-red-500'
                              : 'focus:border-[#16978F]'
                        }`}
                        {...register('current_location', {
                           required: true,
                           validate: (value) => value.trim().length > 0,
                        })}
                     />
                     <Button
                        type="button"
                        variant="outline"
                        className="py-5 cursor-pointer"
                        onClick={() =>
                           handleLocationSearch('current', currentLocation)
                        }
                        disabled={!currentLocation || locationLoading.current}
                     >
                        {locationLoading.current ? (
                           <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                           <div className="flex items-center gap-1 text-xs">
                              <MapPin className="h-4 w-4" />
                              Search
                           </div>
                        )}
                     </Button>
                  </div>
                  {currentLocation && !currentLat && (
                     <span className="text-orange-500 text-xs">
                        *Need coordinates (click Search)
                     </span>
                  )}
                  <input
                     type="hidden"
                     {...register('current_lat', {
                        validate: (value) => value !== 0,
                     })}
                  />
                  <input
                     type="hidden"
                     {...register('current_lng', {
                        validate: (value) => value !== 0,
                     })}
                  />
                  {currentLat !== 0 && (
                     <p className="text-xs text-muted-foreground">
                        Coordinates: {currentLat.toFixed(4)},{' '}
                        {watch('current_lng').toFixed(4)}
                     </p>
                  )}
               </div>

               <div className="flex flex-col gap-2">
                  <Label
                     htmlFor="pickup_location"
                     className="flex items-center gap-1"
                  >
                     Pickup Location
                     {errors.pickup_location && (
                        <span className="text-red-500 text-xs">*Required</span>
                     )}
                  </Label>
                  <div className="flex gap-2">
                     <Input
                        id="pickup_location"
                        type="text"
                        placeholder="456 Warehouse Ave, Chicago, IL"
                        className={`py-5 placeholder:text-gray-400 focus:ring-0 focus:ring-[#16978F] focus:outline-none ${
                           errors.pickup_location
                              ? 'border-red-500'
                              : 'focus:border-[#16978F]'
                        }`}
                        {...register('pickup_location', {
                           required: true,
                           validate: (value) => value.trim().length > 0,
                        })}
                     />
                     <Button
                        type="button"
                        variant="outline"
                        className="py-5 cursor-pointer"
                        onClick={() =>
                           handleLocationSearch('pickup', pickupLocation)
                        }
                        disabled={!pickupLocation || locationLoading.pickup}
                     >
                        {locationLoading.pickup ? (
                           <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                           <div className="flex items-center gap-1 text-xs">
                              <MapPin className="h-4 w-4" />
                              Search
                           </div>
                        )}
                     </Button>
                  </div>
                  {pickupLocation && !pickupLat && (
                     <span className="text-orange-500 text-xs">
                        *Need coordinates (click Search)
                     </span>
                  )}
                  <input
                     type="hidden"
                     {...register('pickup_lat', {
                        validate: (value) => value !== 0,
                     })}
                  />
                  <input
                     type="hidden"
                     {...register('pickup_lng', {
                        validate: (value) => value !== 0,
                     })}
                  />
                  {pickupLat !== 0 && (
                     <p className="text-xs text-muted-foreground">
                        Coordinates: {pickupLat.toFixed(4)},{' '}
                        {watch('pickup_lng').toFixed(4)}
                     </p>
                  )}
               </div>

               <div className="flex flex-col gap-2">
                  <Label
                     htmlFor="dropoff_location"
                     className="flex items-center gap-1"
                  >
                     Dropoff Location
                     {errors.dropoff_location && (
                        <span className="text-red-500 text-xs">*Required</span>
                     )}
                  </Label>
                  <div className="flex gap-2">
                     <Input
                        id="dropoff_location"
                        type="text"
                        placeholder="789 Delivery Blvd, Los Angeles, CA"
                        className={`py-5 placeholder:text-gray-400 focus:ring-0 focus:ring-[#16978F] focus:outline-none ${
                           errors.dropoff_location
                              ? 'border-red-500'
                              : 'focus:border-[#16978F]'
                        }`}
                        {...register('dropoff_location', {
                           required: true,
                           validate: (value) => value.trim().length > 0,
                        })}
                     />
                     <Button
                        type="button"
                        variant="outline"
                        className="py-5 cursor-pointer"
                        onClick={() =>
                           handleLocationSearch('dropoff', dropoffLocation)
                        }
                        disabled={!dropoffLocation || locationLoading.dropoff}
                     >
                        {locationLoading.dropoff ? (
                           <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                           <div className="flex items-center gap-1 text-xs">
                              <MapPin className="h-4 w-4" />
                              Search
                           </div>
                        )}
                     </Button>
                  </div>
                  {dropoffLocation && !dropoffLat && (
                     <span className="text-orange-500 text-xs">
                        *Need coordinates (click Search)
                     </span>
                  )}
                  <input
                     type="hidden"
                     {...register('dropoff_lat', {
                        validate: (value) => value !== 0,
                     })}
                  />
                  <input
                     type="hidden"
                     {...register('dropoff_lng', {
                        validate: (value) => value !== 0,
                     })}
                  />
                  {dropoffLat !== 0 && (
                     <p className="text-xs text-muted-foreground">
                        Coordinates: {dropoffLat.toFixed(4)},{' '}
                        {watch('dropoff_lng').toFixed(4)}
                     </p>
                  )}
               </div>

               <div className="flex flex-col gap-2">
                  <Label htmlFor="current_cycle_hours">
                     Current Cycle Hours Used (out of 70hrs/8days)
                  </Label>
                  <Input
                     id="current_cycle_hours"
                     type="number"
                     step="0.1"
                     min="0"
                     max="70"
                     placeholder="0"
                     className="py-5 placeholder:text-gray-400 focus:ring-0 focus:ring-[#16978F] focus:outline-none focus:border-[#16978F]"
                     {...register('current_cycle_hours', {
                        required: true,
                        min: 0,
                        max: 70,
                        valueAsNumber: true,
                     })}
                  />
                  <p className="text-xs text-muted-foreground">
                     Hours already driven in the current 8-day cycle
                  </p>
               </div>

               <ShimmerButton
                  type="submit"
                  className={`w-full ${
                     !isValid ||
                     !hasValidCoordinates ||
                     isLoading ||
                     locationLoading.current ||
                     locationLoading.pickup ||
                     locationLoading.dropoff
                        ? 'cursor-not-allowed opacity-50'
                        : ''
                  }`}
                  borderRadius={'10px'}
                  disabled={
                     !isValid ||
                     !hasValidCoordinates ||
                     isLoading ||
                     locationLoading.current ||
                     locationLoading.pickup ||
                     locationLoading.dropoff
                  }
               >
                  {isLoading ? (
                     <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Route...
                     </>
                  ) : (
                     'Generate Trip Plan'
                  )}
               </ShimmerButton>
            </form>
         </CardContent>
      </Card>
   )
}
