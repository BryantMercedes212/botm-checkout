import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { fakeCheckout, scenarioFromReferer } from './fakeCheckout.js';

// Serves the fake POST /api/checkout from the Vite dev/preview server,
// so the app makes a real request locally too.
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
    res.statusCode = 405;
    return res.end();
  }

  const result = await fakeCheckout(await readJson(req), scenarioFromReferer(req.headers.referer));
  res.statusCode = result.status;
  res.setHeader('Content-Type', result.contentType);
  res.end(result.body);
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
