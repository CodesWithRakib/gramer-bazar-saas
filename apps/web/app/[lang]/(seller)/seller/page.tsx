import { SellerDashboardView } from "@/features/seller/dashboard";

export default async function SellerDashboardPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <SellerDashboardView lang={lang} />;
}
