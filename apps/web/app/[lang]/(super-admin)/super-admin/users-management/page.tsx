import { UsersManagementHubView } from '@/features/super-admin/users-management';

export default async function SuperAdminUsersManagementPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <UsersManagementHubView lang={lang} namespace="super-admin" />;
}
