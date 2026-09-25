import { AdminSellerApplicationsView } from "@/features/super-admin/users-management";

export default async function SuperAdminSellerApplicationsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminSellerApplicationsView lang={lang} namespace="super-admin" />;
}
