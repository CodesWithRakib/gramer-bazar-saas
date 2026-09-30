import { SellerReviewsView } from '@/features/seller/reviews';

export default async function SellerReviewsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <SellerReviewsView lang={lang} />;
}
