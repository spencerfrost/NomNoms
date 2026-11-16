import { extractFirstUrl, sharedUrl } from '@/lib/shared-url';

describe('extractFirstUrl', () => {
  it.each([
    ['https://example.com/pancakes', 'https://example.com/pancakes'],
    ['Best Pancakes Ever https://example.com/pancakes', 'https://example.com/pancakes'],
    ['Try this: https://example.com/a?b=1&c=2.', 'https://example.com/a?b=1&c=2'],
    ['(see https://example.com/a)', 'https://example.com/a'],
    ['first http://a.example/x then https://b.example/y', 'http://a.example/x'],
  ])('finds the URL in %j', (text, expected) => {
    expect(extractFirstUrl(text)).toBe(expected);
  });

  it.each([null, undefined, '', 'no link here', 'ftp://example.com/x', 'javascript:alert(1)'])(
    'returns null for %j',
    text => {
      expect(extractFirstUrl(text)).toBeNull();
    }
  );
});

describe('sharedUrl', () => {
  it('prefers the url param', () => {
    expect(sharedUrl({ url: 'https://a.example/x', text: 'https://b.example/y' })).toBe(
      'https://a.example/x'
    );
  });

  it('falls back to the first URL in text when url is empty (Android share)', () => {
    expect(sharedUrl({ url: '', text: 'Chicken Tikka https://b.example/y' })).toBe(
      'https://b.example/y'
    );
  });

  it('ignores a non-http url param', () => {
    expect(sharedUrl({ url: 'javascript:alert(1)', text: null })).toBeNull();
  });
});
