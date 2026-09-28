import { CustomerOrdersView } from '@/features/customer/orders';

export default async function CustomerOrdersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <CustomerOrdersView lang={lang} />;
}
