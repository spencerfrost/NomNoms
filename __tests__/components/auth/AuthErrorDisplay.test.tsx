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

    // Check that the Alert component is rendered with the expected destructive styling
    const alertElement = screen.getByRole('alert')
    expect(alertElement).toBeInTheDocument()
    expect(alertElement).toHaveClass('text-destructive')
    expect(alertElement).toHaveClass('border')
  })

  it('applies custom className when provided', () => {
    const errorMessage = 'Test error'
    const customClass = 'custom-error-class'
    
    render(<AuthErrorDisplay error={errorMessage} className={customClass} />)

    const alertElement = screen.getByRole('alert')
    expect(alertElement).toHaveClass(customClass)
  })
})
