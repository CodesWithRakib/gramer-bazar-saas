import { AdminRiderApplicationsView } from '@/features/super-admin/users-management';

export default async function SuperAdminRiderApplicationsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminRiderApplicationsView lang={lang} namespace="super-admin" />;
}
