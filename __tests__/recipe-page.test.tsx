import { render, screen, fireEvent } from '@testing-library/react';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { getRecipeBySlug } from '@/lib/recipes-db';
import RecipePage, { generateMetadata } from '@/app/recipes/[slug]/page';

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth-config', () => ({ authOptions: {} }));
jest.mock('@/lib/recipes-db', () => ({ getRecipeBySlug: jest.fn() }));
jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));
// The header pulls in the session-aware hamburger menu, which isn't under test here.
jest.mock('@/components/page-header', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
}));

const mockSession = getServerSession as jest.Mock;
const mockGet = getRecipeBySlug as jest.Mock;

const recipe = {
  id: 'r1',
  slug: 'pancakes',
  title: 'Pancakes',
  description: 'Fluffy weekend pancakes.',
  ingredients: [
    { amount: 1.5, unit: 'cups', name: 'flour' },
    { amount: 0, unit: '', name: 'salt to taste' },
  ],
  instructions: ['Mix', 'Cook'],
  tags: ['breakfast'],
  yield: '4 servings',
  prepTime: null,
  cookTime: null,
  image: null,
  visibility: 'public',
  authorId: 'author',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const props = (slug = 'pancakes') => ({ params: Promise.resolve({ slug }) });

beforeEach(() => jest.clearAllMocks());

describe('RecipePage (server component)', () => {
  it("loads the recipe on the server with the viewer's id", async () => {
    mockSession.mockResolvedValue({ user: { id: 'viewer' } });
    mockGet.mockResolvedValue(recipe);
    render(await RecipePage(props()));

    expect(mockGet).toHaveBeenCalledWith('pancakes', 'viewer');
    expect(screen.getByRole('heading', { name: 'Pancakes' })).toBeInTheDocument();
    expect(screen.getByText('Mix')).toBeInTheDocument();
    expect(screen.queryByText('Edit Recipe')).not.toBeInTheDocument();
  });

  it('shows the edit link only to the author', async () => {
    mockSession.mockResolvedValue({ user: { id: 'author' } });
    mockGet.mockResolvedValue(recipe);
    render(await RecipePage(props()));
    expect(screen.getByText('Edit Recipe').closest('a')).toHaveAttribute(
      'href',
      '/recipes/pancakes/edit'
    );
  });

  it('scales ingredient amounts and yield on the client', async () => {
    mockSession.mockResolvedValue(null);
    mockGet.mockResolvedValue(recipe);
    render(await RecipePage(props()));

    expect(screen.getByText('1 1/2 cups')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '2×' }));
    expect(screen.getByText('3 cups')).toBeInTheDocument();
    expect(screen.getByText('Yields: 8 servings')).toBeInTheDocument();
  });

  it('calls notFound() for a missing or hidden recipe', async () => {
    mockSession.mockResolvedValue(null);
    mockGet.mockResolvedValue(null);
    await expect(RecipePage(props('secret'))).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('lets database errors reach the error boundary instead of showing not-found', async () => {
    mockSession.mockResolvedValue(null);
    mockGet.mockRejectedValue(new Error('db down'));
    await expect(RecipePage(props('db-error'))).rejects.toThrow('db down');
    expect(notFound).not.toHaveBeenCalled();
  });
});

describe('generateMetadata', () => {
  it('uses the recipe title, description and image', async () => {
    mockSession.mockResolvedValue(null);
    mockGet.mockResolvedValue({ ...recipe, image: '/images/recipes/pancakes.jpg' });
    const meta = await generateMetadata(props('meta-public'));
    expect(meta.title).toBe('Pancakes');
    expect(meta.description).toBe('Fluffy weekend pancakes.');
    expect(meta.openGraph?.images).toEqual([
      { url: '/images/recipes/pancakes.jpg', alt: 'Pancakes' },
    ]);
    expect(meta.robots).toBeUndefined();
  });

  it('marks private recipes noindex', async () => {
    mockSession.mockResolvedValue({ user: { id: 'author' } });
    mockGet.mockResolvedValue({ ...recipe, visibility: 'private' });
    const meta = await generateMetadata(props('meta-private'));
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it('truncates long descriptions', async () => {
    mockSession.mockResolvedValue(null);
    mockGet.mockResolvedValue({ ...recipe, description: 'word '.repeat(100) });
    const meta = await generateMetadata(props('meta-long'));
    expect((meta.description as string).length).toBeLessThanOrEqual(160);
    expect(meta.description).toMatch(/…$/);
  });

  it('does not leak anything for a hidden recipe', async () => {
    mockSession.mockResolvedValue(null);
    mockGet.mockResolvedValue(null);
    const meta = await generateMetadata(props('meta-hidden'));
    expect(meta).toEqual({ title: 'Recipe not found', robots: { index: false } });
  });
});

describe('RecipePage source link', () => {
  it('links to the source site in a new tab', async () => {
    mockSession.mockResolvedValue(null);
    mockGet.mockResolvedValue({ ...recipe, sourceUrl: 'https://www.example.com/pancakes' });
    render(await RecipePage(props('with-source')));
    const link = screen.getByRole('link', { name: /example\.com/ });
    expect(link).toHaveAttribute('href', 'https://www.example.com/pancakes');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('shows nothing without a source', async () => {
    mockSession.mockResolvedValue(null);
    mockGet.mockResolvedValue({ ...recipe, sourceUrl: null });
    render(await RecipePage(props('no-source')));
    expect(screen.queryByText(/source:/i)).not.toBeInTheDocument();
  });
});
