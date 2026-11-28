import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getProduct, productQuote } from '@et-trader/shared';
import { SiteNavbar } from '@/features/marketing/components/site-navbar';
import { SiteFooter } from '@/features/marketing/components/site-footer';
import { CheckoutFlow } from '@/features/commerce/components/checkout-flow';
import { home } from '@/features/marketing/marketing-styles';

type Props = {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ coupon?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).productId);
  return { title: product ? `Checkout · ${product.title}` : 'Checkout', robots: { index: false } };
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { productId } = await params;
  const product = getProduct(productId);
  if (!product) notFound();
  if (product.comingSoon) redirect(`/ebooks#${product.id}`);
  const query = await searchParams;
  let initialCouponCode = '';
  if (typeof query.coupon === 'string' && product.type === 'course') {
    try {
      initialCouponCode = productQuote(product, query.coupon).couponCode || '';
    } catch {
      /* Invalid links leave the full price and allow a new code. */
    }
  }
  const checkoutPath =
    `/checkout/${product.id}` +
    (initialCouponCode ? `?coupon=${encodeURIComponent(initialCouponCode)}` : '');
  // Buying requires an account so the purchase shows up in My courses.
  const jar = await cookies();
  if (!jar.has('tj_access') && !jar.has('tj_refresh'))
    redirect(`/login?next=${encodeURIComponent(checkoutPath)}`);
  return (
    <div className={home}>
      <SiteNavbar />
      <main className="min-h-screen px-6 pt-[124px] pb-[90px] max-[560px]:px-[16px] max-[560px]:pt-[108px]">
        <div className="mx-auto max-w-[1080px]">
          <CheckoutFlow productId={product.id} initialCouponCode={initialCouponCode} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
