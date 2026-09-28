import { CustomerWishlistView } from '@/features/customer/wishlist';

export default async function CustomerWishlistPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <CustomerWishlistView lang={lang} />;
}
