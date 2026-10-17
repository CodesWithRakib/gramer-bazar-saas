import { FarmerPrecisionPortfolioView } from '@/features/agri-precision';

export default async function CustomerAgriPrecisionPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <FarmerPrecisionPortfolioView lang={lang} />;
}
