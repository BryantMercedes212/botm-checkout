import { afterEach, describe, expect, it, vi } from 'vitest';
import { CheckoutError, placeOrder } from './checkout';

describe('placeOrder', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('reports a timeout without claiming the order failed', async () => {
    // hangs until aborted
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => reject(init.signal?.reason));
          }),
      ),
    );

    const error = await placeOrder(['bk_1'], { timeoutMs: 10 }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(CheckoutError);
    expect((error as Error).message).toMatch(/may still go through/i);
  });

  it('rejects a 200 response with an unexpected body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 })));
    await expect(placeOrder(['bk_1'])).rejects.toThrow(/couldn't confirm your order/i);
  });
});
