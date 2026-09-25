export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  // cents, to avoid float rounding when summing. assuming USD
  priceCents: number;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
}

// POST /api/checkout
export interface CheckoutRequest {
  bookIds: string[];
}

export interface CheckoutSuccess {
  orderId: string;
  estimatedShipDate: string;
}

export interface CheckoutFailure {
  error: string;
}
