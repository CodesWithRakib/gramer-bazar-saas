import { SellerMessagesView } from '@/features/seller/messages';

export default async function SellerMessagesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <SellerMessagesView lang={lang} />;
}
