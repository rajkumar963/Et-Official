import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getProduct } from '@et-trader/shared';
import { SiteNavbar } from '@/features/marketing/components/site-navbar';
import { SiteFooter } from '@/features/marketing/components/site-footer';
import { CheckoutFlow } from '@/features/commerce/components/checkout-flow';
import { home } from '@/features/marketing/marketing-styles';

type Props = { params: Promise<{ productId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).productId);
  return { title: product ? `Checkout · ${product.title}` : 'Checkout', robots: { index: false } };
}

export default async function CheckoutPage({ params }: Props) {
  const { productId } = await params;
  const product = getProduct(productId);
  if (!product) notFound();
  // Buying requires an account so the purchase shows up in My courses.
  const jar = await cookies();
  if (!jar.has('tj_access') && !jar.has('tj_refresh'))
    redirect(`/login?next=${encodeURIComponent(`/checkout/${product.id}`)}`);
  return (
    <div className={home}>
      <SiteNavbar />
      <main className="min-h-screen px-6 pt-[124px] pb-[90px] max-[560px]:px-[16px] max-[560px]:pt-[108px]">
        <div className="mx-auto max-w-[1080px]">
          <CheckoutFlow productId={product.id} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
