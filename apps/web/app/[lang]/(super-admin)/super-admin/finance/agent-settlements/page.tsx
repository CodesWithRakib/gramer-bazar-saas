import { AdminAgentSettlementsView } from '@/features/admin/finance';

export default async function SuperAdminAgentSettlementsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminAgentSettlementsView lang={lang} />;
}
