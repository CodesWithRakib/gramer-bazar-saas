import { AdminBrandsView } from "@/features/super-admin/products";

export default async function SuperAdminBrandsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminBrandsView lang={lang} namespace="super-admin" />;
}
