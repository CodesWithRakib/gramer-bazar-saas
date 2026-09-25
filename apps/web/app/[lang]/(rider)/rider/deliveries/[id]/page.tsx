import { RiderDeliveryDetailsView } from "@/features/rider/deliveries";

export default async function RiderDeliveryDetailsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en"; id: string }>;
}) {
  const { lang, id } = await params;
  return <RiderDeliveryDetailsView lang={lang} id={id} />;
}
