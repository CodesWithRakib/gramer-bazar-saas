import { RiderDashboardView } from "@/features/rider/dashboard";

export default async function RiderDashboardPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <RiderDashboardView lang={lang} />;
}
