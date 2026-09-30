import { SellerProductForm } from '@/features/seller/products';

export default async function SellerProductNewPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <SellerProductForm lang={lang} />;
}
