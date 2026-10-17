import { MachineryMarketplaceView } from '@/features/machinery';

export default async function MachineryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <MachineryMarketplaceView lang={lang} />;
}
