import { AgriPrecisionHubView } from '@/features/agri-precision';

export default async function AgriPrecisionPublicPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AgriPrecisionHubView lang={lang} />;
}
