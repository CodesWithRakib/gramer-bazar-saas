import { FinanceHubView } from '@/features/admin/finance';

export default async function FinancePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <FinanceHubView lang={lang} namespace="admin" />;
}
