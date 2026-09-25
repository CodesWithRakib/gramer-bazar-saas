import { AdminRidersView } from "@/features/admin/users-management";

export default async function AdminRidersPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminRidersView lang={lang} namespace="admin" />;
}
