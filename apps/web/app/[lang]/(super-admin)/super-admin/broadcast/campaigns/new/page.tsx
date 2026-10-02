import { BroadcastCampaignWizard } from '@/features/super-admin/broadcast';

export default async function BroadcastNewCampaignPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <BroadcastCampaignWizard lang={lang} />;
}
