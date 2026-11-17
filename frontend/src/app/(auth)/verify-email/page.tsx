import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmailForm } from '@/features/auth/components/verify-email-form';

export const metadata: Metadata = { title: 'Verify your email' };

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
