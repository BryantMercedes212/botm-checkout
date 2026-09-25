import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockAddress, mockBooks } from '../data/mockCheckout';
import { CheckoutPage } from './CheckoutPage';

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// lets the test control when fetch resolves so we can check the loading state
function deferredFetch() {
  let resolve!: (r: Response) => void;
  const fetchMock = vi.fn(() => new Promise<Response>((r) => (resolve = r)));
  vi.stubGlobal('fetch', fetchMock);
  return { fetchMock, respond: (r: Response) => resolve(r) };
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows every book, the address and the total', () => {
    render(<CheckoutPage books={mockBooks} address={mockAddress} />);

    for (const book of mockBooks) {
      expect(screen.getByRole('heading', { name: book.title })).toBeInTheDocument();
      expect(screen.getByText(book.author)).toBeInTheDocument();
    }
    expect(screen.getByText(new RegExp(mockAddress.line1))).toBeInTheDocument();
    // 3 x 17.99
    expect(screen.getByTestId('order-total')).toHaveTextContent('$53.97');
  });

  it('posts the book ids, shows a loading state, then the confirmation', async () => {
    const user = userEvent.setup();
    const { fetchMock, respond } = deferredFetch();
    render(<CheckoutPage books={mockBooks} address={mockAddress} />);

    await user.click(screen.getByRole('button', { name: 'Place Order' }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/checkout');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ bookIds: mockBooks.map((b) => b.id) });

    const button = screen.getByRole('button', { name: /placing order/i });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('status')).toHaveTextContent(/placing your order/i);

    respond(jsonResponse(200, { orderId: 'BOTM-123ABC', estimatedShipDate: '2026-10-02' }));

    expect(
      await screen.findByRole('heading', { name: /your order is confirmed/i }),
    ).toHaveFocus();
    expect(screen.getByText('BOTM-123ABC')).toBeInTheDocument();
    expect(screen.getByText('Friday, October 2, 2026')).toBeInTheDocument();
  });

  it('ignores repeat clicks while an order is in flight', async () => {
    const user = userEvent.setup();
    const { fetchMock } = deferredFetch();
    render(<CheckoutPage books={mockBooks} address={mockAddress} />);

    const button = screen.getByRole('button', { name: 'Place Order' });
    await user.click(button);
    await user.click(button);
    await user.dblClick(button);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows the API's error message and lets the member retry", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(409, { error: 'A book in your box sold out.' }))
      .mockResolvedValueOnce(jsonResponse(200, { orderId: 'BOTM-OK', estimatedShipDate: '2026-10-02' }));
    vi.stubGlobal('fetch', fetchMock);
    render(<CheckoutPage books={mockBooks} address={mockAddress} />);

    await user.click(screen.getByRole('button', { name: 'Place Order' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('A book in your box sold out.');

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('BOTM-OK')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('falls back to a friendly message when the error body is not JSON', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('<h1>502 Bad Gateway</h1>', { status: 502 })),
    );
    render(<CheckoutPage books={mockBooks} address={mockAddress} />);

    await user.click(screen.getByRole('button', { name: 'Place Order' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/something went wrong on our end/i);
  });

  it('explains network failures', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    render(<CheckoutPage books={mockBooks} address={mockAddress} />);

    await user.click(screen.getByRole('button', { name: 'Place Order' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/check your internet connection/i);
  });

  it('does not allow placing an empty order', () => {
    render(<CheckoutPage books={[]} address={mockAddress} />);
    expect(screen.getByRole('button', { name: 'Place Order' })).toBeDisabled();
  });
});
