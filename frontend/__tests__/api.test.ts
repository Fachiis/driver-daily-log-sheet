import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import { TripFormData } from '../src/types/trip'

const mockAxiosInstance = {
   get: vi.fn(),
   post: vi.fn(),
}

vi.mock('axios', () => {
   return {
      default: {
         create: vi.fn(() => mockAxiosInstance),
         get: vi.fn(),
      },
   }
})

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const { tripAPI, geocodeLocation } = await import('../src/lib/api.ts')

describe('tripAPI', () => {
   beforeEach(() => {
      vi.clearAllMocks()
   })

   describe('createTrip', () => {
      it('should create a trip successfully', async () => {
         const mockTripData: TripFormData = {
            driver_name: 'John Doe',
            current_location: 'New York, NY',
            current_lat: 40.7128,
            current_lng: -74.006,
            pickup_location: 'Philadelphia, PA',
            pickup_lat: 39.9526,
            pickup_lng: -75.1652,
            dropoff_location: 'Washington, DC',
            dropoff_lat: 38.9072,
            dropoff_lng: -77.0369,
            current_cycle_hours: 0,
         }

         const mockResponse = {
            data: {
               id: 1,
               ...mockTripData,
               route_stops: [],
               daily_logs: [],
               created_at: '2025-10-06T08:00:00Z',
            },
         }

         mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

         const result = await tripAPI.createTrip(mockTripData)

         expect(mockAxiosInstance.post).toHaveBeenCalledWith(
            '/trips/',
            mockTripData
         )
         expect(result).toEqual(mockResponse.data)
         expect(result.id).toBe(1)
         expect(result.driver_name).toBe('John Doe')
      })

      it('should throw error when API call fails', async () => {
         const mockTripData: TripFormData = {
            driver_name: 'John Doe',
            current_location: 'New York, NY',
            current_lat: 40.7128,
            current_lng: -74.006,
            pickup_location: 'Philadelphia, PA',
            pickup_lat: 39.9526,
            pickup_lng: -75.1652,
            dropoff_location: 'Washington, DC',
            dropoff_lat: 38.9072,
            dropoff_lng: -77.0369,
            current_cycle_hours: 0,
         }

         mockAxiosInstance.post.mockRejectedValueOnce(
            new Error('Network error')
         )

         await expect(tripAPI.createTrip(mockTripData)).rejects.toThrow(
            'Network error'
         )
      })
   })

   describe('getTrip', () => {
      it('should fetch a trip by ID successfully', async () => {
         const mockTrip = {
            id: 1,
            driver_name: 'John Doe',
            route_stops: [],
            daily_logs: [],
         }

         const mockResponse = {
            data: mockTrip,
         }

         mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

         const result = await tripAPI.getTrip(1)

         expect(mockAxiosInstance.get).toHaveBeenCalledWith('/trips/1/')
         expect(result).toEqual(mockTrip)
         expect(result.id).toBe(1)
      })

      it('should throw error when trip not found', async () => {
         mockAxiosInstance.get.mockRejectedValueOnce(
            new Error('Trip not found')
         )

         await expect(tripAPI.getTrip(999)).rejects.toThrow('Trip not found')
      })
   })
})

describe('geocodeLocation', () => {
   beforeEach(() => {
      vi.clearAllMocks()
   })

   it('should geocode an address successfully', async () => {
      const mockResponse = {
         data: [
            {
               lat: '40.7128',
               lon: '-74.0060',
               display_name: 'New York, NY, USA',
            },
         ],
      }

      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse)

      const result = await geocodeLocation('New York, NY')

      expect(result).toEqual({
         lat: 40.7128,
         lng: -74.006,
         display_name: 'New York, NY, USA',
      })
   })

   it('should return null when no results found', async () => {
      const mockResponse = {
         data: [],
      }

      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse)

      const result = await geocodeLocation('InvalidAddress')

      expect(result).toBeNull()
   })

   it('should return null on error', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('API error'))

      const result = await geocodeLocation('New York, NY')

      expect(result).toBeNull()
   })
})
