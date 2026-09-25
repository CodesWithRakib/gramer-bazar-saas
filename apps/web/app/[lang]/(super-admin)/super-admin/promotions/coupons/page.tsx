import { AdminCouponsView } from "@/features/super-admin/promotions";

export default async function SuperAdminCouponsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminCouponsView lang={lang} namespace="super-admin" />;
}
