import type { CheckoutRequest, CheckoutSuccess } from '../types';

// message is always something we can show the user
export class CheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CheckoutError';
  }
}

const GENERIC_ERROR =
  'Something went wrong on our end. Please try again in a moment.';

// Timeout so the user isn't stuck on a spinner forever. Tradeoff: the order
// might still go through on the server, and a retry could create a duplicate
// since the API has no idempotency key. That's why the timeout message says to
// check email first. Ideally we'd send an Idempotency-Key header.
export const CHECKOUT_TIMEOUT_MS = 15_000;

// Just using fetch here. It's one POST with no caching, so React Query
// felt like overkill.
export async function placeOrder(
  bookIds: string[],
  { signal, timeoutMs = CHECKOUT_TIMEOUT_MS }: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<CheckoutSuccess> {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

  const body: CheckoutRequest = { bookIds };

  let response: Response;
  try {
    response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: combinedSignal,
    });
  } catch (err) {
    // aborted by the caller (unmount), let it handle that
    if (signal?.aborted) throw err;

    if (timeoutSignal.aborted) {
      throw new CheckoutError(
        "This is taking longer than expected. Your order may still go through, so check your email for a confirmation before trying again.",
      );
    }
    throw new CheckoutError(
      "We couldn't reach Book of the Month. Check your internet connection and try again.",
    );
  }

  // 5xx responses from a proxy/gateway can be HTML, so don't assume JSON
  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    // Assuming the API's error messages are user-friendly. If not, we'd
    // map them to our own copy here.
    throw new CheckoutError(getErrorMessage(data) ?? GENERIC_ERROR);
  }

  if (!isCheckoutSuccess(data)) {
    // 200 but weird body. the order might exist so don't say it failed
    throw new CheckoutError(
      "We couldn't confirm your order. Please check your email for a confirmation before trying again.",
    );
  }

  return data;
}

function getErrorMessage(data: unknown): string | null {
  if (typeof data === 'object' && data !== null && 'error' in data) {
    const { error } = data as { error: unknown };
    if (typeof error === 'string' && error.trim()) return error;
  }
  return null;
}

function isCheckoutSuccess(data: unknown): data is CheckoutSuccess {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return typeof d.orderId === 'string' && typeof d.estimatedShipDate === 'string';
}
