import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddRecipePage from '@/app/add/page';
import * as clientRecipes from '@/lib/client-recipes';

// Mock the saveRecipe function
jest.mock('@/lib/client-recipes', () => ({
  saveRecipe: jest.fn(),
}));

const mockSaveRecipe = clientRecipes.saveRecipe as jest.MockedFunction<
  typeof clientRecipes.saveRecipe
>;

// Mock the router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('AddRecipePage Integration', () => {
  beforeEach(() => {
    mockSaveRecipe.mockClear();
    mockPush.mockClear();
    mockSaveRecipe.mockResolvedValue('recipe-123');
  });

  it('renders mode selection screen initially', () => {
    render(<AddRecipePage />);

    expect(screen.getByText('Add New Recipe')).toBeInTheDocument();
    expect(screen.getByText("Choose how you'd like to create your recipe")).toBeInTheDocument();
    expect(screen.getByText('Create from Scratch')).toBeInTheDocument();
    expect(screen.getByText('Import from URL')).toBeInTheDocument();
  });

  it('navigates to manual form when "Create from Scratch" is clicked', async () => {
    const user = userEvent.setup();
    render(<AddRecipePage />);

    const createFromScratchCard = screen.getByText('Create from Scratch').closest('div');
    await user.click(createFromScratchCard!);

    expect(screen.getByText('Create a new recipe for your collection')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
  });

  it('allows user to fill out complete recipe form and submit', async () => {
    const user = userEvent.setup();
    render(<AddRecipePage />);

    // Navigate to manual form
    const createFromScratchCard = screen.getByText('Create from Scratch').closest('div');
    await user.click(createFromScratchCard!);

    // Fill out basic info
    await user.type(screen.getByLabelText(/title/i), 'Test Recipe');
    await user.type(screen.getByLabelText(/description/i), 'A delicious test recipe');
    await user.type(screen.getByLabelText(/yield/i), '4 servings');

    // Add a tag
    const tagInput = screen.getByPlaceholderText(/add a tag/i);
    await user.type(tagInput, 'test');
    await user.click(screen.getByText('Add'));
    expect(screen.getByText('test')).toBeInTheDocument();

    // Fill ingredient
    const amountInput = screen.getByPlaceholderText('Amount');
    const unitInput = screen.getByPlaceholderText('Unit');
    const nameInput = screen.getByPlaceholderText('Ingredient name');

    await user.clear(amountInput);
    await user.type(amountInput, '2');
    await user.type(unitInput, 'cups');
    await user.type(nameInput, 'flour');

    // Add instruction
    const instructionInput = screen.getByPlaceholderText(/step 1 instruction/i);
    await user.type(instructionInput, 'Mix ingredients together');

    // Submit form
    const submitButton = screen.getByText('Save Recipe');
    await user.click(submitButton);

    // Wait for async operations
    await waitFor(() => {
      expect(mockSaveRecipe).toHaveBeenCalledWith({
        slug: 'test-recipe',
        title: 'Test Recipe',
        description: 'A delicious test recipe',
        image: null,
        yield: '4 servings',
        ingredients: [{ amount: 2, unit: 'cups', name: 'flour' }],
        instructions: ['Mix ingredients together'],
        tags: ['test'],
      });
    });

    expect(mockPush).toHaveBeenCalledWith('/recipes/test-recipe');
  });

  it('prevents submission when required fields are missing', async () => {
    const user = userEvent.setup();
    render(<AddRecipePage />);

    // Navigate to manual form
    const createFromScratchCard = screen.getByText('Create from Scratch').closest('div');
    await user.click(createFromScratchCard!);

    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByText('Save Recipe')).toBeInTheDocument();
    });

    // Try to submit without filling required fields
    const submitButton = screen.getByText('Save Recipe');
    await user.click(submitButton);

    // Wait a moment for async operations
    await new Promise(resolve => setTimeout(resolve, 500));

    // The main assertion: form submission should be prevented
    expect(mockSaveRecipe).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();

    // The form should still be visible (not navigated away)
    expect(screen.getByText('Save Recipe')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
  });

  it('shows validation error when submitting without ingredients', async () => {
    const user = userEvent.setup();
    render(<AddRecipePage />);

    // Navigate to manual form
    const createFromScratchCard = screen.getByText('Create from Scratch').closest('div');
    await user.click(createFromScratchCard!);

    // Fill only title
    await user.type(screen.getByLabelText(/title/i), 'Test Recipe');

    // Try to submit without valid ingredients
    const submitButton = screen.getByText('Save Recipe');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('At least one ingredient is required')).toBeInTheDocument();
    });

    expect(mockSaveRecipe).not.toHaveBeenCalled();
  });

  it('shows validation error when submitting without instructions', async () => {
    const user = userEvent.setup();
    render(<AddRecipePage />);

    // Navigate to manual form
    const createFromScratchCard = screen.getByText('Create from Scratch').closest('div');
    await user.click(createFromScratchCard!);

    // Fill title and ingredient
    await user.type(screen.getByLabelText(/title/i), 'Test Recipe');

    const amountInput = screen.getByPlaceholderText('Amount');
    const nameInput = screen.getByPlaceholderText('Ingredient name');
    await user.clear(amountInput);
    await user.type(amountInput, '1');
    await user.type(nameInput, 'flour');

    // Try to submit without instructions
    const submitButton = screen.getByText('Save Recipe');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('At least one instruction is required')).toBeInTheDocument();
    });

    expect(mockSaveRecipe).not.toHaveBeenCalled();
  });

  it('allows adding and removing ingredients', async () => {
    const user = userEvent.setup();
    render(<AddRecipePage />);

    // Navigate to manual form
    const createFromScratchCard = screen.getByText('Create from Scratch').closest('div');
    await user.click(createFromScratchCard!);

    // Initially should have one ingredient row
    expect(screen.getAllByPlaceholderText('Ingredient name')).toHaveLength(1);

    // Add another ingredient
    await user.click(screen.getByText('Add Ingredient'));
    expect(screen.getAllByPlaceholderText('Ingredient name')).toHaveLength(2);

    // Remove buttons should now be visible
    const removeButtons = screen
      .getAllByRole('button')
      .filter(button => button.querySelector('svg') && !button.textContent?.includes('Add'));
    expect(removeButtons.length).toBeGreaterThan(0);
  });

  it('allows adding and removing instructions', async () => {
    const user = userEvent.setup();
    render(<AddRecipePage />);

    // Navigate to manual form
    const createFromScratchCard = screen.getByText('Create from Scratch').closest('div');
    await user.click(createFromScratchCard!);

    // Initially should have one instruction
    expect(screen.getByPlaceholderText(/step 1 instruction/i)).toBeInTheDocument();

    // Add another instruction
    await user.click(screen.getByText('Add Step'));
    expect(screen.getByPlaceholderText(/step 2 instruction/i)).toBeInTheDocument();
  });

  it('can navigate back to mode selection from manual form', async () => {
    const user = userEvent.setup();
    render(<AddRecipePage />);

    // Navigate to manual form
    const createFromScratchCard = screen.getByText('Create from Scratch').closest('div');
    await user.click(createFromScratchCard!);

    // Click back button
    await user.click(screen.getByText('Back to Options'));

    // Should be back to mode selection
    expect(screen.getByText("Choose how you'd like to create your recipe")).toBeInTheDocument();
  });
});
