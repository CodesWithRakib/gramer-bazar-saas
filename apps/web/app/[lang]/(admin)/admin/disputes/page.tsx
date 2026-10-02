import { DisputesHubView } from '@/features/admin/disputes';

export default async function AdminDisputesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <DisputesHubView lang={lang} namespace="admin" />;
}
