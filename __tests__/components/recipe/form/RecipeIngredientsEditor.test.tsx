import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RecipeIngredientsEditor from '@/components/recipe/form/RecipeIngredientsEditor'
import { Ingredient } from '@/types'

const mockOnChange = jest.fn()
const mockOnAdd = jest.fn()
const mockOnRemove = jest.fn()

const defaultIngredients: Ingredient[] = [
  { amount: 0, unit: '', name: '' }
]

describe('RecipeIngredientsEditor', () => {
  beforeEach(() => {
    mockOnChange.mockClear()
    mockOnAdd.mockClear()
    mockOnRemove.mockClear()
  })

  it('renders ingredients correctly', () => {
    const ingredients: Ingredient[] = [
      { amount: 2, unit: 'cups', name: 'flour' },
      { amount: 1, unit: 'tsp', name: 'salt' }
    ]

    render(
      <RecipeIngredientsEditor
        ingredients={ingredients}
        onChange={mockOnChange}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
      />
    )

    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
    expect(screen.getByDisplayValue('cups')).toBeInTheDocument()
    expect(screen.getByDisplayValue('flour')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('tsp')).toBeInTheDocument()
    expect(screen.getByDisplayValue('salt')).toBeInTheDocument()
  })

  it('calls onChange when ingredient amount is updated', async () => {
    const user = userEvent.setup()

    render(
      <RecipeIngredientsEditor
        ingredients={defaultIngredients}
        onChange={mockOnChange}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
      />
    )

    const amountInput = screen.getByPlaceholderText('Amount')
    await user.clear(amountInput)
    await user.type(amountInput, '2')

    expect(mockOnChange).toHaveBeenCalledWith(0, 'amount', 2)
  })

  it('calls onChange when ingredient unit is updated', async () => {
    const user = userEvent.setup()

    render(
      <RecipeIngredientsEditor
        ingredients={defaultIngredients}
        onChange={mockOnChange}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
      />
    )

    const unitInput = screen.getByPlaceholderText('Unit')
    await user.clear(unitInput)
    await user.type(unitInput, 'cups')

    expect(mockOnChange).toHaveBeenCalled()
    expect(mockOnChange).toHaveBeenCalledWith(0, 'unit', expect.any(String))
  })

  it('calls onChange when ingredient name is updated', async () => {
    const user = userEvent.setup()

    render(
      <RecipeIngredientsEditor
        ingredients={defaultIngredients}
        onChange={mockOnChange}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
      />
    )

    const nameInput = screen.getByPlaceholderText('Ingredient name')
    await user.clear(nameInput)
    await user.type(nameInput, 'flour')

    expect(mockOnChange).toHaveBeenCalled()
    expect(mockOnChange).toHaveBeenCalledWith(0, 'name', expect.any(String))
  })

  it('calls onAdd when Add Ingredient button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <RecipeIngredientsEditor
        ingredients={defaultIngredients}
        onChange={mockOnChange}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
      />
    )

    const addButton = screen.getByText('Add Ingredient')
    await user.click(addButton)

    expect(mockOnAdd).toHaveBeenCalled()
  })

  it('shows remove button when multiple ingredients exist', () => {
    const multipleIngredients: Ingredient[] = [
      { amount: 2, unit: 'cups', name: 'flour' },
      { amount: 1, unit: 'tsp', name: 'salt' }
    ]

    render(
      <RecipeIngredientsEditor
        ingredients={multipleIngredients}
        onChange={mockOnChange}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
      />
    )

    const removeButtons = screen.getAllByRole('button', { name: '' })
    // Filter for remove buttons (they have X icon, not text)
    const xButtons = removeButtons.filter(button => 
      button.querySelector('svg') && !button.textContent?.includes('Add')
    )
    expect(xButtons).toHaveLength(2)
  })

  it('does not show remove button when only one ingredient exists', () => {
    render(
      <RecipeIngredientsEditor
        ingredients={defaultIngredients}
        onChange={mockOnChange}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
      />
    )

    // Only the Add Ingredient button should be present
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(1)
    expect(buttons[0]).toHaveTextContent('Add Ingredient')
  })

  it('calls onRemove when remove button is clicked', async () => {
    const user = userEvent.setup()
    const multipleIngredients: Ingredient[] = [
      { amount: 2, unit: 'cups', name: 'flour' },
      { amount: 1, unit: 'tsp', name: 'salt' }
    ]

    render(
      <RecipeIngredientsEditor
        ingredients={multipleIngredients}
        onChange={mockOnChange}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
      />
    )

    const removeButtons = screen.getAllByRole('button', { name: '' })
    const xButtons = removeButtons.filter(button => 
      button.querySelector('svg') && !button.textContent?.includes('Add')
    )
    
    await user.click(xButtons[0])
    expect(mockOnRemove).toHaveBeenCalledWith(0)
  })
})
