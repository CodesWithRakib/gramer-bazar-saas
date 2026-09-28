import { CustomerSettingsView } from '@/features/customer/settings';

export default async function CustomerSettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <CustomerSettingsView lang={lang} />;
}
