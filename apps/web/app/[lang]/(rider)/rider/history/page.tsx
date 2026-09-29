import { RiderHistoryView } from '@/features/rider/history';

export default async function RiderHistoryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <RiderHistoryView lang={lang} />;
}
