import { AdminOrdersView } from '@/features/super-admin/orders';

export default async function SuperAdminOrdersListPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminOrdersView lang={lang} namespace="super-admin" />;
}
