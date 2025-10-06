import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TripForm from '../src/components/trip/TripForm'

vi.mock('@/lib/api', () => ({
   geocodeLocation: vi.fn(),
}))

describe('TripForm', () => {
   const mockOnSubmit = vi.fn()

   beforeEach(() => {
      vi.clearAllMocks()
   })

   it('should render the form with all fields', () => {
      render(<TripForm onSubmit={mockOnSubmit} isLoading={false} />)

      expect(screen.getByText('Plan Your Trip')).toBeInTheDocument()
      expect(screen.getByLabelText(/driver name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/current location/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/pickup location/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/dropoff location/i)).toBeInTheDocument()
   })

   it('should allow typing in driver name field', async () => {
      const user = userEvent.setup()
      render(<TripForm onSubmit={mockOnSubmit} isLoading={false} />)

      const driverNameInput = screen.getByLabelText(/driver name/i)
      await user.type(driverNameInput, 'John Doe')

      expect(driverNameInput).toHaveValue('John Doe')
   })

   it('should disable submit button when form is invalid', () => {
      render(<TripForm onSubmit={mockOnSubmit} isLoading={false} />)

      const submitButton = screen.getByText(/generate trip plan/i)
      expect(submitButton).toBeDisabled()
   })

   it('should show loading state when isLoading is true', () => {
      render(<TripForm onSubmit={mockOnSubmit} isLoading={true} />)

      expect(screen.getByText(/generating route/i)).toBeInTheDocument()
   })
})
