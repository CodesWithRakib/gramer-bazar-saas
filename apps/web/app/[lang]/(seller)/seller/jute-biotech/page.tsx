import { Metadata } from 'next';
import { JuteFarmerRettingHubView } from '@/features/jute-biotech';

export const metadata: Metadata = {
  title: 'পাট চাষি পচন ও বেলিং প্রেস কন্ট্রোল সেন্টার | Gramer Bazar',
  description:
    'বিজেআরআই রিবন রেটিং অগ্রগতি লগ, পানির তাপমাত্রা ও ডিও মনিটরিং এবং ডিজিটাল ওয়েইব্রিজ এসক্রো এন্ট্রি।',
};

export default async function SellerJuteRettingHubPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <JuteFarmerRettingHubView lang={lang} />;
}
