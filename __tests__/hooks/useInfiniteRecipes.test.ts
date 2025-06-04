import { renderHook, waitFor } from '@testing-library/react';
import { useInfiniteRecipes } from '@/hooks/useInfiniteRecipes';

// Mock SWR
jest.mock('swr/infinite', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('useInfiniteRecipes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const mockUseSWRInfinite = require('swr/infinite').default;
    mockUseSWRInfinite.mockReturnValue({
      data: undefined,
      error: undefined,
      size: 1,
      setSize: jest.fn(),
      isValidating: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useInfiniteRecipes());

    expect(result.current.recipes).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isLoadingMore).toBe(false);
    expect(result.current.hasMore).toBe(true); // Should be true initially since data is undefined
    expect(result.current.isEmpty).toBe(false);
  });

  it('should handle successful data loading', () => {
    const mockRecipes = [
      { id: '1', title: 'Recipe 1', slug: 'recipe-1' },
      { id: '2', title: 'Recipe 2', slug: 'recipe-2' },
    ];

    const mockUseSWRInfinite = require('swr/infinite').default;
    mockUseSWRInfinite.mockReturnValue({
      data: [{ recipes: mockRecipes, hasMore: true, nextCursor: '2' }],
      error: undefined,
      size: 1,
      setSize: jest.fn(),
      isValidating: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useInfiniteRecipes());

    expect(result.current.recipes).toEqual(mockRecipes);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.isEmpty).toBe(false);
  });

  it('should generate correct API URLs', () => {
    const mockUseSWRInfinite = require('swr/infinite').default;
    let getKey: (pageIndex: number, previousPageData: any) => string | null;

    mockUseSWRInfinite.mockImplementation((keyGetter: any) => {
      getKey = keyGetter;
      return {
        data: undefined,
        error: undefined,
        size: 1,
        setSize: jest.fn(),
        isValidating: false,
        mutate: jest.fn(),
      };
    });

    renderHook(() =>
      useInfiniteRecipes({
        search: 'pasta',
        tags: ['italian', 'dinner'],
        limit: 12,
      })
    );

    // Test first page
    const firstPageKey = getKey!(0, null);
    expect(firstPageKey).toContain('/api/recipes/infinite');
    expect(firstPageKey).toContain('search=pasta');
    expect(firstPageKey).toContain('tags=italian%2Cdinner');
    expect(firstPageKey).toContain('limit=12');

    // Test subsequent page
    const previousData = { recipes: [], hasMore: true, nextCursor: 'cursor123' };
    const secondPageKey = getKey!(1, previousData);
    expect(secondPageKey).toContain('cursor=cursor123');

    // Test end of data
    const endData = { recipes: [], hasMore: false, nextCursor: null };
    const noMoreKey = getKey!(2, endData);
    expect(noMoreKey).toBeNull();
  });
});
