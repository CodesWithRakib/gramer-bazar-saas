import { SellerOrderDetailsView } from "@/features/seller/orders";

export default async function SellerOrderDetailsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en"; id: string }>;
}) {
  const { lang, id } = await params;
  return <SellerOrderDetailsView lang={lang} id={id} />;
}
