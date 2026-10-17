import { OwnerMachineryDashboardView } from '@/features/machinery';

export default async function SellerMachineryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <OwnerMachineryDashboardView lang={lang} />;
}
