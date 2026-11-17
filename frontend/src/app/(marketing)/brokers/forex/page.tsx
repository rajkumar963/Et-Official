import type { Metadata } from 'next';
import { BrokerPage } from '@/features/brokers/broker-page';
import { forexPage } from '@/features/brokers/data';

export const metadata: Metadata = {
  title: 'Forex Trading — Open an Account',
  description:
    'Open a forex trading account with a regulated broker, then log every position in your ET Trader journal. Includes important updates and information before you start.',
};

export default function ForexTradingPage() {
  return <BrokerPage data={forexPage} />;
}
