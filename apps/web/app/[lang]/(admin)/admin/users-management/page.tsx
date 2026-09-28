import { UsersManagementHubView } from '@/features/admin/users-management';

export default async function UsersManagementPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <UsersManagementHubView lang={lang} namespace="admin" />;
}
