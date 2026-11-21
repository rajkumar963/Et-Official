import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthForm } from '@/features/auth/components/auth-form';

/** Crawlable (so this tag is read) but kept out of search results. */
export const metadata: Metadata = {
  title: 'Create your account',
  description: 'Create your ET Official account and start journaling your trades.',
  robots: { index: false, follow: true },
};

export default function Signup() {
  return (
    <Suspense fallback={<p>Loading sign up…</p>}>
      <AuthForm signup />
    </Suspense>
  );
}
