import { SellerSettingsView } from "@/features/seller/settings";

export default async function SellerSettingsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <SellerSettingsView lang={lang} />;
}
