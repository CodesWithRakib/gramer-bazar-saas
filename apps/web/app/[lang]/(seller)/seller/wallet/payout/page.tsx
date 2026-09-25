import { SellerPayoutView } from "@/features/seller/wallet";

export default async function SellerPayoutPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <SellerPayoutView lang={lang} />;
}
