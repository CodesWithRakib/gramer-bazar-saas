import { AdminFlashSalesView } from "@/features/super-admin/promotions";

export default async function SuperAdminFlashSalesPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminFlashSalesView lang={lang} namespace="super-admin" />;
}
