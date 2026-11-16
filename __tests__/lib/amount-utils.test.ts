import {
  formatAmountInput,
  formatAmountRange,
  isSameAmount,
  parseAmountRange,
  withAmount,
} from '@/lib/amount-utils';

describe('parseAmountRange', () => {
  it.each([
    ['', { amount: 0 }],
    ['  ', { amount: 0 }],
    ['2', { amount: 2 }],
    ['1.5', { amount: 1.5 }],
    ['.5', { amount: 0.5 }],
    ['1/2', { amount: 0.5 }],
    ['1 1/2', { amount: 1.5 }],
    ['1-1/2', { amount: 1.5 }],
    ['½', { amount: 0.5 }],
    ['1½', { amount: 1.5 }],
    ['2-3', { amount: 2, amountMax: 3 }],
    ['2 – 3', { amount: 2, amountMax: 3 }],
    ['2 to 3', { amount: 2, amountMax: 3 }],
    ['1/2 to 2/3', { amount: 0.5, amountMax: 2 / 3 }],
    ['1 1/2-2', { amount: 1.5, amountMax: 2 }],
    ['2-2', { amount: 2 }],
  ])('%j', (text, expected) => {
    expect(parseAmountRange(text)).toStrictEqual(expected);
  });

  it.each(['abc', '2-', '-2', '3-2', '0-2', '1/0', '1-2-3', '2 cups'])('rejects %j', text => {
    expect(parseAmountRange(text)).toBeNull();
  });
});

describe('formatAmountRange', () => {
  it('formats single amounts and ranges, scaled', () => {
    expect(formatAmountRange({ amount: 0 })).toBe('');
    expect(formatAmountRange({ amount: 1.5 })).toBe('1 1/2');
    expect(formatAmountRange({ amount: 2, amountMax: 3 })).toBe('2–3');
    expect(formatAmountRange({ amount: 2, amountMax: 3 }, 2)).toBe('4–6');
    expect(formatAmountRange({ amount: 0.5, amountMax: 1 }, 0.5)).toBe('1/4–1/2');
  });

  it('round-trips through the editor format', () => {
    for (const range of [{ amount: 1.5, amountMax: 2 }, { amount: 1 / 3 }, { amount: 2, amountMax: 3 }]) {
      expect(parseAmountRange(formatAmountInput(range))).toEqual(range);
    }
  });
});

describe('withAmount', () => {
  it('sets a range, and drops amountMax when the amount is no longer one', () => {
    const oil = { amount: 1, unit: 'tbsp', name: 'oil' };
    const ranged = withAmount(oil, { amount: 2, amountMax: 3 });
    expect(ranged).toStrictEqual({ amount: 2, amountMax: 3, unit: 'tbsp', name: 'oil' });
    expect(withAmount(ranged, { amount: 4 })).toStrictEqual({ amount: 4, unit: 'tbsp', name: 'oil' });
  });
});

describe('isSameAmount', () => {
  it('treats a missing amountMax like undefined', () => {
    expect(isSameAmount({ amount: 1 }, { amount: 1, amountMax: undefined })).toBe(true);
    expect(isSameAmount({ amount: 1 }, { amount: 1, amountMax: 2 })).toBe(false);
  });
});
