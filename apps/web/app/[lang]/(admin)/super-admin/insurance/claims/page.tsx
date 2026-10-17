import { AdminInsuranceDisasterHubView } from '@/features/insurance';

export default async function SuperAdminInsuranceClaimsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminInsuranceDisasterHubView lang={lang} />;
}
