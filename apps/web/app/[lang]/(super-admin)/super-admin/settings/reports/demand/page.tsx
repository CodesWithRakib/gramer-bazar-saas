import { DemandAnalyticsView } from '@/features/super-admin/settings';

export default async function SuperAdminDemandReportsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <DemandAnalyticsView lang={lang} namespace="super-admin" />;
}
