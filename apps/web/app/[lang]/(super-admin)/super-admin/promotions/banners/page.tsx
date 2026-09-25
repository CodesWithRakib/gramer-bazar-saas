import { AdminBannersView } from "@/features/super-admin/promotions";

export default async function SuperAdminBannersPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminBannersView lang={lang} namespace="super-admin" />;
}
