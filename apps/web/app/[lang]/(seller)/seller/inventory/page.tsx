import { SellerInventoryView } from '@/features/seller/products';

export default async function SellerInventoryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <SellerInventoryView lang={lang} />;
}
