import { AdminAttributesView } from '@/features/super-admin/products';

export default async function SuperAdminAttributesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminAttributesView lang={lang} namespace="super-admin" />;
}
