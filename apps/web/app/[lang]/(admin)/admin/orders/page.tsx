import { OrdersHubView } from '@/features/admin/orders';

export default async function AdminOrdersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <OrdersHubView lang={lang} namespace="admin" />;
}
