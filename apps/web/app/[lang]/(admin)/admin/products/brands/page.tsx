import { AdminBrandsView } from '@/features/admin/products';

export default async function BrandsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <AdminBrandsView lang={lang} namespace="admin" />;
}
