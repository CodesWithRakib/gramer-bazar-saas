import { BroadcastCampaignsView } from '@/features/super-admin/broadcast';

export default async function BroadcastCampaignsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <BroadcastCampaignsView lang={lang} />;
}
