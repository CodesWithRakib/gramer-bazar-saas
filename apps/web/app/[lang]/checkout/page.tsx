import { CheckoutClient } from '@/components/checkout/CheckoutClient';
import { Locale } from '@/config/i18n';

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <CheckoutClient lang={lang as Locale} />;
}
