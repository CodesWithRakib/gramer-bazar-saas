import { Metadata } from 'next';
import { JuteMarketplaceView } from '@/features/jute-biotech';

export const metadata: Metadata = {
  title: 'পাট পচন জৈব-প্রযুক্তি, সোনালী আঁশ মান গ্রেডিং ও পরিবেশবান্ধব প্যাকেজিং | Gramer Bazar',
  description:
    'বিজেআরআই ইনোকুল্যান্ট রিবন রেটিং, ১৪% আদর্শ আর্দ্রতায় স্বয়ংক্রিয় ওয়েইব্রিজ ওজন কর্তন ও পাট মোড়কীকরণ আইন ২০১০ শিল্প সরবরাহ প্ল্যাটফর্ম।',
};

export default async function JuteBiotechPublicPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <JuteMarketplaceView lang={lang} />;
}
