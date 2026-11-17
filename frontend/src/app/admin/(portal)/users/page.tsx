import { AdminUsers } from '@/features/admin/components/admin-users';

export const metadata = { title: 'Users' };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  return <AdminUsers initialQuery={typeof q === 'string' ? q : ''} />;
}
