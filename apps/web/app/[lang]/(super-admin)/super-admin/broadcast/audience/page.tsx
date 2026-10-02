import { BroadcastAudienceView } from '@/features/super-admin/broadcast';

export default async function BroadcastAudiencePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <BroadcastAudienceView lang={lang} />;
}
