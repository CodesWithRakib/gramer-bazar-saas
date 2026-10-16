import { PublicBatchTraceabilityView } from '@/features/traceability/components/PublicBatchTraceabilityView';

export default async function PublicBatchTracePage({
  params,
}: {
  params: Promise<{ lang: string; batchNumber: string }>;
}) {
  const { lang, batchNumber } = await params;
  return <PublicBatchTraceabilityView lang={lang} batchNumber={batchNumber} />;
}
