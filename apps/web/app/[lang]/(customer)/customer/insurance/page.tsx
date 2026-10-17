import { FarmerInsurancePortfolioView } from '@/features/insurance';

export default async function CustomerInsurancePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <FarmerInsurancePortfolioView lang={lang} />;
}
