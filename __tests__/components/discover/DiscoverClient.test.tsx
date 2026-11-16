import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SWRConfig } from 'swr';
import { toast } from 'sonner';
import DiscoverClient from '@/components/discover/DiscoverClient';
import { ApiError, importRecipe, saveRecipe, searchRecipes } from '@/lib/client-recipes';
import type { ImportedRecipe } from '@/lib/recipe-import-utils';

jest.mock('@/lib/client-recipes', () => ({
  ...jest.requireActual('@/lib/client-recipes'),
  importRecipe: jest.fn(),
  saveRecipe: jest.fn(),
  searchRecipes: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: { success: jest.fn() } }));
jest.mock('@/components/page-header', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => mockParams,
}));

const mockImport = importRecipe as jest.Mock;
const mockSave = saveRecipe as jest.Mock;
const mockSearch = searchRecipes as jest.Mock;

const recipe: ImportedRecipe = {
  name: 'Chicken Tikka Masala',
  description: 'Rich and creamy.',
  ingredients: [
    { amount: 1.5, unit: 'lb', name: 'chicken thighs' },
    { amount: 0, unit: '', name: 'salt to taste' },
  ],
  instructions: ['Marinate the chicken.', 'Simmer in sauce.'],
  servings: 4,
  prepTimeMinutes: 20,
  cookTimeMinutes: 40,
  imageUrl: null,
  tags: ['Indian'],
  sourceUrl: 'https://example.com/tikka',
  isPublic: false,
};

function renderDiscover(params: Record<string, string>, searchEnabled = true) {
  mockParams = new URLSearchParams(params);
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <DiscoverClient searchEnabled={searchEnabled} />
    </SWRConfig>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
});

