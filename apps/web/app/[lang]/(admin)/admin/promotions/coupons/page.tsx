import { AdminCouponsView } from "@/features/admin/promotions";

export default async function AdminCouponsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminCouponsView lang={lang} namespace="admin" />;
}
