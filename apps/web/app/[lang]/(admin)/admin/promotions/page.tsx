import { PromotionsHubView } from "@/features/admin/promotions";

export default async function PromotionsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <PromotionsHubView lang={lang} namespace="admin" />;
}
