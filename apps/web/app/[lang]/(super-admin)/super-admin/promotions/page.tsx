import { PromotionsHubView } from "@/features/super-admin/promotions";

export default async function SuperAdminPromotionsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <PromotionsHubView lang={lang} namespace="super-admin" />;
}
