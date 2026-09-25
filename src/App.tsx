import { CheckoutPage } from './components/CheckoutPage';
import { SiteHeader } from './components/SiteHeader';
import { mockAddress, mockBooks } from './data/mockCheckout';
import { ScenarioSwitcher } from './dev/ScenarioSwitcher';

export default function App() {
  return (
    <>
      <ScenarioSwitcher />
      <SiteHeader />
      <CheckoutPage books={mockBooks} address={mockAddress} />
    </>
  );
}
