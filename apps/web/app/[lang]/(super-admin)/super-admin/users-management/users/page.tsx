import { AdminUsersView } from '@/features/super-admin/users-management';

export default async function SuperAdminUsersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminUsersView lang={lang} namespace="super-admin" />;
}
