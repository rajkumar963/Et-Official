import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthForm } from '@/features/auth/components/auth-form';

/** Crawlable (so this tag is read) but kept out of search results. */
export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your ET Official trading journal.',
  robots: { index: false, follow: true },
};

export default function Login() {
  return (
    <Suspense fallback={<p>Loading sign in…</p>}>
      <AuthForm />
    </Suspense>
  );
}
