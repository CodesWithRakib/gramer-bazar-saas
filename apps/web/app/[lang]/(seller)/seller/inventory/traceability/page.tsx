import { SellerProduceGradingView } from '@/features/traceability/components/SellerProduceGradingView';

export default async function SellerTraceabilityPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <SellerProduceGradingView lang={lang} />;
}
