const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function formatPrice(cents: number): string {
  return currency.format(cents / 100);
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

// The API just says estimatedShipDate is a string, so I'm assuming either
// YYYY-MM-DD or a full ISO timestamp. Date-only strings get parsed as local
// dates because new Date('2026-10-02') is UTC midnight, which shows up as
// the day before in US time zones. If it can't be parsed, show it as-is.
export function formatShipDate(value: string): string {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);

  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}
