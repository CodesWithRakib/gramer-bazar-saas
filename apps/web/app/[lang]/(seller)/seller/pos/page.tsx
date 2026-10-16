import { AgentPosView } from '@/features/agent';

export default async function SellerPosPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AgentPosView lang={lang} />;
}
