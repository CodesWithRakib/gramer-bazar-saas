import { RiderEarningsView } from '@/features/rider/earnings';

export default async function RiderEarningsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <RiderEarningsView lang={lang} />;
}
