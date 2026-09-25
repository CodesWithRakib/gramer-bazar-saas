import { UsersManagementHubView } from "@/features/super-admin/users-management";

export default async function SuperAdminUsersManagementPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <UsersManagementHubView lang={lang} namespace="super-admin" />;
}
