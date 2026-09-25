import { AdminRidersView } from "@/features/super-admin/users-management";

export default async function SuperAdminRidersPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminRidersView lang={lang} namespace="super-admin" />;
}
