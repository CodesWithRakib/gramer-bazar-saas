import { ContractFarmingMarketplaceView } from '@/features/contract-farming';

export default async function ContractFarmingPublicPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <ContractFarmingMarketplaceView lang={lang} />;
}
