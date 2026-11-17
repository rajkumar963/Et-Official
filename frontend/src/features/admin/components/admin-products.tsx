'use client';
import { useState, type FormEvent } from 'react';
import { BookOpen, ExternalLink, FileText, Save } from 'lucide-react';
import { productSettingSchema, type ProductSettingDto } from '@et-trader/shared';
import { adminService } from '@/features/admin/admin.api';
import { useAdminQuery } from '@/features/admin/use-admin-query';
import { PageHeading } from '@/components/ui/page-heading';
import { Panel } from '@/components/ui/panel';
import { Badge } from '@/components/ui/badge';
import { StatIcon } from '@/components/ui/stat-card';
import { buttonClass } from '@/components/ui/button';
import { errorBox, input, label, labelHint, textarea } from '@/components/ui/form';
import { mono, note } from '@/components/ui/styles';
import { cn } from '@/lib/cn';
import { LoadError } from './admin-states';
import { successBox } from './order-detail';
import { Loading, usdt } from './order-ui';

function ProductCard({ product, index }: { product: ProductSettingDto; index: number }) {
  const [saved, setSaved] = useState(product);
  const [accessUrl, setAccessUrl] = useState(product.accessUrl);
  const [accessNote, setAccessNote] = useState(product.accessNote);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const dirty = accessUrl !== saved.accessUrl || accessNote !== saved.accessNote;

  async function save(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    const parsed = productSettingSchema.safeParse({ accessUrl: accessUrl.trim(), accessNote });
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.path[0] === 'accessUrl'
          ? 'Enter a full link starting with https:// (or leave it empty).'
          : parsed.error.issues[0]?.message || 'Check the fields and try again.',
      );
      return;
    }
    setBusy(true);
    try {
      const updated = await adminService.updateProduct(product.productId, parsed.data);
      setSaved(updated);
      setAccessUrl(updated.accessUrl);
      setAccessNote(updated.accessNote);
      setSuccess('Saved.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel index={index} className="flex flex-col">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <StatIcon tone={product.type === 'course' ? 'purple' : 'cyan'}>
            {product.type === 'course' ? <BookOpen size={16} /> : <FileText size={16} />}
          </StatIcon>
          <div className="min-w-0">
            <h2>{product.title}</h2>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-muted">
              <Badge tone="neutral">{product.type === 'course' ? 'COURSE' : 'E-BOOK'}</Badge>
              <span className={mono}>{usdt(product.price)}</span>
            </p>
          </div>
        </div>
        {saved.accessUrl ? <Badge tone="gain">LINK SET</Badge> : <Badge tone="loss">NO LINK</Badge>}
      </div>
      <form className="flex flex-1 flex-col gap-4" onSubmit={save}>
        <label className={label}>
          <span>
            Access link <span className={labelHint}>(Google Drive folder or PDF URL)</span>
          </span>
          <input
            className={input}
            type="url"
            inputMode="url"
            placeholder="https://drive.google.com/…"
            value={accessUrl}
            onChange={(e) => {
              setAccessUrl(e.target.value);
              setSuccess('');
            }}
          />
        </label>
        <label className={label}>
          <span>
            Note for buyers <span className={labelHint}>(optional)</span>
          </span>
          <textarea
            className={textarea}
            rows={2}
            maxLength={500}
            placeholder="e.g. Open the link with the Gmail you gave at checkout."
            value={accessNote}
            onChange={(e) => {
              setAccessNote(e.target.value);
              setSuccess('');
            }}
          />
        </label>
        {error && (
          <p className={errorBox} role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className={successBox} role="status">
            {success}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2.5">
          {saved.accessUrl ? (
            <a
              href={saved.accessUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[12px] text-violet-3 hover:text-white"
            >
              Test link <ExternalLink size={12} />
            </a>
          ) : (
            <span />
          )}
          <button className={buttonClass({ size: 'sm' })} disabled={busy || !dirty}>
            <Save size={14} /> {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Panel>
  );
}

export function AdminProducts() {
  const products = useAdminQuery(adminService.products);
  return (
    <>
      <PageHeading
        eyebrow="COURSE ACCESS"
        title="Course access"
        description="Buyers receive this link by email when you approve their payment, and see it in My courses."
      />
      {products.error ? (
        <LoadError message={products.error} onRetry={products.reload} />
      ) : !products.data ? (
        <Loading label="Loading products…" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3.5 max-[1000px]:grid-cols-1">
            {products.data.map((product, i) => (
              <ProductCard key={product.productId} product={product} index={i} />
            ))}
          </div>
          <p className={cn(note, 'mt-0')}>
            Tip: share the Google Drive folder or file with &ldquo;Anyone with the link&rdquo; or
            add each buyer&rsquo;s Gmail (shown on the order) as a viewer. Changing a link here
            updates what existing buyers see in My courses.
          </p>
        </>
      )}
    </>
  );
}
