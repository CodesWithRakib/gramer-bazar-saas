import { AdminUserDetailView } from '@/features/super-admin/users-management';

export default async function SuperAdminUserDetailsPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  return <AdminUserDetailView lang={lang} id={id} basePath="super-admin" />;
}
