import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckoutError, placeOrder } from '../api/checkout';
import type { CheckoutSuccess } from '../types';

// one status instead of separate isLoading/error flags so we can't end up
// loading and showing an error at the same time
export type OrderState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; order: CheckoutSuccess }
  | { status: 'error'; message: string };

export function usePlaceOrder() {
  const [state, setState] = useState<OrderState>({ status: 'idle' });

  // using a ref so a fast double click can't send two orders
  // (state doesn't update until the next render)
  const inFlight = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);

  // abort on unmount. doesn't cancel the order on the server
  useEffect(() => () => controllerRef.current?.abort(), []);

  const submit = useCallback(async (bookIds: string[]) => {
    if (inFlight.current) return;
    inFlight.current = true;

    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ status: 'submitting' });

    try {
      const order = await placeOrder(bookIds, { signal: controller.signal });
      setState({ status: 'success', order });
    } catch (err) {
      if (controller.signal.aborted) return;
      const message =
        err instanceof CheckoutError
          ? err.message
          : "Something went wrong and your order wasn't placed. Please try again.";
      setState({ status: 'error', message });
    } finally {
      inFlight.current = false;
    }
  }, []);

  return { state, submit };
}
