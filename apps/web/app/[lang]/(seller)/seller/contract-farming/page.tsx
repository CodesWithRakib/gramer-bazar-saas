import { BuyerContractFleetView } from '@/features/contract-farming';

export default async function SellerContractFarmingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <BuyerContractFleetView lang={lang} />;
}
