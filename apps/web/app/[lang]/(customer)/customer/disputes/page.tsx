import { CustomerDisputesView } from '@/features/customer/disputes';

export default async function CustomerDisputesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <CustomerDisputesView lang={lang} />;
}
