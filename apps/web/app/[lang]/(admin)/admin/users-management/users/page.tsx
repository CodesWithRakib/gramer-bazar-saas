import { AdminUsersView } from "@/features/admin/users-management";

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminUsersView lang={lang} namespace="admin" />;
}
