import { RiderMessagesView } from '@/features/rider/messages';

export default async function RiderMessagesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <RiderMessagesView lang={lang} />;
}
