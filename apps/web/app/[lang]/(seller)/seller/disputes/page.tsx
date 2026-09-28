import { SellerDisputesView } from '@/features/seller/disputes';

export default async function SellerDisputesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <SellerDisputesView lang={lang} />;
}
