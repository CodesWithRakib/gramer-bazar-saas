import { AdminProductTypesView } from '@/features/super-admin/products';

export default async function SuperAdminProductTypesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminProductTypesView lang={lang} namespace="super-admin" />;
}
