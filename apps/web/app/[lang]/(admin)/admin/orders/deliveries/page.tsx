import { AdminDeliveriesView } from "@/features/admin/orders";

export default async function AdminDeliveriesPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminDeliveriesView lang={lang} namespace="admin" />;
}
