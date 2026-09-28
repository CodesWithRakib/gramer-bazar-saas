import { SellerCouponsView } from '@/features/seller/coupons';

export default async function SellerCouponsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <SellerCouponsView lang={lang} />;
}
