import { CustomerOrdersView } from "@/features/customer/orders";

export default async function CustomerOrdersPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <CustomerOrdersView lang={lang} />;
}
