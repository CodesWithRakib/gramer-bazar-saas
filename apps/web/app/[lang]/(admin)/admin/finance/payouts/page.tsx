import { AdminPayoutsView } from '@/features/admin/finance';

export default async function AdminPayoutsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <AdminPayoutsView lang={lang} namespace="admin" />;
}
