import { AdminUserDetailView } from '@/features/admin/users-management';

export default async function AdminUserDetailsPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  return <AdminUserDetailView lang={lang} id={id} basePath="admin" />;
}
