import { AdminProductsView } from '@/features/super-admin/products';

export default async function SuperAdminProductsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminProductsView lang={lang} namespace="super-admin" />;
}
