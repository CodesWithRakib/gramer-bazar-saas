import { AdminDisputesView } from "@/features/super-admin/disputes";

export default async function SuperAdminDisputesPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminDisputesView lang={lang} namespace="super-admin" />;
}
