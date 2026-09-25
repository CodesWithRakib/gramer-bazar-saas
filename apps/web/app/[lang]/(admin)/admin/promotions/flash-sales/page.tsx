import { AdminFlashSalesView } from "@/features/admin/promotions";

export default async function AdminFlashSalesPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminFlashSalesView lang={lang} namespace="admin" />;
}
