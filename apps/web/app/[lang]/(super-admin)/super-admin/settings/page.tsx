import { SettingsHubView } from "@/features/super-admin/settings";

export default async function SuperAdminSettingsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <SettingsHubView lang={lang} namespace="super-admin" />;
}
