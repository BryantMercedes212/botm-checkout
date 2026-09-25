// Fake checkout backend. Used by the Vite dev server (mock/checkoutMock.ts)
// and by the Vercel function (api/checkout.ts) for the live demo.
// Add ?scenario= to the page URL to change the response:
// success (default), slow, error, server-error, timeout

export interface FakeResponse {
  status: number;
  contentType: string;
  body: string;
}

export async function fakeCheckout(body: unknown, scenario: string): Promise<FakeResponse> {
  await delay(scenario === 'slow' ? 5000 : 1200);

  const bookIds = (body as { bookIds?: unknown } | null)?.bookIds;
  if (
    !Array.isArray(bookIds) ||
    bookIds.length < 1 ||
    bookIds.length > 4 ||
    !bookIds.every((id) => typeof id === 'string')
  ) {
    return json(400, { error: 'Your box must contain between 1 and 4 books.' });
  }

  switch (scenario) {
    case 'error':
      return json(409, {
        error: 'One of the books in your box just sold out. Please pick a replacement and try again.',
      });
    case 'server-error':
      return {
        status: 502,
        contentType: 'text/html',
        body: '<html><body><h1>502 Bad Gateway</h1></body></html>',
      };
    case 'timeout':
      await delay(20_000); // past the 15s client timeout
      return json(200, success());
    default:
      return json(200, success());
  }
}

// the page URL comes through in the Referer header
export function scenarioFromReferer(referer: string | null | undefined): string {
  try {
    return new URL(referer ?? '').searchParams.get('scenario') ?? 'success';
  } catch {
    return 'success';
  }
}

function success() {
  const ship = new Date();
  ship.setDate(ship.getDate() + 3);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    orderId: `BOTM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    estimatedShipDate: `${ship.getFullYear()}-${pad(ship.getMonth() + 1)}-${pad(ship.getDate())}`,
  };
}

function json(status: number, data: unknown): FakeResponse {
  return { status, contentType: 'application/json', body: JSON.stringify(data) };
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
