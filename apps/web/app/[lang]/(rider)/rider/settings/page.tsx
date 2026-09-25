import { RiderSettingsView } from "@/features/rider/settings";

export default async function RiderSettingsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <RiderSettingsView lang={lang} />;
}
