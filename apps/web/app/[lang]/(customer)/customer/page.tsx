import { CustomerDashboardView } from '@/features/customer/dashboard';

export default async function CustomerDashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <CustomerDashboardView lang={lang} />;
}
