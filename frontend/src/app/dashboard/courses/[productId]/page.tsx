import type { Metadata } from 'next';
import { getProduct } from '@et-trader/shared';
import { CourseViewer } from '@/features/commerce/components/course-viewer';

type Props = { params: Promise<{ productId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).productId);
  return { title: product ? product.title : 'Course' };
}

export default async function Page({ params }: Props) {
  const { productId } = await params;
  return <CourseViewer productId={productId} />;
}
