import { CustomerMessagesView } from '@/features/customer/messages';

export default async function CustomerMessagesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <CustomerMessagesView lang={lang} />;
}
