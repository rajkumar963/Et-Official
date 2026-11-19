import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { UserDto } from '@et-trader/shared';
import { API_URL } from '@/config/env';
import { AdminShell } from '@/features/admin/components/admin-shell';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin | ET Official' },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  let unauthorized = false;
  let user: UserDto | null = null;
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { cookie: jar.toString() },
      cache: 'no-store',
    });
    unauthorized = response.status === 401;
    if (response.ok) user = ((await response.json()) as { data: UserDto }).data;
  } catch {
    /* API unreachable: render the shell; the pages show a recoverable error. */
  }
  if (unauthorized && !jar.has('tj_refresh')) redirect('/login?next=/admin');
  // Signed in but not an admin. (A 401 with a refresh cookie renders and lets the client renew.)
  if (user && !user.isAdmin) redirect('/');
  return (
    <AdminShell user={user ? { name: user.name, email: user.email } : null}>{children}</AdminShell>
  );
}
