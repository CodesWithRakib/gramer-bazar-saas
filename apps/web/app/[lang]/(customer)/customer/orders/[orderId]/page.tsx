import { CustomerOrderDetailsView } from "@/features/customer/orders";

export default async function CustomerOrderDetailsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en"; orderId: string }>;
}) {
  const { lang, orderId } = await params;
  return <CustomerOrderDetailsView lang={lang} orderId={orderId} />;
}
