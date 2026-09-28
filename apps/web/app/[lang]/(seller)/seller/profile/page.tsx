import { SellerProfileView } from '@/features/seller/profile';

export default async function SellerProfilePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <SellerProfileView lang={lang} />;
}
