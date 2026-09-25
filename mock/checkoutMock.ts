import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

// Fake POST /api/checkout served by Vite, so the app makes a real request.
// Add ?scenario= to the page URL to change the response:
// success (default), slow, error, server-error, timeout
export function checkoutMock(): Plugin {
  return {
    name: 'checkout-mock',
    configureServer(server) {
      server.middlewares.use('/api/checkout', handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/checkout', handler);
    },
  };
}

async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    return send(res, 405, { error: 'Method not allowed.' });
  }

  const scenario = getScenario(req);
  const body = await readJson(req);

  await delay(scenario === 'slow' ? 5000 : 1200);

  const bookIds = (body as { bookIds?: unknown } | null)?.bookIds;
  if (
    !Array.isArray(bookIds) ||
    bookIds.length < 1 ||
    bookIds.length > 4 ||
    !bookIds.every((id) => typeof id === 'string')
  ) {
    return send(res, 400, { error: 'Your box must contain between 1 and 4 books.' });
  }

  switch (scenario) {
    case 'error':
      return send(res, 409, {
        error: 'One of the books in your box just sold out. Please pick a replacement and try again.',
      });
    case 'server-error':
      res.statusCode = 502;
      res.setHeader('Content-Type', 'text/html');
      return res.end('<html><body><h1>502 Bad Gateway</h1></body></html>');
    case 'timeout':
      await delay(20_000); // past the 15s client timeout
      return send(res, 200, success());
    default:
      return send(res, 200, success());
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

function getScenario(req: IncomingMessage): string {
  try {
    return new URL(req.headers.referer ?? '').searchParams.get('scenario') ?? 'success';
  } catch {
    return 'success';
  }
}

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(null);
      }
    });
  });
}

function send(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
