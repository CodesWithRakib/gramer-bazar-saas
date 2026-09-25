import { AdminReviewsView } from "@/features/admin/disputes";

export default async function AdminReviewsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminReviewsView lang={lang} namespace="admin" />;
}
