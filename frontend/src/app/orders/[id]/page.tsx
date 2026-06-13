import OrderDetailClient from './OrderDetailClient';

export async function generateStaticParams() {
  return [{ id: 'default' }];
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <OrderDetailClient id={resolvedParams.id} />;
}
