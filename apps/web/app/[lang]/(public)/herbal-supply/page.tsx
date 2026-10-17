import { Metadata } from 'next';
import { HerbalMarketplaceHubView } from '@/features/herbal-supply';

export const metadata: Metadata = {
  title: 'ভেষজ ও ঔষধি গাছ হাব, আয়ুর্বেদিক ফার্মাকোপিয়া ও ভেষজ সাপ্লাই চেইন | Gramer Bazar',
  description: 'নাটোর ও পাহাড়ি অঞ্চলের কৃষক সমবায়ের খাঁটি কালমেঘ, অশ্বগন্ধা, তুলসী, বাসক ও ঘৃতকুমারী। DGDA ল্যাব আর্দ্রতা সনদ ও প্রাতিষ্ঠানিক চুক্তি সরবরাহ।',
};

export default async function HerbalSupplyPublicPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await params;
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <HerbalMarketplaceHubView />
    </div>
  );
}
