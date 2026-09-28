import { SellerReportsView } from '@/features/seller/reports';

export default async function SellerReportsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <SellerReportsView lang={lang} />;
}
