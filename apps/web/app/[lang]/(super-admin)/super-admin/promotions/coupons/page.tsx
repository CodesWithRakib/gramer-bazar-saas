import { AdminCouponsView } from '@/features/super-admin/promotions';

export default async function SuperAdminCouponsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminCouponsView lang={lang} namespace="super-admin" />;
}
