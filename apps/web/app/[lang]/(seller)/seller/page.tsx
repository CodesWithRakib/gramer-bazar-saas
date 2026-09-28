import { SellerDashboardView } from '@/features/seller/dashboard';

export default async function SellerDashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <SellerDashboardView lang={lang} />;
}
