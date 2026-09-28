import { CustomerDisputeDetailsView } from '@/features/customer/disputes';

export default async function CustomerDisputeDetailsPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  return <CustomerDisputeDetailsView lang={lang} id={id} />;
}
