import { ContractFarmingApplyView } from '@/features/contract-farming';

export default async function ContractFarmingApplyPage({
  params,
}: {
  params: Promise<{ id: string; lang: string }>;
}) {
  const { id, lang } = await params;
  return <ContractFarmingApplyView campaignId={id} lang={lang} />;
}
