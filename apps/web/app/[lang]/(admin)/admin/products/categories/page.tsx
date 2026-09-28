import { AdminCategoriesView } from '@/features/admin/products';

export default async function CategoriesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <AdminCategoriesView lang={lang} namespace="admin" />;
}
