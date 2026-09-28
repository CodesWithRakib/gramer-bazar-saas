import { AdminDeliveriesView } from '@/features/super-admin/orders';

export default async function SuperAdminDeliveriesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminDeliveriesView lang={lang} namespace="super-admin" />;
}
