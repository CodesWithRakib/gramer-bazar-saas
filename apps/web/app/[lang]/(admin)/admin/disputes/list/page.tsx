import { AdminDisputesView } from '@/features/admin/disputes';

export default async function AdminDisputesListPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminDisputesView lang={lang} namespace="admin" />;
}
