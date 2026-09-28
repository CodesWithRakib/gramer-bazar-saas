import { PromotionsHubView } from '@/features/super-admin/promotions';

export default async function SuperAdminPromotionsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <PromotionsHubView lang={lang} namespace="super-admin" />;
}
