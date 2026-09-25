import { useEffect, useRef } from 'react';
import type { Book, CheckoutSuccess, ShippingAddress } from '../types';
import { formatPrice, formatShipDate } from '../utils/format';
import { AddressBlock } from './AddressBlock';
import { BookCover } from './BookCover';

interface Props {
  order: CheckoutSuccess;
  books: Book[];
  address: ShippingAddress;
  totalCents: number;
}

export function OrderConfirmation({ order, books, address, totalCents }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // move focus here since the button they clicked is gone now
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <main className="checkout checkout--confirmed">
      <section className="confirmation" aria-labelledby="confirmation-heading">
        <div className="confirmation__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 id="confirmation-heading" ref={headingRef} tabIndex={-1}>
          Your order is confirmed!
        </h1>
        <p className="confirmation__lede">
          We'll email you tracking details as soon as your box ships.
        </p>

        <dl className="confirmation__details">
          <div>
            <dt>Order number</dt>
            <dd className="mono">{order.orderId}</dd>
          </div>
          <div>
            <dt>Estimated ship date</dt>
            <dd>{formatShipDate(order.estimatedShipDate)}</dd>
          </div>
        </dl>

        <div className="confirmation__summary">
          <ul className="mini-list" aria-label="Books in this order">
            {books.map((book) => (
              <li key={book.id}>
                <BookCover src={book.coverUrl} title={book.title} size="sm" />
                <span>
                  <strong>{book.title}</strong>
                  <span className="muted"> by {book.author}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="confirmation__meta">
            <div>
              <h2 className="label">Shipping to</h2>
              <AddressBlock address={address} />
            </div>
            <div>
              <h2 className="label">Total</h2>
              <p className="confirmation__total">{formatPrice(totalCents)}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
