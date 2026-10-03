import { AdminManufacturersView } from '@/features/admin/products';

export default async function SuperAdminManufacturersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminManufacturersView lang={lang} namespace="super-admin" />;
}
