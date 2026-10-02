import { BroadcastTemplatesView } from '@/features/super-admin/broadcast';

export default async function BroadcastTemplatesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <BroadcastTemplatesView lang={lang} />;
}