describe('Discover preview', () => {
  it('renders the parsed recipe from ?url=', async () => {
    mockImport.mockResolvedValue(recipe);
    renderDiscover({ url: 'https://example.com/tikka' });

    expect(await screen.findByRole('heading', { name: 'Chicken Tikka Masala' })).toBeInTheDocument();
    expect(mockImport).toHaveBeenCalledWith('https://example.com/tikka');
    expect(screen.getByText('chicken thighs')).toBeInTheDocument();
    expect(screen.getByText('1 1/2 lb')).toBeInTheDocument();
    expect(screen.getByText('salt to taste')).toBeInTheDocument();
    expect(screen.getByText('Simmer in sauce.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open original/i })).toHaveAttribute(
      'href',
      'https://example.com/tikka'
    );
  });

  it('takes the link from shared text when url is empty', async () => {
    mockImport.mockResolvedValue(recipe);
    renderDiscover({ url: '', text: 'Chicken Tikka https://example.com/tikka' });
    await screen.findByRole('heading', { name: 'Chicken Tikka Masala' });
    expect(mockImport).toHaveBeenCalledWith('https://example.com/tikka');
  });

  it('saves with the mapped private payload and offers a link', async () => {
    const user = userEvent.setup();
    mockImport.mockResolvedValue(recipe);
    mockSave.mockResolvedValue('chicken-tikka-masala');
    renderDiscover({ url: 'https://example.com/tikka' });

    await user.click(await screen.findByRole('button', { name: /^save$/i }));

    await waitFor(() =>
      expect(mockSave).toHaveBeenCalledWith({
        title: 'Chicken Tikka Masala',
        description: 'Rich and creamy.',
        image: null,
        yield: '4 servings',
        prepTime: '20 min',
        cookTime: '40 min',
        sourceUrl: 'https://example.com/tikka',
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        tags: ['Indian'],
        visibility: 'private',
      })
    );
    expect(toast.success).toHaveBeenCalled();
    expect(await screen.findByRole('link', { name: /saved · view recipe/i })).toHaveAttribute(
      'href',
      '/recipes/chicken-tikka-masala'
    );
    // Stays on Discover.
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows the save error from the server', async () => {
    const user = userEvent.setup();
    mockImport.mockResolvedValue({ ...recipe, ingredients: [] });
    mockSave.mockRejectedValue(new Error('At least one ingredient is required'));
    renderDiscover({ url: 'https://example.com/tikka' });

    await user.click(await screen.findByRole('button', { name: /^save$/i }));
    expect(await screen.findByText('At least one ingredient is required')).toBeInTheDocument();
  });

  it('"Edit first" stashes the recipe and opens the add form', async () => {
    const user = userEvent.setup();
    mockImport.mockResolvedValue(recipe);
    renderDiscover({ url: 'https://example.com/tikka' });

    await user.click(await screen.findByRole('button', { name: /edit first/i }));
    expect(mockPush).toHaveBeenCalledWith('/add');
    expect(JSON.parse(sessionStorage.getItem('nomnoms:imported-recipe')!)).toEqual(recipe);
  });

  it('shows the import error message with a link to the original', async () => {
    mockImport.mockRejectedValue(
      new ApiError('No recipe was found at this URL.', 422, 'no_recipe')
    );
    renderDiscover({ url: 'https://example.com/blog' });

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('No recipe was found at this URL.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open original/i })).toHaveAttribute(
      'href',
      'https://example.com/blog'
    );
    expect(screen.queryByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
  });
});

describe('Discover search', () => {
  const results = [
    {
      title: 'Tikka Masala',
      url: 'https://a.example/tikka',
      site: 'A Kitchen',
      snippet: 'Creamy.',
      thumbnail: null,
      savedSlug: 'tikka-masala',
    },
    {
      title: 'Butter Chicken',
      url: 'https://b.example/butter',
      site: 'B Eats',
      snippet: '',
      thumbnail: null,
      savedSlug: null,
    },
  ];

  it('shows results for ?q= with Saved markers', async () => {
    mockSearch.mockResolvedValue({ results, page: 0, hasMore: false });
    renderDiscover({ q: 'tikka' });

    expect(await screen.findByText('Butter Chicken')).toBeInTheDocument();
    expect(mockSearch).toHaveBeenCalledWith('tikka', 0);
    expect(screen.getByRole('link', { name: /tikka masala is saved/i })).toHaveAttribute(
      'href',
      '/recipes/tikka-masala'
    );
    expect(screen.queryByRole('link', { name: /butter chicken is saved/i })).not.toBeInTheDocument();
  });

  it('opens a result in the preview', async () => {
    const user = userEvent.setup();
    mockSearch.mockResolvedValue({ results, page: 0, hasMore: false });
    renderDiscover({ q: 'tikka' });

    await user.click(await screen.findByRole('button', { name: /preview butter chicken/i }));
    expect(mockPush).toHaveBeenCalledWith(
      `/discover?q=tikka&url=${encodeURIComponent('https://b.example/butter')}`
    );
  });

  it('shows search errors', async () => {
    mockSearch.mockRejectedValue(new ApiError('Too many searches.', 429));
    renderDiscover({ q: 'tikka' });
    expect(await screen.findByRole('alert')).toHaveTextContent('Too many searches.');
  });

  it('opens a pasted link as a preview instead of searching', async () => {
    const user = userEvent.setup();
    renderDiscover({});
    await user.type(screen.getByRole('textbox'), 'https://example.com/tikka');
    await user.click(screen.getByRole('button', { name: /preview/i }));
    expect(mockPush).toHaveBeenCalledWith(
      `/discover?url=${encodeURIComponent('https://example.com/tikka')}`
    );
  });

  it('submits a search query to the URL', async () => {
    const user = userEvent.setup();
    renderDiscover({});
    await user.type(screen.getByRole('textbox'), 'pad thai{enter}');
    expect(mockPush).toHaveBeenCalledWith('/discover?q=pad+thai');
  });

  it('without an API key, opens a web search in a new tab', async () => {
    const user = userEvent.setup();
    const open = jest.spyOn(window, 'open').mockImplementation(() => null);
    renderDiscover({}, false);
    await user.type(screen.getByRole('textbox'), 'pad thai{enter}');
    expect(open).toHaveBeenCalledWith(
      'https://search.brave.com/search?q=pad%20thai%20recipe',
      '_blank',
      'noopener,noreferrer'
    );
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockSearch).not.toHaveBeenCalled();
  });

  it('sets the bookmarklet code after mount', () => {
    renderDiscover({});
    const link = screen.getByTitle('Drag to your bookmarks bar');
    expect(link.getAttribute('href')).toBe(
      `javascript:location.href='${window.location.origin}/discover?url='+encodeURIComponent(location.href)`
    );
  });
});
