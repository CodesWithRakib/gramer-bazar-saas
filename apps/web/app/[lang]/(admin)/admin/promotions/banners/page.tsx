import { AdminBannersView } from '@/features/admin/promotions';

export default async function AdminBannersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <AdminBannersView lang={lang} namespace="admin" />;
}
