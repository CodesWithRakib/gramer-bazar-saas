import { PromotionsHubView } from '@/features/admin/promotions';

export default async function PromotionsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <PromotionsHubView lang={lang} namespace="admin" />;
}
