import { AdminUsersView } from "@/features/super-admin/users-management";

export default async function SuperAdminUsersPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminUsersView lang={lang} namespace="super-admin" />;
}
