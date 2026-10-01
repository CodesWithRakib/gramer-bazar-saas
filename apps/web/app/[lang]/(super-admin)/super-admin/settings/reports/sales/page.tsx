import { SalesAnalyticsView } from '@/features/super-admin/settings';

export default function SalesAnalyticsPage({
  params: { lang },
}: {
  params: { lang: string };
}) {
  return <SalesAnalyticsView lang={lang} namespace="super-admin" />;
}
