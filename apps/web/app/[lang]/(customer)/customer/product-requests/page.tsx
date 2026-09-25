import { CustomerProductRequestsView } from "@/features/customer/product-requests";

export default async function CustomerProductRequestsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <CustomerProductRequestsView lang={lang} />;
}
