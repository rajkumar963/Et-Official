'use client';

import { useId, useState } from 'react';
import { Check, Tag, X } from 'lucide-react';
import { courseCouponCode, productQuote, type Product } from '@et-trader/shared';

export function CourseCoupon({
  product,
  value,
  onChange,
}: {
  product: Product;
  value: string;
  onChange: (code: string) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  if (product.type !== 'course' || product.comingSoon) return null;

  function apply() {
    try {
      if (!draft.trim()) throw new Error('Enter a coupon code.');
      const quote = productQuote(product, draft);
      onChange(quote.couponCode!);
      setError('');
    } catch (error) {
      setError((error as Error).message);
    }
  }

  return (
    <div className="relative z-[1] rounded-xl border border-violet/25 bg-violet/5 p-3.5">
      <label
        htmlFor={value ? undefined : id}
        className="mb-2.5 flex items-center gap-2 text-[12px] font-semibold text-violet-3"
      >
        <Tag size={14} aria-hidden="true" /> Apply coupon code
      </label>
      {value ? (
        <div className="flex items-center justify-between gap-2" role="status">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-cyan">
            <Check size={15} aria-hidden="true" /> {value} applied · 10% off
          </span>
          <button
            type="button"
            onClick={() => {
              onChange('');
              setDraft('');
              setError('');
            }}
            aria-label="Remove coupon"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-violet-2"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            id={id}
            value={draft}
            maxLength={32}
            autoComplete="off"
            spellCheck={false}
            placeholder="Enter code"
            aria-invalid={!!error}
            aria-describedby={`${id}-hint`}
            onChange={(event) => {
              setDraft(event.target.value);
              setError('');
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                apply();
              }
            }}
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#0a0a12] px-3 py-2.5 font-mono text-[13px] text-white uppercase outline-none placeholder:font-sans placeholder:normal-case placeholder:text-dim focus:border-violet-2 focus:ring-2 focus:ring-violet/20"
          />
          <button
            type="button"
            onClick={apply}
            className="shrink-0 rounded-lg border border-violet/40 bg-violet/20 px-4 text-[12px] font-semibold text-violet-3 transition-colors hover:bg-violet/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-2"
          >
            Apply
          </button>
        </div>
      )}
      <p
        id={`${id}-hint`}
        className={`mt-2 text-[11px] leading-relaxed ${error ? 'text-loss' : 'text-muted'}`}
        role={error ? 'alert' : undefined}
      >
        {error ||
          (value ? (
            'Your discount is included in the course total.'
          ) : (
            <>
              Use <strong className="font-mono text-violet-3">{courseCouponCode}</strong> for 10%
              off this course.
            </>
          ))}
      </p>
    </div>
  );
}
