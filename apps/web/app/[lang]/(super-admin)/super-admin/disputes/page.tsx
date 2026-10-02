import { DisputesHubView } from '@/features/super-admin/disputes';

export default async function SuperAdminDisputesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <DisputesHubView lang={lang} namespace="super-admin" />;
}
