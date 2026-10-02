import { ProductsHubView } from '@/features/admin/products';

export default async function ProductsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <ProductsHubView lang={lang} namespace="admin" />;
}
