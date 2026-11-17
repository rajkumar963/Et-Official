import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { JournalProvider } from '@/features/journal/journal-provider';
import { API_URL } from '@/config/env';
import { DashboardShell } from '@/features/journal/components/dashboard-shell';
export default async function Layout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  let unauthorized = false;
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { cookie: jar.toString() },
      cache: 'no-store',
    });
    unauthorized = response.status === 401;
  } catch {
    /* The client shell provides a recoverable connection error. */
  }
  if (unauthorized && !jar.has('tj_refresh')) redirect('/login');
  return (
    <JournalProvider>
      <DashboardShell>{children}</DashboardShell>
    </JournalProvider>
  );
}
