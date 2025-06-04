import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import ProfileForm from '@/components/profile/profile-form';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock next/navigation
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('ProfileForm', () => {
  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  beforeEach(() => {
    // Reset fetch mock
    (fetch as jest.Mock).mockClear();
    mockPush.mockClear();
    mockRefresh.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders profile form with user data', () => {
    render(<ProfileForm user={mockUser} />);

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Profile Information')).toBeInTheDocument();
    expect(screen.getByText('Change Password')).toBeInTheDocument();
  });

  it('allows updating profile information', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, user: { ...mockUser, name: 'Jane Doe' } }),
    });

    render(<ProfileForm user={mockUser} />);

    const nameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Jane Doe',
          email: 'john@example.com',
        }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });

    expect(mockRefresh).toHaveBeenCalled();
  });

  it('validates password change requirements', async () => {
    render(<ProfileForm user={mockUser} />);

    const newPasswordInput = screen.getByLabelText('New Password');
    fireEvent.change(newPasswordInput, { target: { value: 'newpass' } });

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Current password is required to change password')
      ).toBeInTheDocument();
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it('validates password confirmation', async () => {
    render(<ProfileForm user={mockUser} />);

    const currentPasswordInput = screen.getByLabelText('Current Password');
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');

    fireEvent.change(currentPasswordInput, { target: { value: 'oldpass' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpass' } });

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('New passwords do not match')).toBeInTheDocument();
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Email already in use' }),
    });

    render(<ProfileForm user={mockUser} />);

    const emailInput = screen.getByDisplayValue('john@example.com');
    fireEvent.change(emailInput, { target: { value: 'taken@example.com' } });

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument();
    });
  });
});
