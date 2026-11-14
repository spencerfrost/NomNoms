// jest.setup.ts mocks this module globally; these tests need the real implementation.
const { getRecipeBySlug } = jest.requireActual<typeof import('@/lib/client-recipes')>(
  '@/lib/client-recipes'
);

const mockFetch = jest.fn();

beforeEach(() => {
  mockFetch.mockReset();
  global.fetch = mockFetch as unknown as typeof fetch;
});

function response(status: number, body: unknown = {}) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

describe('client getRecipeBySlug', () => {
  it('returns the recipe on success', async () => {
    mockFetch.mockResolvedValue(response(200, { slug: 'pie' }));
    await expect(getRecipeBySlug('pie')).resolves.toEqual({ slug: 'pie' });
  });

  it('returns null on 404', async () => {
    mockFetch.mockResolvedValue(response(404));
    await expect(getRecipeBySlug('missing')).resolves.toBeNull();
  });

  it('throws on a server error instead of reporting "not found"', async () => {
    mockFetch.mockResolvedValue(response(500));
    await expect(getRecipeBySlug('pie')).rejects.toThrow('500');
  });

  it('throws on a network error', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(getRecipeBySlug('pie')).rejects.toThrow('Failed to fetch');
  });
});
