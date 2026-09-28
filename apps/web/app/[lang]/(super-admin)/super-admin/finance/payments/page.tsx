import { AdminPaymentsView } from '@/features/super-admin/finance';

export default async function SuperAdminPaymentsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminPaymentsView lang={lang} namespace="super-admin" />;
}
