'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getProduct, productQuote } from '@et-trader/shared';
import { CourseCoupon } from '@/features/commerce/components/course-coupon';
import { enrollHref } from '../enroll';

export function CourseOffer({
  productId,
  variant = 'card',
}: {
  productId: string;
  variant?: 'card' | 'purchase';
}) {
  const [couponCode, setCouponCode] = useState('');
  const product = getProduct(productId);
  if (!product || product.type !== 'course' || product.comingSoon) return null;
  const quote = productQuote(product, couponCode);
  const href =
    enrollHref(product) + (couponCode ? `?coupon=${encodeURIComponent(couponCode)}` : '');

  return (
    <div className="relative z-[1] grid gap-3.5">
      {(variant === 'purchase' || couponCode) && (
        <div aria-live="polite">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <strong className="font-mono text-[28px] font-extrabold tracking-[-0.03em] text-white">
              {quote.amount} <span className="text-[13px] text-violet-3">USDT</span>
            </strong>
            {couponCode && <s className="text-[13px] text-dim">{quote.originalAmount} USDT</s>}
          </div>
          <p className="mt-1 text-[12px] text-muted">
            {couponCode ? (
              <span className="text-cyan">You save {quote.discountAmount} USDT (10%)</span>
            ) : (
              'One-time payment · lifetime access'
            )}
          </p>
        </div>
      )}
      <CourseCoupon product={product} value={couponCode} onChange={setCouponCode} />
      <Link
        href={href}
        className="flex min-h-[48px] w-full items-center gap-2 rounded-[10px] bg-[linear-gradient(100deg,#6d28d9,#8b5cf6)] py-1.5 pr-2 pl-3.5 text-[14px] font-extrabold text-white shadow-[0_7px_20px_#8b5cf640] transition-[filter,translate] hover:-translate-y-px hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-2"
      >
        Enroll now <ArrowRight size={15} aria-hidden="true" />
        <span className="ml-auto rounded-[7px] bg-[#4c1d95] px-2.5 py-2 font-mono text-[12px] font-extrabold">
          {quote.amount} USDT
        </span>
      </Link>
    </div>
  );
}
