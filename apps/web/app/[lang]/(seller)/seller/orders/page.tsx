import { SellerOrdersView } from '@/features/seller/orders';

export default async function SellerOrdersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <SellerOrdersView lang={lang} />;
}
