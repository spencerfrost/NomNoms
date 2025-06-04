import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecipeBasicInfoForm from '@/components/recipe/form/RecipeBasicInfoForm';

const mockOnChange = jest.fn();

const defaultFormData = {
  title: '',
  description: '',
  imageUrl: '',
  yield: '',
  prepTime: '',
  cookTime: '',
  visibility: 'public',
};

describe('RecipeBasicInfoForm', () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all form fields correctly', () => {
    render(<RecipeBasicInfoForm formData={defaultFormData} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/image url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/yield/i)).toBeInTheDocument();
  });

  it('displays form data correctly', () => {
    const filledFormData = {
      title: 'Test Recipe',
      description: 'A delicious test recipe',
      imageUrl: 'https://example.com/image.jpg',
      yield: '4 servings',
      prepTime: '10 min',
      cookTime: '20 min',
      visibility: 'public',
    };

    render(<RecipeBasicInfoForm formData={filledFormData} onChange={mockOnChange} />);

    expect(screen.getByDisplayValue('Test Recipe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A delicious test recipe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com/image.jpg')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4 servings')).toBeInTheDocument();
  });

  it('calls onChange when title is updated', async () => {
    const user = userEvent.setup();

    render(<RecipeBasicInfoForm formData={defaultFormData} onChange={mockOnChange} />);

    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Test Title');

    // Check that onChange was called for typing
    expect(mockOnChange).toHaveBeenCalled();
    // Check that at least one call was made with the 'title' field
    expect(mockOnChange).toHaveBeenCalledWith('title', expect.any(String));
  });

  it('calls onChange when description is updated', async () => {
    const user = userEvent.setup();

    render(<RecipeBasicInfoForm formData={defaultFormData} onChange={mockOnChange} />);

    const descriptionInput = screen.getByLabelText(/description/i);
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Test Description');

    // Check that onChange was called for typing
    expect(mockOnChange).toHaveBeenCalled();
    // Check that at least one call was made with the 'description' field
    expect(mockOnChange).toHaveBeenCalledWith('description', expect.any(String));
  });

  it('shows image preview when valid imageUrl is provided', () => {
    const formDataWithImage = {
      ...defaultFormData,
      imageUrl: 'https://example.com/valid-image.jpg',
    };

    render(<RecipeBasicInfoForm formData={formDataWithImage} onChange={mockOnChange} />);

    const image = screen.getByAltText('Recipe preview');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src');
    // Check if the image src contains the original URL
    expect(image.getAttribute('src')).toContain('https://example.com/valid-image.jpg');
  });

  it('hides image preview when no imageUrl is provided', () => {
    render(<RecipeBasicInfoForm formData={defaultFormData} onChange={mockOnChange} />);

    expect(screen.queryByAltText('Recipe preview')).not.toBeInTheDocument();
  });

  it('has correct placeholder texts', () => {
    render(<RecipeBasicInfoForm formData={defaultFormData} onChange={mockOnChange} />);

    expect(screen.getByPlaceholderText('e.g., Spaghetti Carbonara')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('A brief description of your recipe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://example.com/recipe-image.jpg')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., 4 servings, 12 cookies')).toBeInTheDocument();
  });
});
