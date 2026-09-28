import { AdminPayoutsView } from '@/features/super-admin/finance';

export default async function SuperAdminPayoutsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminPayoutsView lang={lang} namespace="super-admin" />;
}
