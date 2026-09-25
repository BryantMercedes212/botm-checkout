import { CheckoutPage } from './components/CheckoutPage';
import { SiteHeader } from './components/SiteHeader';
import { mockAddress, mockBooks } from './data/mockCheckout';

export default function App() {
  return (
    <>
      <SiteHeader />
      <CheckoutPage books={mockBooks} address={mockAddress} />
    </>
  );
}
