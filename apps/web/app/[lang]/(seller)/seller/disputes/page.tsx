import { SellerDisputesView } from "@/features/seller/disputes";

export default async function SellerDisputesPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <SellerDisputesView lang={lang} />;
}
