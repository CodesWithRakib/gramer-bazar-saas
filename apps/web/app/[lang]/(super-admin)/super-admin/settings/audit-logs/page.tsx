import { AuditLogsView } from '@/features/super-admin/settings';

export default async function SuperAdminAuditLogsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AuditLogsView lang={lang} namespace="super-admin" />;
}
