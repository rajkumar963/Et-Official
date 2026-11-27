import type { Metadata } from 'next';
import { BrokerPage } from '@/features/brokers/broker-page';
import { binaryPage } from '@/features/brokers/data';

export const metadata: Metadata = {
  title: 'Binary Trading — Open an Account',
  description:
    'Compare Quotex and Binolla, open their account registration pages, and track your trading process in ET Official. Includes platform updates and account information.',
  alternates: { canonical: '/brokers/binary' },
};

export default function BinaryTradingPage() {
  return <BrokerPage data={binaryPage} />;
}
