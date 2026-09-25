# Book of the Month: Checkout Page

A `CheckoutPage` built with React and TypeScript. It shows the member's books, the order total and their saved address, and places the order through `POST /api/checkout`, with clear loading, error and success states.

**Live demo:** https://botm-checkout-sepia.vercel.app (use the bar at the top to try each API response)

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest + Testing Library
npm run build      # type-check + production build
```

A **demo bar** at the top of the page switches the fake API response: success, slow (5s), API error, a 502 with an HTML body, or a timeout. The same outcomes can also be reached with `?scenario=<name>`. It's on the live demo too, so reviewers can try every state.

## Where things live

```
src/
  components/CheckoutPage.tsx      Page: review → submitting → error/success
  components/OrderConfirmation.tsx Success view (order ID + ship date)
  hooks/usePlaceOrder.ts           Request state machine + double-submit guard
  api/checkout.ts                  fetch wrapper: timeouts, non-JSON errors, response validation
  utils/format.ts                  Money + ship-date formatting
  data/mockCheckout.ts             Hardcoded books (real Sept 2026 picks) + address
mock/fakeCheckout.ts               Fake backend for POST /api/checkout
mock/checkoutMock.ts               Serves it from the Vite dev server
api/checkout.ts                    Serves it as a Vercel function (live demo)
```

## Decisions and trade-offs

**State as a discriminated union.** The request is modelled as `idle | submitting | success | error`, not as separate `isLoading` / `error` / `data` flags, so the UI can't end up loading and showing an error at the same time.

**Preventing double orders.** The worst bug a checkout page can have is charging someone twice. So a `ref`-based in-flight guard (it updates synchronously, unlike state) drops repeat clicks, and there's a test for it. While the request is in flight the button uses `aria-disabled` rather than `disabled`, so keyboard focus stays on it.

**Timeouts vs. duplicates.** The client gives up after 15s so the member is never stuck on a spinner. A slow request could still succeed on the server, though, and the API has no idempotency key. So the timeout message says the order *may* have gone through and asks the member to check their email before retrying. With backend support I'd send an `Idempotency-Key` header, which makes retries safe.

**Defensive response handling.** Error bodies aren't assumed to be JSON (gateways often return HTML on 5xx). Network failures, timeouts and server errors each get their own message. A `200` with an unexpected body isn't reported as a failure, because the order may exist.

**Server error messages are shown as written.** I assumed the API's `error` strings are meant for members (e.g. "a book sold out"). If they were internal messages, I'd map error codes to member-facing copy instead.

**The total is calculated on the client.** It's the sum of the book prices. Prices are stored in integer cents to avoid floating-point drift. In production the total (with credits, tax and shipping) should come from the server, so the page never shows a number the member won't actually be charged.

**Ship date parsing.** `estimatedShipDate` is only typed as `string`. `YYYY-MM-DD` values are parsed as local dates: `new Date("2026-10-02")` is UTC midnight, which shows the day before for US members. ISO timestamps are parsed as usual, and anything unparseable is shown exactly as sent.

**Data comes in as props.** `CheckoutPage` receives `books` and `address` instead of fetching them, which keeps it focused and easy to test. In the real app, a route loader or parent component would supply them.

**Plain `fetch`, no data library.** This is a single mutation with no caching or shared server state, so React Query or SWR wouldn't add much here. In a larger app that already uses one, I'd use its `useMutation`.

**Mocked on the server side.** The fake backend runs as Vite middleware locally and as a Vercel function on the live demo, rather than a stubbed `fetch`. So the app makes a real HTTP request and the client code is exactly what would ship. Pointing it at a real backend is a one-line `server.proxy` entry.

**Accessibility.** The error is announced via `role="alert"` and progress via an always-mounted `role="status"` region. Focus moves to the confirmation heading when the view changes. Covers use `alt=""` because the title is right next to them, and a broken cover image falls back to a placeholder.

**Plain CSS, styled after the real BOTM checkout.** Colors, cards and uppercase section labels follow bookofthemonth.com. No CSS framework, and the layout works down to 320px. Covers load from the BOTM CDN and fall back to a placeholder if they fail.

## Out of scope / next steps

- Editing the address or the books in the box (the brief says the member arrives with the selection made)
- Payment method display, promo codes and credits
- Analytics events, and a real `Idempotency-Key`
- An end-to-end test (Playwright) against the mock server
