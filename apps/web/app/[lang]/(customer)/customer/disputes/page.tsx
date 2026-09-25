import { CustomerDisputesView } from "@/features/customer/disputes";

export default async function CustomerDisputesPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <CustomerDisputesView lang={lang} />;
}
