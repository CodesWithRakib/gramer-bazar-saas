import { AdminSellersView } from "@/features/admin/users-management";

export default async function AdminSellersPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminSellersView lang={lang} namespace="admin" />;
}
