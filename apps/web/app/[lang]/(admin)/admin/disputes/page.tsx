import { AdminDisputesView } from "@/features/admin/disputes";

export default async function AdminDisputesPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminDisputesView lang={lang} namespace="admin" />;
}
