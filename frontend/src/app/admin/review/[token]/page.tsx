import type { Metadata } from 'next';
import { ReviewView } from '@/features/admin/components/review-view';

export const metadata: Metadata = {
  title: 'Review payment',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ReviewView token={token} />;
}
