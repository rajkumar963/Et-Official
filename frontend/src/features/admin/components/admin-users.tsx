'use client';
import { useMemo, useState, type CSSProperties } from 'react';
import { RotateCw, Search, Users } from 'lucide-react';
import { adminService } from '@/features/admin/admin.api';
import { useAdminQuery } from '@/features/admin/use-admin-query';
import { PageHeading, headingActions } from '@/components/ui/page-heading';
import { Panel } from '@/components/ui/panel';
import { Badge, badgeClass } from '@/components/ui/badge';
import { buttonClass } from '@/components/ui/button';
import { input } from '@/components/ui/form';
import { mono } from '@/components/ui/styles';
import { cn } from '@/lib/cn';
import { LoadError } from './admin-states';
import { Loading, cellSmall, rowClass, td, th, usdt } from './order-ui';

export function AdminUsers({ initialQuery = '' }: { initialQuery?: string }) {
  const users = useAdminQuery(adminService.users);
  const [search, setSearch] = useState(initialQuery);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = users.data || [];
    if (!q) return list;
    return list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.providers.some((p) => p.toLowerCase().includes(q)),
    );
  }, [users.data, search]);

  return (
    <>
      <PageHeading
        eyebrow="USERS"
        title="Accounts"
        description="Everyone who has signed up, with their purchases."
        actions={
          <div className={headingActions}>
            <button className={buttonClass({ variant: 'secondary' })} onClick={users.reload}>
              <RotateCw size={15} /> Refresh
            </button>
          </div>
        }
      />
      <Panel index={1}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12.5px] text-muted">
            {users.data
              ? `${filtered.length} of ${users.data.length} account${users.data.length === 1 ? '' : 's'}`
              : ' '}
          </p>
          <label className="relative w-[300px] max-[700px]:w-full">
            <span className="sr-only">Search users</span>
            <Search
              size={15}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
            />
            <input
              className={cn(input, 'py-[9px] pl-9 text-[13px]')}
              type="search"
              placeholder="Name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        {users.error ? (
          <LoadError message={users.error} onRetry={users.reload} />
        ) : !users.data ? (
          <Loading label="Loading users…" />
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px] whitespace-nowrap">
              <thead>
                <tr>
                  <th className={th}>User</th>
                  <th className={th}>Status</th>
                  <th className={th}>Sign-in</th>
                  <th className={th}>Joined</th>
                  <th className={cn(th, 'text-right')}>Orders</th>
                  <th className={cn(th, 'text-right')}>Approved</th>
                  <th className={cn(th, 'text-right')}>Total spent</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr
                    key={u.id}
                    className={rowClass}
                    style={{ '--i': Math.min(i, 12) } as CSSProperties}
                  >
                    <td className={cn(td, 'max-w-[280px]')}>
                      <div className="flex items-center gap-[11px]">
                        <span
                          className="grid size-8 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#8b5cf6,#0891b2)] text-[11px] font-bold text-white"
                          aria-hidden="true"
                        >
                          {u.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <strong className="block truncate font-semibold">
                            {u.name}
                            {u.isAdmin && (
                              <span
                                className={badgeClass(
                                  'neutral',
                                  'ml-2 border-[#fbbf2433] bg-[#fbbf2416] text-amber',
                                )}
                              >
                                ADMIN
                              </span>
                            )}
                          </strong>
                          <small className={cn(cellSmall, 'truncate')}>{u.email}</small>
                        </div>
                      </div>
                    </td>
                    <td className={td}>
                      {u.emailVerified ? (
                        <Badge tone="gain">VERIFIED</Badge>
                      ) : (
                        <Badge tone="neutral">UNVERIFIED</Badge>
                      )}
                    </td>
                    <td className={td}>
                      <span className="flex gap-1">
                        {u.providers.length ? (
                          u.providers.map((p) => (
                            <Badge key={p} tone="neutral">
                              {p.toUpperCase()}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-dim">—</span>
                        )}
                      </span>
                    </td>
                    <td className={cn(td, mono, 'text-[12px]')}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className={cn(td, mono, 'text-right')}>{u.orders}</td>
                    <td className={cn(td, mono, 'text-right', u.approvedOrders > 0 && 'text-gain')}>
                      {u.approvedOrders}
                    </td>
                    <td className={cn(td, mono, 'text-right font-semibold')}>
                      {usdt(u.totalSpent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && (
              <div className="flex flex-col items-center gap-3 px-5 py-12 text-center text-[13px] text-muted">
                <span className="grid size-12 place-items-center rounded-[16px] border border-line bg-[#ffffff05] text-violet-3">
                  <Users size={20} />
                </span>
                {search ? `No users match “${search}”.` : 'No users yet.'}
              </div>
            )}
          </div>
        )}
      </Panel>
    </>
  );
}
