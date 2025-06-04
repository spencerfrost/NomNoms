/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import ProfilePage from '@/app/profile/page';

// Mock next-auth
jest.mock('next-auth');
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock redirect
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

const mockPrismaUserFindUnique = prisma.user.findUnique as jest.MockedFunction<
  typeof prisma.user.findUnique
>;

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders profile page for authenticated user', async () => {
    const mockSession = {
      user: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      },
    };

    const mockUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: 'user',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      recipes: [
        {
          id: 'recipe-1',
          slug: 'test-recipe',
          title: 'Test Recipe',
          description: 'A test recipe',
          image: null,
          visibility: 'public',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          tags: ['test'],
        },
      ],
    };

    mockGetServerSession.mockResolvedValue(mockSession);
    mockPrismaUserFindUnique.mockResolvedValue(mockUser);

    const component = await ProfilePage();
    render(component);

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Manage your account and recipes')).toBeInTheDocument();
  });
});
