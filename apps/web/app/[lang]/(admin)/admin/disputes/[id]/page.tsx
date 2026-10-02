import { AdminDisputeDetailsView } from '@/features/admin/disputes';

export default async function AdminDisputeDetailsPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  return <AdminDisputeDetailsView lang={lang} id={id} namespace="admin" />;
}
