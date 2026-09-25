import { AdminCategoriesView } from "@/features/admin/products";

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminCategoriesView lang={lang} namespace="admin" />;
}
