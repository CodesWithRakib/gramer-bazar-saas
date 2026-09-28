import { AdminDeliveriesView } from '@/features/admin/orders';

export default async function AdminDeliveriesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminDeliveriesView lang={lang} namespace="admin" />;
}
