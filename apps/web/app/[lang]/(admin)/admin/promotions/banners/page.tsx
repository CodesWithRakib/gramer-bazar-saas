import { AdminBannersView } from "@/features/admin/promotions";

export default async function AdminBannersPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminBannersView lang={lang} namespace="admin" />;
}
