import { SellerCouponsView } from "@/features/seller/coupons";

export default async function SellerCouponsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <SellerCouponsView lang={lang} />;
}
