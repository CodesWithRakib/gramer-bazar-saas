import { SellerProfileView } from "@/features/seller/profile";

export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <SellerProfileView lang={lang} />;
}
