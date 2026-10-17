import { Metadata } from 'next';
import { JuteMarketplaceView } from '@/features/jute-biotech';

export const metadata: Metadata = {
  title: 'সোনালী আঁশ লট ও পাটজাত মোড়ক অর্ডার | Gramer Bazar',
  description:
    'খাদ্যশস্য ৫০ কেজি বি.টুইল বস্তা, হেসিয়ান ব্যাগ ও বিজেআরআই গ্রেডেড সোনালী আঁশ লট সংগ্রহ।',
};

export default async function CustomerJutePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <JuteMarketplaceView lang={lang} />;
}
