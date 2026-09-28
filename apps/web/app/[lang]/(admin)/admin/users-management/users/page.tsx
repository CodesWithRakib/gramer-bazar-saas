import { AdminUsersView } from '@/features/admin/users-management';

export default async function AdminUsersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <AdminUsersView lang={lang} namespace="admin" />;
}
