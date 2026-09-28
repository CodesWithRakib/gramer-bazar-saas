import { AdminProductRequestDetailsView } from '@/features/super-admin/products';

export default async function SuperAdminProductRequestDetailsPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  return <AdminProductRequestDetailsView lang={lang} id={id} />;
}
