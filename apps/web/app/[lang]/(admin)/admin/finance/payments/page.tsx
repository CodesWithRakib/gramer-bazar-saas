import { AdminPaymentsView } from '@/features/admin/finance';

export default async function AdminPaymentsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <AdminPaymentsView lang={lang} namespace="admin" />;
}
