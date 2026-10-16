import { AdminWarehousesView } from '@/features/warehouses';

export default async function SuperAdminWarehousesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminWarehousesView lang={lang} namespace="super-admin" />;
}
