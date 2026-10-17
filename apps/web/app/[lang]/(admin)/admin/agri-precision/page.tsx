import { AdminAgriSecurityHubView } from '@/features/agri-precision';

export default async function AdminAgriPrecisionPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminAgriSecurityHubView lang={lang} />;
}
