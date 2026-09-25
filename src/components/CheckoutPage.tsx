import { useMemo } from 'react';
import { usePlaceOrder } from '../hooks/usePlaceOrder';
import type { Book, ShippingAddress } from '../types';
import { formatPrice } from '../utils/format';
import { AddressBlock } from './AddressBlock';
import { BookCover } from './BookCover';
import { OrderConfirmation } from './OrderConfirmation';
import './CheckoutPage.css';

interface CheckoutPageProps {
  // passed in as props so the page is easy to test. a parent would fetch these
  books: Book[];
  address: ShippingAddress;
}

export function CheckoutPage({ books, address }: CheckoutPageProps) {
  const { state, submit } = usePlaceOrder();

  // Assuming total = sum of book prices. Shipping is always free on BOTM, and
  // tax/credits aren't in the brief. In prod the total should come from the server.
  const totalCents = useMemo(
    () => books.reduce((sum, book) => sum + book.priceCents, 0),
    [books],
  );

  if (state.status === 'success') {
    return (
      <OrderConfirmation order={state.order} books={books} address={address} totalCents={totalCents} />
    );
  }

  const isSubmitting = state.status === 'submitting';
  const hasError = state.status === 'error';
  const isEmpty = books.length === 0;

  const handlePlaceOrder = () => {
    if (isSubmitting || isEmpty) return;
    void submit(books.map((b) => b.id));
  };

  return (
    <main className="checkout">
      <h1 className="checkout__title">Review your box</h1>

      <div className="checkout__grid">
        <section className="card" aria-labelledby="books-heading">
          <h2 id="books-heading" className="card__title">
            Your books
          </h2>

          {isEmpty ? (
            // shouldn't happen (brief says 1-4 books) but just in case
            <p className="muted">Your box is empty. Pick at least one book to check out.</p>
          ) : (
            <ul className="book-list">
              {books.map((book) => (
                <li key={book.id} className="book-row">
                  <BookCover src={book.coverUrl} title={book.title} />
                  <div className="book-row__info">
                    <h3 className="book-row__title">{book.title}</h3>
                    <p className="muted">{book.author}</p>
                  </div>
                  <p className="book-row__price">{formatPrice(book.priceCents)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="card summary" aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="card__title">
            Order summary
          </h2>

          <div className="summary__section">
            <h3 className="label">Shipping to</h3>
            <AddressBlock address={address} />
          </div>

          <dl className="summary__lines">
            <div>
              <dt>
                {books.length} {books.length === 1 ? 'book' : 'books'}
              </dt>
              <dd>{formatPrice(totalCents)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>Always free</dd>
            </div>
          </dl>

          <div className="summary__total">
            <span>Total</span>
            <span data-testid="order-total">{formatPrice(totalCents)}</span>
          </div>

          {hasError && (
            // role="alert" so screen readers read it out
            <div className="alert" role="alert">
              <strong>We couldn't place your order.</strong>
              <p>{state.message}</p>
            </div>
          )}

          <button
            type="button"
            className="button"
            onClick={handlePlaceOrder}
            // aria-disabled instead of disabled so focus stays on the button.
            // extra clicks are ignored anyway
            aria-disabled={isSubmitting || undefined}
            disabled={isEmpty}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Placing order…
              </>
            ) : hasError ? (
              'Try again'
            ) : (
              'Place Order'
            )}
          </button>

          {/* always rendered so screen readers pick up changes */}
          <p className="summary__status" role="status" aria-live="polite">
            {isSubmitting ? "Placing your order. Please don't close this page." : ''}
          </p>
        </aside>
      </div>
    </main>
  );
}
