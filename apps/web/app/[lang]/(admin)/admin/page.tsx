import { AdminDashboardView } from "@/features/admin/dashboard";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminDashboardView lang={lang} />;
}
