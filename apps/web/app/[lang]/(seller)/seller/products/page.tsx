import { SellerProductsView } from "@/features/seller/products";

export default async function SellerProductsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <SellerProductsView lang={lang} />;
}
