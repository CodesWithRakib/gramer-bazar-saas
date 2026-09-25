import { CustomerDashboardView } from "@/features/customer/dashboard";

export default async function CustomerDashboardPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <CustomerDashboardView lang={lang} />;
}
