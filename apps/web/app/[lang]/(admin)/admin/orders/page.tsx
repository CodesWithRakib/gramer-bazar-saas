import { AdminOrdersView } from "@/features/admin/orders";

export default async function AdminOrdersPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminOrdersView lang={lang} namespace="admin" />;
}
