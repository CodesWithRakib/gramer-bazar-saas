import { AdminCategoriesView } from '@/features/super-admin/products';

export default async function SuperAdminCategoriesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminCategoriesView lang={lang} namespace="super-admin" />;
}
