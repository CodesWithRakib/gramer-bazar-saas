import { AdminProductsView } from '@/features/admin/products';

export default async function AdminProductsListPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminProductsView lang={lang} namespace="admin" />;
}
