import { PilotDroneFleetView } from '@/features/agri-precision';

export default async function SellerDroneFleetPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <PilotDroneFleetView lang={lang} />;
}
