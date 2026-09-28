import { AdminRidersView } from '@/features/super-admin/users-management';

export default async function SuperAdminRidersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminRidersView lang={lang} namespace="super-admin" />;
}
