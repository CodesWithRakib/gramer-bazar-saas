import { SellerGroupBuyView } from '@/features/group-buying';

export default async function SellerGroupBuyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <SellerGroupBuyView lang={lang} />;
}
