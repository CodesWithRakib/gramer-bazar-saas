import { AuditLogsView } from '@/features/admin/settings';

export default async function AuditLogsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <AuditLogsView lang={lang} namespace="admin" />;
}
