import { SellerPayoutView } from '@/features/seller/wallet';

export default async function SellerPayoutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <SellerPayoutView lang={lang} />;
}
