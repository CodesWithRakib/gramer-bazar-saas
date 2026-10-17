import { FarmerMachineryBookingsView } from '@/features/machinery';

export default async function CustomerMachineryBookingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <FarmerMachineryBookingsView lang={lang} />;
}
