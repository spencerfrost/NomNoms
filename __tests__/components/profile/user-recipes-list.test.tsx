import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserRecipesList from '@/components/profile/user-recipes-list';

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

describe('UserRecipesList', () => {
  beforeEach(() => {
    // Reset fetch mock
    (fetch as jest.Mock).mockClear();
    mockPush.mockClear();
    mockRefresh.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockRecipes = [
    {
      id: 'recipe-1',
      slug: 'chocolate-cake',
      title: 'Chocolate Cake',
      description: 'A delicious chocolate cake recipe',
      image: null,
      visibility: 'public',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      tags: ['dessert', 'chocolate', 'cake'],
    },
    {
      id: 'recipe-2',
      slug: 'pasta-sauce',
      title: 'Pasta Sauce',
      description: 'Simple tomato pasta sauce',
      image: null,
      visibility: 'private',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      tags: ['dinner'],
    },
  ];

  it('renders empty state when no recipes', () => {
    render(<UserRecipesList recipes={[]} />);

    expect(screen.getByText('No recipes yet')).toBeInTheDocument();
    expect(
      screen.getByText('Start building your recipe collection by adding your first recipe.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add your first recipe/i })).toBeInTheDocument();
  });

  it('renders list of recipes', () => {
    render(<UserRecipesList recipes={mockRecipes} />);

    expect(screen.getByText('My Recipes (2)')).toBeInTheDocument();
    expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    expect(screen.getByText('Pasta Sauce')).toBeInTheDocument();
    expect(screen.getByText('A delicious chocolate cake recipe')).toBeInTheDocument();
    expect(screen.getByText('Simple tomato pasta sauce')).toBeInTheDocument();
  });

  it('shows correct visibility badges', () => {
    render(<UserRecipesList recipes={mockRecipes} />);

    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('displays recipe tags', () => {
    render(<UserRecipesList recipes={mockRecipes} />);

    expect(screen.getByText('dessert')).toBeInTheDocument();
    expect(screen.getByText('chocolate')).toBeInTheDocument();
    expect(screen.getByText('cake')).toBeInTheDocument();
    expect(screen.getByText('dinner')).toBeInTheDocument();
  });

  it('allows deleting a recipe with confirmation', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Recipe deleted successfully' }),
    });

    render(<UserRecipesList recipes={mockRecipes} />);

    // Find and click the delete button for the first recipe
    const deleteButtons = screen.getAllByRole('button', { name: '' }); // Trash icon buttons
    const deleteButton = deleteButtons.find(
      button =>
        button.querySelector('svg')?.classList.contains('lucide-trash-2') ||
        button.innerHTML.includes('Trash2')
    );

    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    // Confirm deletion in dialog
    await waitFor(() => {
      expect(screen.getByText('Delete Recipe')).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/recipes/chocolate-cake', {
        method: 'DELETE',
      });
    });

    expect(mockRefresh).toHaveBeenCalled();
  });

  it('handles delete errors gracefully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<UserRecipesList recipes={mockRecipes} />);

    // Find and click the delete button
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const deleteButton = deleteButtons.find(
      button =>
        button.querySelector('svg')?.classList.contains('lucide-trash-2') ||
        button.innerHTML.includes('Trash2')
    );

    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    // Confirm deletion
    await waitFor(() => {
      expect(screen.getByText('Delete Recipe')).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error deleting recipe:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('navigates to add recipe when clicking add button', () => {
    render(<UserRecipesList recipes={[]} />);

    const addButton = screen.getByRole('button', { name: /add your first recipe/i });
    fireEvent.click(addButton);

    expect(mockPush).toHaveBeenCalledWith('/add');
  });
});
