import { SellerProductForm } from '@/features/seller/products';

export default async function SellerProductEditPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  return <SellerProductForm lang={lang} listingId={id} />;
}
