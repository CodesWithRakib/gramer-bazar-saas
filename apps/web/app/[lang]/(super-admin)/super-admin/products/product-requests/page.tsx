import { AdminProductRequestsView } from "@/features/super-admin/products";

export default async function SuperAdminProductRequestsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminProductRequestsView lang={lang} namespace="super-admin" />;
}
