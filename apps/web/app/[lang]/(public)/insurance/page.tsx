import { CropInsuranceMarketplaceView } from '@/features/insurance';

export default async function CropInsurancePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <CropInsuranceMarketplaceView lang={lang} />;
}
