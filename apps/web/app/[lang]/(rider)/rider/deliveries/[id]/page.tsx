import { RiderDeliveryDetailsView } from '@/features/rider/deliveries';

export default async function RiderDeliveryDetailsPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  return <RiderDeliveryDetailsView lang={lang} id={id} />;
}
