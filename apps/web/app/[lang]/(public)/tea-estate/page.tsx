import { Metadata } from 'next';
import { TeaEstateMarketplaceView } from '@/features/tea-estate';

export const metadata: Metadata = {
  title: 'চা বাগান নিলাম, স্পেশালিটি অর্থোডক্স ও ক্ষুদ্র চা চাষি প্ল্যাটফর্ম | Gramer Bazar',
  description:
    'বাংলাদেশ চা বোর্ড ও শ্রীমঙ্গল/চট্টগ্রাম নিলাম সমন্বিত লাইভ বিডিং, পঞ্চগড় ক্ষুদ্র চাষি "দুটি পাতা একটি কুঁড়ি" ইন্টেক এবং অর্থোডক্স গ্রিন টি ক্যাটালগ।',
};

export default async function TeaEstatePublicPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <TeaEstateMarketplaceView lang={lang} />;
}
