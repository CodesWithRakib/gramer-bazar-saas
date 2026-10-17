import { Metadata } from 'next';
import { DairySupplyHubView } from '@/features/dairy-supply';

export const metadata: Metadata = {
  title: 'দুগ্ধ সমবায়, মিল্ক চিলিং সেন্টার আইওটি ও পশুখাদ্য সমবায় পুল | Gramer Bazar',
  description:
    'রিচমন্ডস ফর্মুলায় দুধের ফ্যাট ও এসএনএফ সঠিক মূল্যায়ন, বাল্ক মিল্ক কুলার (৪°C) তাপমাত্রা পর্যবেক্ষণ এবং পশুখাদ্যে ২৫-৩০% সাশ্রয়ী সমবায় পুল।',
};

export default async function DairySupplyPublicPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <DairySupplyHubView lang={lang} />;
}
