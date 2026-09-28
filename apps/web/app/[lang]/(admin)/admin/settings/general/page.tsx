import { GeneralSettingsView } from '@/features/admin/settings';

export default async function GeneralSettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <GeneralSettingsView lang={lang} namespace="admin" />;
}
