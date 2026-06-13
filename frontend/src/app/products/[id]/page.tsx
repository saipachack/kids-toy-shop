import ProductDetailClient from './ProductDetailClient';

export async function generateStaticParams() {
  return [{ id: 'default' }];
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ProductDetailClient id={resolvedParams.id} />;
}
