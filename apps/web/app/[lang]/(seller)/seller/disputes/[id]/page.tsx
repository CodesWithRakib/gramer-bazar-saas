import { SellerDisputeDetailsView } from '@/features/seller/disputes';

export default async function SellerDisputeDetailsPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  return <SellerDisputeDetailsView lang={lang} id={id} />;
}
