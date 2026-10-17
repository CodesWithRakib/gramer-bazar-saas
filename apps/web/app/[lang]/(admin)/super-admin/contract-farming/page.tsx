import { AdminContractArbitrationView } from '@/features/contract-farming';

export default async function SuperAdminContractFarmingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminContractArbitrationView lang={lang} />;
}
