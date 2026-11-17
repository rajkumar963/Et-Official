import { isOrderFilter } from '@/features/admin/admin.api';
import { AdminOrders } from '@/features/admin/components/admin-orders';

export const metadata = { title: 'Orders' };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[]; q?: string | string[] }>;
}) {
  const { status, q } = await searchParams;
  return (
    <AdminOrders
      initialStatus={isOrderFilter(status) ? status : 'all'}
      initialQuery={typeof q === 'string' ? q : ''}
    />
  );
}
