import { AdminWarehousesView } from '@/features/warehouses';

export default async function AdminWarehousesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminWarehousesView lang={lang} namespace="admin" />;
}
