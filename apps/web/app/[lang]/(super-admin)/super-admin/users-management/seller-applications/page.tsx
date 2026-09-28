import { AdminSellerApplicationsView } from '@/features/super-admin/users-management';

export default async function SuperAdminSellerApplicationsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminSellerApplicationsView lang={lang} namespace="super-admin" />;
}
