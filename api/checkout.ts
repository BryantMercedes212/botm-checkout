import { fakeCheckout, scenarioFromReferer } from '../mock/fakeCheckout.js';

// Vercel function for the live demo. Same fake backend as local dev.
export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);
  const result = await fakeCheckout(body, scenarioFromReferer(request.headers.get('referer')));
  return new Response(result.body, {
    status: result.status,
    headers: { 'Content-Type': result.contentType },
  });
}
