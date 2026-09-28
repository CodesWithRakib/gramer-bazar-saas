import { DemandAnalyticsView } from '@/features/admin/settings';

export default async function DemandReportsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <DemandAnalyticsView lang={lang} namespace="admin" />;
}
