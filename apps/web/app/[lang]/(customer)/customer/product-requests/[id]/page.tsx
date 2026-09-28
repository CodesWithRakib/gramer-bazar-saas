import { CustomerProductRequestDetailsView } from '@/features/customer/product-requests';

export default async function CustomerProductRequestDetailsPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  return <CustomerProductRequestDetailsView lang={lang} id={id} />;
}
