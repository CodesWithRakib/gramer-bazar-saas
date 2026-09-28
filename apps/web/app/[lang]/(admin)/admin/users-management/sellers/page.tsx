import { AdminSellersView } from '@/features/admin/users-management';

export default async function AdminSellersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <AdminSellersView lang={lang} namespace="admin" />;
}
