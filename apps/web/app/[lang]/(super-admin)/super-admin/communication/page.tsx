import { CommunicationHubView } from '@/features/super-admin/communication';

export default async function SuperAdminCommunicationPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <CommunicationHubView lang={lang} />;
}
