import { BroadcastHubView } from '@/features/super-admin/broadcast';

export default async function BroadcastHubPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <BroadcastHubView lang={lang} />;
}
