import { SuperAdminDashboardView } from "@/features/super-admin/dashboard";

export default async function SuperAdminDashboardPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <SuperAdminDashboardView lang={lang} />;
}
