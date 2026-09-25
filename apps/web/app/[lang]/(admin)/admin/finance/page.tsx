import { FinanceHubView } from "@/features/admin/finance";

export default async function FinancePage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <FinanceHubView lang={lang} namespace="admin" />;
}
