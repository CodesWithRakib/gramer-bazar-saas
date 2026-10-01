import { ProductsAnalyticsView } from '@/features/super-admin/settings';

export default function ProductsAnalyticsPage({
  params: { lang },
}: {
  params: { lang: string };
}) {
  return <ProductsAnalyticsView lang={lang} namespace="super-admin" />;
}
