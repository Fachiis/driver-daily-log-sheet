import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import NavBar from '../src/components/entry/NavBar'
import Footer from '../src/components/entry/Footer'

vi.mock('@/lib/api', () => ({
   geocodeLocation: vi.fn(),
   tripAPI: {
      createTrip: vi.fn(),
      getTrip: vi.fn(),
   },
}))

const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         retry: false,
      },
   },
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
   <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
   </QueryClientProvider>
)

describe('App Components', () => {
   it('should render the NavBar', () => {
      render(<NavBar />, { wrapper })

      expect(screen.getByText('Spotter ELD')).toBeInTheDocument()
      expect(screen.getByText(/electronic logging device/i)).toBeInTheDocument()
   })

   it('should render the Footer', () => {
      render(<Footer />, { wrapper })

      expect(screen.getByText(/© 2025 spotter eld/i)).toBeInTheDocument()
   })
})
