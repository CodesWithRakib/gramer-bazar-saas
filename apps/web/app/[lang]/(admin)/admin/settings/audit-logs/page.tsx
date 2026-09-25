import { AuditLogsView } from "@/features/admin/settings";

export default async function AuditLogsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AuditLogsView lang={lang} namespace="admin" />;
}
