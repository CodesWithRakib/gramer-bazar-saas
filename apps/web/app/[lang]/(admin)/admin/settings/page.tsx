import { SettingsHubView } from "@/features/admin/settings";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <SettingsHubView lang={lang} namespace="admin" />;
}
