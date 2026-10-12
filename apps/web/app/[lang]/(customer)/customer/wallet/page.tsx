import { CustomerWalletView } from '@/features/customer/wallet/components/CustomerWalletView';

export default async function CustomerWalletPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <CustomerWalletView lang={lang} />;
}
