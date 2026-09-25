import { SellerWalletView } from "@/features/seller/wallet";

export default async function SellerWalletPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <SellerWalletView lang={lang} />;
}
