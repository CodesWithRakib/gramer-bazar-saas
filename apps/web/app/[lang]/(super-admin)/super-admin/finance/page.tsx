import { FinanceHubView } from '@/features/super-admin/finance';

export default async function SuperAdminFinancePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <FinanceHubView lang={lang} namespace="super-admin" />;
}
