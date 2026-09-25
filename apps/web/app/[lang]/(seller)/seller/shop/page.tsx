import { SellerShopView } from "@/features/seller/shop";

export default async function SellerShopPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <SellerShopView lang={lang} />;
}
