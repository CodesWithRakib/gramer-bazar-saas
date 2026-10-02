import { AdminOrdersView } from '@/features/admin/orders';

export default async function AdminOrdersListPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminOrdersView lang={lang} namespace="admin" />;
}
