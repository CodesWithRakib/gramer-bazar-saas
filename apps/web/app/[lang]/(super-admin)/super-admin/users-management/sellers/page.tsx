import { AdminSellersView } from '@/features/super-admin/users-management';

export default async function SuperAdminSellersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminSellersView lang={lang} namespace="super-admin" />;
}
