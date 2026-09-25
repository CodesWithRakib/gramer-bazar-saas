import { AdminReviewsView } from "@/features/super-admin/disputes";

export default async function SuperAdminReviewsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminReviewsView lang={lang} namespace="super-admin" />;
}
