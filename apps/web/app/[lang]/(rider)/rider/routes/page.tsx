import { RiderOptimizedRouteView } from '@/features/rider/routes/RiderOptimizedRouteView';

export default async function RiderOptimizedRoutePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <RiderOptimizedRouteView lang={lang} />;
}
