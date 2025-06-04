import { render, screen, fireEvent } from '@testing-library/react';
import { FormField } from '@/components/auth/FormField';

describe('FormField', () => {
  it('renders label and input correctly', () => {
    const mockOnChange = jest.fn();

    render(
      <FormField
        id="test-field"
        label="Test Label"
        type="text"
        placeholder="Test placeholder"
        value=""
        onChange={mockOnChange}
        required
      />
    );

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
  });

  it('calls onChange when input value changes', () => {
    const mockOnChange = jest.fn();

    render(
      <FormField
        id="test-field"
        label="Test Label"
        type="text"
        placeholder="Test placeholder"
        value=""
        onChange={mockOnChange}
        required
      />
    );

    const input = screen.getByLabelText('Test Label');
    fireEvent.change(input, { target: { value: 'test value' } });

    expect(mockOnChange).toHaveBeenCalledWith('test value');
  });

  it('displays error message when provided', () => {
    const mockOnChange = jest.fn();
    const errorMessage = 'This field is required';

    render(
      <FormField
        id="test-field"
        label="Test Label"
        type="text"
        placeholder="Test placeholder"
        value=""
        onChange={mockOnChange}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    const mockOnChange = jest.fn();

    render(
      <FormField
        id="test-field"
        label="Test Label"
        type="text"
        placeholder="Test placeholder"
        value=""
        onChange={mockOnChange}
        error="Error message"
      />
    );

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveClass('border-red-500');
  });
});
