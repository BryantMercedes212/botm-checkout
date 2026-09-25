import type { ShippingAddress } from '../types';

export function AddressBlock({ address }: { address: ShippingAddress }) {
  return (
    <address className="address">
      {address.name}
      <br />
      {address.line1}
      {address.line2 && (
        <>
          <br />
          {address.line2}
        </>
      )}
      <br />
      {address.city}, {address.state} {address.postalCode}
    </address>
  );
}
