import { SellerOrdersView } from "@/features/seller/orders";

export default async function SellerOrdersPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <SellerOrdersView lang={lang} />;
}
