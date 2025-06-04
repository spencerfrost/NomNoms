import { render, screen } from '@testing-library/react';
import { AuthFooter } from '@/components/auth/AuthFooter';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

describe('AuthFooter', () => {
  it('renders primary text and link correctly', () => {
    render(
      <AuthFooter
        primaryText="Don't have an account?"
        linkText="Create one"
        linkUrl="/auth/signup"
      />
    );

    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByText('Create one')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/auth/signup');
  });

  it('renders secondary text when provided', () => {
    const secondaryText = 'You can browse recipes without signing in';

    render(
      <AuthFooter
        primaryText="Don't have an account?"
        linkText="Create one"
        linkUrl="/auth/signup"
        secondaryText={secondaryText}
      />
    );

    expect(screen.getByText(secondaryText)).toBeInTheDocument();
  });

  it('applies correct styling to link', () => {
    render(
      <AuthFooter
        primaryText="Don't have an account?"
        linkText="Create one"
        linkUrl="/auth/signup"
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/auth/signup');
    expect(link).toHaveClass('text-blue-600', 'hover:underline');
  });
});
