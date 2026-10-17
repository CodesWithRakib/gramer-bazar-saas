import { FarmerContractsPortfolioView } from '@/features/contract-farming';

export default async function CustomerContractFarmingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <FarmerContractsPortfolioView lang={lang} />;
}
