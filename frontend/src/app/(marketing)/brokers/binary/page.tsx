import type { Metadata } from 'next';
import { BrokerPage } from '@/features/brokers/broker-page';
import { binaryPage } from '@/features/brokers/data';

export const metadata: Metadata = {
  title: 'Binary Trading — Open an Account',
  description:
    'Open a binary trading account with a broker we trust, then track every trade in your ET Official journal. Includes important updates and information before you start.',
};

export default function BinaryTradingPage() {
  return <BrokerPage data={binaryPage} />;
}
