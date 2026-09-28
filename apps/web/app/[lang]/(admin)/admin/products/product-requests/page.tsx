import { AdminProductRequestsView } from '@/features/admin/products';

export default async function ProductRequestsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminProductRequestsView lang={lang} namespace="admin" />;
}
