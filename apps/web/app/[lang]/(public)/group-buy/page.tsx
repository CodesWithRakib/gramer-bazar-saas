import { GroupBuyMarketplaceView } from '@/features/group-buying';

export default async function GroupBuyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <GroupBuyMarketplaceView lang={lang} />;
}
