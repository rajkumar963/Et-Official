import { Suspense } from 'react';
import { AuthForm } from '@/features/auth/components/auth-form';
export default function Signup() {
  return (
    <Suspense fallback={<p>Loading sign up…</p>}>
      <AuthForm signup />
    </Suspense>
  );
}
