import { GeneralSettingsView } from '@/features/super-admin/settings';

export default async function SuperAdminGeneralSettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <GeneralSettingsView lang={lang} namespace="super-admin" />;
}
