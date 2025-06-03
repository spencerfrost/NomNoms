import { render, screen } from '@testing-library/react'
import { AuthErrorDisplay } from '@/components/auth/AuthErrorDisplay'

describe('AuthErrorDisplay', () => {
  it('renders error message correctly', () => {
    const errorMessage = 'Invalid credentials'
    
    render(<AuthErrorDisplay error={errorMessage} />)

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('applies default styling', () => {
    const errorMessage = 'Test error'
    
    render(<AuthErrorDisplay error={errorMessage} />)

    const errorElement = screen.getByText(errorMessage)
    expect(errorElement).toHaveClass('text-red-600', 'text-sm', 'text-center')
  })

  it('applies custom className when provided', () => {
    const errorMessage = 'Test error'
    const customClass = 'custom-error-class'
    
    render(<AuthErrorDisplay error={errorMessage} className={customClass} />)

    const errorElement = screen.getByText(errorMessage)
    expect(errorElement).toHaveClass(customClass)
  })
})
