import { AdminRiderApplicationsView } from "@/features/admin/users-management";

export default async function AdminRiderApplicationsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminRiderApplicationsView lang={lang} namespace="admin" />;
}
