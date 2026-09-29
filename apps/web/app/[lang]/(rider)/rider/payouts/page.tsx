import { RiderPayoutsView } from '@/features/rider/payouts';

export default async function RiderPayoutsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <RiderPayoutsView lang={lang} />;
}
