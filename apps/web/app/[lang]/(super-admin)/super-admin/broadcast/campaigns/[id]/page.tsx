import { BroadcastCampaignDetailView } from '@/features/super-admin/broadcast';

export default async function BroadcastCampaignDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  return <BroadcastCampaignDetailView lang={lang} id={id} />;
}
