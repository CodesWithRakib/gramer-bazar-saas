import { RiderDeliveriesView } from "@/features/rider/deliveries";

export default async function RiderDeliveriesPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <RiderDeliveriesView lang={lang} />;
}
