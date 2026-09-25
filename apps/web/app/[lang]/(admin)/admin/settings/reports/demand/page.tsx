import { DemandAnalyticsView } from "@/features/admin/settings";

export default async function DemandReportsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <DemandAnalyticsView lang={lang} namespace="admin" />;
}
