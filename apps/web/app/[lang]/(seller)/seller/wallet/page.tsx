import { SellerWalletView } from '@/features/seller/wallet';

export default async function SellerWalletPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <SellerWalletView lang={lang} />;
}
