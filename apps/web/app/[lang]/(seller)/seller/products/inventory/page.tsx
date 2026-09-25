import { SellerInventoryView } from "@/features/seller/products";

export default async function SellerInventoryPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <SellerInventoryView lang={lang} />;
}
