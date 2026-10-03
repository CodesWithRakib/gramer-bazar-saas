import { AdminAttributesView } from '@/features/admin/products';

export default async function AttributesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <AdminAttributesView lang={lang} namespace="admin" />;
}
