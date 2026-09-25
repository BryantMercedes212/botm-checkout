import { describe, expect, it } from 'vitest';
import { formatPrice, formatShipDate } from './format';

describe('formatPrice', () => {
  it('formats cents as USD', () => {
    expect(formatPrice(1699)).toBe('$16.99');
    expect(formatPrice(0)).toBe('$0.00');
  });
});

describe('formatShipDate', () => {
  it('treats date-only strings as local dates (no off-by-one in US time zones)', () => {
    expect(formatShipDate('2026-10-02')).toBe('Friday, October 2, 2026');
  });

  it('returns unparseable values unchanged', () => {
    expect(formatShipDate('Early next week')).toBe('Early next week');
  });
});
