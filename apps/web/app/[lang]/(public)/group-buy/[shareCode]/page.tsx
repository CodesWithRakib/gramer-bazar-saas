import { GroupBuyPoolDetailsView } from '@/features/group-buying';

export default async function GroupBuyPoolPage({
  params,
}: {
  params: Promise<{ lang: string; shareCode: string }>;
}) {
  const { lang, shareCode } = await params;
  return <GroupBuyPoolDetailsView shareCode={shareCode} lang={lang} />;
}
