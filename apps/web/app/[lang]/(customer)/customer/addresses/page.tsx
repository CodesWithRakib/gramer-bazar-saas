import { CustomerAddressesView } from "@/features/customer/addresses";

export default async function CustomerAddressesPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <CustomerAddressesView lang={lang} />;
}
