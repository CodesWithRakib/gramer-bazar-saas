import { AdminSellerApplicationsView } from "@/features/admin/users-management";

export default async function AdminSellerApplicationsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminSellerApplicationsView lang={lang} namespace="admin" />;
}
