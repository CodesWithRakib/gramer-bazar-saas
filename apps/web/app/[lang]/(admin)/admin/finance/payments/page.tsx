import { AdminPaymentsView } from "@/features/admin/finance";

export default async function AdminPaymentsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminPaymentsView lang={lang} namespace="admin" />;
}
