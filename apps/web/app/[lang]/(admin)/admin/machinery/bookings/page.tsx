import { AdminMachineryView } from '@/features/machinery';

export default async function AdminMachineryBookingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminMachineryView lang={lang} />;
}
