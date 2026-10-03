import { AdminProductTypesView } from '@/features/admin/products';

export default async function ProductTypesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <AdminProductTypesView lang={lang} namespace="admin" />;
}
