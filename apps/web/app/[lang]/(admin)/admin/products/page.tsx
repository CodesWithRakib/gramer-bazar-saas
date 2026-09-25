import { AdminProductsView } from "@/features/admin/products";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminProductsView lang={lang} namespace="admin" />;
}
