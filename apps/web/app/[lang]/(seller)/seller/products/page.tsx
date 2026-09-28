import { SellerProductsView } from '@/features/seller/products';

export default async function SellerProductsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <SellerProductsView lang={lang} />;
}
