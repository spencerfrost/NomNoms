import { shouldSkipOptimization } from '@/lib/image-hosts';

describe('shouldSkipOptimization', () => {
  it('optimizes local images', () => {
    expect(shouldSkipOptimization('/images/recipes/a.jpg')).toBe(false);
  });

  it('optimizes allowlisted hosts, including wildcard subdomains', () => {
    expect(shouldSkipOptimization('https://images.unsplash.com/x.jpg')).toBe(false);
    expect(shouldSkipOptimization('https://res.cloudinary.com/x.jpg')).toBe(false);
  });

  it('skips the optimizer for other hosts and plain http', () => {
    expect(shouldSkipOptimization('https://some-food-blog.com/x.jpg')).toBe(true);
    expect(shouldSkipOptimization('http://images.unsplash.com/x.jpg')).toBe(true);
    expect(shouldSkipOptimization('https://evilcloudinary.com/x.jpg')).toBe(true);
    expect(shouldSkipOptimization('//cdn.example.com/x.jpg')).toBe(true);
  });
});
