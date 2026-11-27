import type { Metadata } from 'next';
import { BrokerPage } from '@/features/brokers/broker-page';
import { forexPage } from '@/features/brokers/data';

export const metadata: Metadata = {
  title: 'Forex Trading — Open an Account',
  description:
    'Compare XM, Elefin, and Exness account options, open their registration links, and log your positions in ET Official. Includes trading updates and account information.',
  alternates: { canonical: '/brokers/forex' },
};

export default function ForexTradingPage() {
  return <BrokerPage data={forexPage} />;
}
