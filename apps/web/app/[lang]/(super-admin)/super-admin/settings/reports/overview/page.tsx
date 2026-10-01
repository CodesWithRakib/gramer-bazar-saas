import { AnalyticsOverviewView } from '@/features/super-admin/settings';

export default function OverviewAnalyticsPage({
  params: { lang },
}: {
  params: { lang: string };
}) {
  return <AnalyticsOverviewView lang={lang} namespace="super-admin" />;
}
