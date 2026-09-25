import { AdminCategoriesView } from "@/features/super-admin/products";

export default async function SuperAdminCategoriesPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminCategoriesView lang={lang} namespace="super-admin" />;
}
