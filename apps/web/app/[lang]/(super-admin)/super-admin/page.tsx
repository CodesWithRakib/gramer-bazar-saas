import { SuperAdminDashboardView } from '@/features/super-admin/dashboard';

export default async function SuperAdminDashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <SuperAdminDashboardView lang={lang} />;
}
