import { Suspense } from 'react';
import { AuthForm } from '@/features/auth/components/auth-form';
export default function Login() {
  return (
    <Suspense fallback={<p>Loading sign in…</p>}>
      <AuthForm />
    </Suspense>
  );
}
