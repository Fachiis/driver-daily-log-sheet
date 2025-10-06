import axios from 'axios'
import type { Trip, TripFormData } from '@/types/trip.ts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
   baseURL: API_BASE_URL,
   headers: {
      'Content-Type': 'application/json',
   },
})

export const tripAPI = {
   createTrip: async (data: TripFormData): Promise<Trip> => {
      const response = await api.post('/trips/', data)
      return response.data
   },

   getTrip: async (id: number): Promise<Trip> => {
      const response = await api.get(`/trips/${id}/`)
      return response.data
   },
}

export const geocodeLocation = async (address: string) => {
   try {
      const response = await axios.get(
         `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      )

      if (response?.data && response?.data?.length > 0) {
         return {
            lat: parseFloat(response?.data[0]?.lat),
            lng: parseFloat(response?.data[0]?.lon),
            display_name: response?.data[0]?.display_name,
         }
      }

      return null
   } catch (error) {
      console.error('Geocoding error:', error)
      return null
   }
}
