import { CustomersAnalyticsView } from '@/features/super-admin/settings';

export default function CustomersAnalyticsPage({
  params: { lang },
}: {
  params: { lang: string };
}) {
  return <CustomersAnalyticsView lang={lang} namespace="super-admin" />;
}
