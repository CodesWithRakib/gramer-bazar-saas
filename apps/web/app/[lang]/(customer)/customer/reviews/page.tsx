import { CustomerReviewsView } from '@/features/customer/reviews';

export default async function CustomerReviewsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <CustomerReviewsView lang={lang} />;
}
