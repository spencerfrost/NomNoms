import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddRecipePage from '@/app/add/page';

// Mock the saveRecipe function
const mockSaveRecipe = jest.fn();
const mockPush = jest.fn();

jest.mock('@/lib/client-recipes', () => ({
  saveRecipe: (...args: any[]) => mockSaveRecipe(...args),
}));

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (...args: any[]) => mockPush(...args),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

describe('Add Recipe Form Flow', () => {
  beforeEach(() => {
    mockSaveRecipe.mockClear();
    mockPush.mockClear();
    mockSaveRecipe.mockResolvedValue('test-recipe');
  });

  it('allows user to complete the entire recipe creation flow', async () => {
    const user = userEvent.setup();
    render(<AddRecipePage />);

    // Step 1: Select "Create from Scratch"
    expect(screen.getByText('Add New Recipe')).toBeInTheDocument();
    expect(screen.getByText("Choose how you'd like to create your recipe")).toBeInTheDocument();

    const createFromScratchCard = screen.getByText('Create from Scratch').closest('div');
    expect(createFromScratchCard).toBeInTheDocument();
    await user.click(createFromScratchCard!);

    // Step 2: Verify we're on the manual form
    expect(screen.getByText('Create a new recipe for your collection')).toBeInTheDocument();

    // Step 3: Fill out basic information
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const yieldInput = screen.getByLabelText(/yield/i);

    await user.type(titleInput, 'Chocolate Chip Cookies');
    await user.type(descriptionInput, 'Delicious homemade cookies with chocolate chips');
    await user.type(yieldInput, '24 cookies');

    // Step 4: Add tags
    const tagInput = screen.getByPlaceholderText(/add a tag/i);
    await user.type(tagInput, 'dessert');
    await user.click(screen.getByText('Add'));
    expect(screen.getByText('dessert')).toBeInTheDocument();

    // Add another tag
    await user.type(tagInput, 'cookies');
    await user.click(screen.getByText('Add'));
    expect(screen.getByText('cookies')).toBeInTheDocument();

    // Step 5: Fill out ingredients
    // First ingredient (should be pre-existing)
    const amountInputs = screen.getAllByPlaceholderText('Amount');
    const unitInputs = screen.getAllByPlaceholderText('Unit');
    const nameInputs = screen.getAllByPlaceholderText('Ingredient name');

    expect(amountInputs).toHaveLength(1);
    expect(unitInputs).toHaveLength(1);
    expect(nameInputs).toHaveLength(1);

    // Fill first ingredient
    await user.clear(amountInputs[0]);
    await user.type(amountInputs[0], '2');
    await user.type(unitInputs[0], 'cups');
    await user.type(nameInputs[0], 'flour');

    // Add second ingredient
    await user.click(screen.getByText('Add Ingredient'));

    // Verify second ingredient was added
    const updatedAmountInputs = screen.getAllByPlaceholderText('Amount');
    const updatedUnitInputs = screen.getAllByPlaceholderText('Unit');
    const updatedNameInputs = screen.getAllByPlaceholderText('Ingredient name');

    expect(updatedAmountInputs).toHaveLength(2);
    expect(updatedUnitInputs).toHaveLength(2);
    expect(updatedNameInputs).toHaveLength(2);

    // Fill second ingredient
    await user.clear(updatedAmountInputs[1]);
    await user.type(updatedAmountInputs[1], '1');
    await user.type(updatedUnitInputs[1], 'cup');
    await user.type(updatedNameInputs[1], 'chocolate chips');

    // Step 6: Fill out instructions
    const instructionInput = screen.getByPlaceholderText(/step 1 instruction/i);
    await user.type(instructionInput, 'Preheat oven to 375°F (190°C)');

    // Add second instruction
    await user.click(screen.getByText('Add Step'));
    const instruction2Input = screen.getByPlaceholderText(/step 2 instruction/i);
    await user.type(instruction2Input, 'Mix flour and chocolate chips in a bowl');

    // Add third instruction
    await user.click(screen.getByText('Add Step'));
    const instruction3Input = screen.getByPlaceholderText(/step 3 instruction/i);
    await user.type(instruction3Input, 'Bake for 10-12 minutes until golden brown');

    // Step 7: Submit the form
    const submitButton = screen.getByText('Save Recipe');
    expect(submitButton).toBeInTheDocument();
    await user.click(submitButton);

    // Step 8: Verify the recipe was saved with correct data
    await waitFor(() => {
      expect(mockSaveRecipe).toHaveBeenCalledWith({
        slug: 'chocolate-chip-cookies',
        title: 'Chocolate Chip Cookies',
        description: 'Delicious homemade cookies with chocolate chips',
        image: null,
        yield: '24 cookies',
        ingredients: [
          { amount: 2, unit: 'cups', name: 'flour' },
          { amount: 1, unit: 'cup', name: 'chocolate chips' },
        ],
        instructions: [
          'Preheat oven to 375°F (190°C)',
          'Mix flour and chocolate chips in a bowl',
          'Bake for 10-12 minutes until golden brown',
        ],
        tags: ['dessert', 'cookies'],
      });
    });

    // Step 9: Verify navigation to the new recipe
    expect(mockPush).toHaveBeenCalledWith('/recipes/chocolate-chip-cookies');
  });

  it('prevents submission when required fields are empty', async () => {
    const user = userEvent.setup();

    render(<AddRecipePage />);

    // Navigate to manual form
    const createFromScratchCard = screen.getByText('Create from Scratch').closest('div');
    await user.click(createFromScratchCard!);

    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByText('Save Recipe')).toBeInTheDocument();
    });

    // Try to submit the form by clicking the submit button
    const submitButton = screen.getByText('Save Recipe');
    await user.click(submitButton);

    // Wait a moment for async operations
    await new Promise(resolve => setTimeout(resolve, 500));

    // Main assertion: submission should be prevented
    expect(mockSaveRecipe).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();

    // Form should still be visible
    expect(screen.getByText('Save Recipe')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
  });

  it('shows validation error for missing ingredients', async () => {
    const user = userEvent.setup();
    render(<AddRecipePage />);

    // Navigate to manual form
    const createFromScratchCard = screen.getByText('Create from Scratch').closest('div');
    await user.click(createFromScratchCard!);

    // Fill only title
    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'Test Recipe');

    // Try to submit without valid ingredients
    const submitButton = screen.getByText('Save Recipe');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('At least one ingredient is required')).toBeInTheDocument();
    });

    expect(mockSaveRecipe).not.toHaveBeenCalled();
  });

  it('shows validation error for missing instructions', async () => {
    const user = userEvent.setup();
    render(<AddRecipePage />);

    // Navigate to manual form
    const createFromScratchCard = screen.getByText('Create from Scratch').closest('div');
    await user.click(createFromScratchCard!);

    // Fill title and ingredient
    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'Test Recipe');

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

  it('allows removing ingredients and instructions', async () => {
    const user = userEvent.setup();
    render(<AddRecipePage />);

    // Navigate to manual form
    const createFromScratchCard = screen.getByText('Create from Scratch').closest('div');
    await user.click(createFromScratchCard!);

    // Add a second ingredient
    await user.click(screen.getByText('Add Ingredient'));
    expect(screen.getAllByPlaceholderText('Ingredient name')).toHaveLength(2);

    // Add a second instruction
    await user.click(screen.getByText('Add Step'));
    expect(screen.getByPlaceholderText(/step 2 instruction/i)).toBeInTheDocument();

    // Remove buttons should be available when there are multiple items
    // For ingredients - look for the X buttons
    const removeButtons = screen.getAllByRole('button').filter(button => {
      // Look for buttons that contain X or remove icons
      const buttonContent = button.textContent || '';
      return buttonContent === '' && button.querySelector('svg');
    });

    expect(removeButtons.length).toBeGreaterThan(0);
  });

  it('can navigate back to mode selection', async () => {
    const user = userEvent.setup();
    render(<AddRecipePage />);

    // Navigate to manual form
    const createFromScratchCard = screen.getByText('Create from Scratch').closest('div');
    await user.click(createFromScratchCard!);

    // Verify we're on the manual form
    expect(screen.getByText('Create a new recipe for your collection')).toBeInTheDocument();

    // Click back button
    const backButton = screen.getByText('Back to Options');
    await user.click(backButton);

    // Should be back to mode selection
    expect(screen.getByText("Choose how you'd like to create your recipe")).toBeInTheDocument();
    expect(screen.getByText('Create from Scratch')).toBeInTheDocument();
    expect(screen.getByText('Import from URL')).toBeInTheDocument();
  });

  it('can handle image URL field', async () => {
    const user = userEvent.setup();
    render(<AddRecipePage />);

    // Navigate to manual form
    const createFromScratchCard = screen.getByText('Create from Scratch').closest('div');
    await user.click(createFromScratchCard!);

    // Fill image URL
    const imageUrlInput = screen.getByLabelText(/image url/i);
    await user.clear(imageUrlInput);
    await user.type(imageUrlInput, 'https://example.com/cookies.jpg');

    // Image preview should appear
    await waitFor(() => {
      const img = screen.getByAltText('Recipe preview');
      expect(img).toBeInTheDocument();
    });
  });
});
