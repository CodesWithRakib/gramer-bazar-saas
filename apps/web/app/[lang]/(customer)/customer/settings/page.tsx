import { CustomerSettingsView } from "@/features/customer/settings";

export default async function CustomerSettingsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <CustomerSettingsView lang={lang} />;
}
