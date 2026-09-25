import { AuditLogsView } from "@/features/super-admin/settings";

export default async function SuperAdminAuditLogsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AuditLogsView lang={lang} namespace="super-admin" />;
}
