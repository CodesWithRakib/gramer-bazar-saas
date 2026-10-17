import { MachineryBookingView } from '@/features/machinery';

export default async function MachineryBookPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  return <MachineryBookingView id={id} lang={lang} />;
}
