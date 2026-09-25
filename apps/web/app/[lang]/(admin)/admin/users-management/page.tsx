import { UsersManagementHubView } from "@/features/admin/users-management";

export default async function UsersManagementPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <UsersManagementHubView lang={lang} namespace="admin" />;
}
