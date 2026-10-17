import { Metadata } from 'next';
import { AdminTeaBoardAuctionHubView } from '@/features/tea-estate';

export const metadata: Metadata = {
  title: 'চা বোর্ড ও নিলাম গভর্ন্যান্স ডেস্ক | Gramer Bazar',
  description:
    'জাতীয় চা নিলাম লট অনুমোদন, ব্রোকার বিডিং তদারকি ও ক্ষুদ্র চা চাষি মূল্য রক্ষা অডিট।',
};

export default async function AdminTeaBoardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminTeaBoardAuctionHubView lang={lang} />;
}
