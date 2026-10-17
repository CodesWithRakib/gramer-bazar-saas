import { Metadata } from 'next';
import { MushroomMarketplaceView } from '@/features/mushroom-farming';

export const metadata: Metadata = {
  title: 'মাশরুম চাষ, স্পন ল্যাব মান নিয়ন্ত্রণ ও ড্রাই মাশরুম প্ল্যাটফর্ম | Gramer Bazar',
  description:
    'জাতীয় মাশরুম উন্নয়ন ইনস্টিটিউট (NMDI) প্রত্যয়িত ওয়েস্টার ও রেইশি মাশরুম স্পন প্যাকেট, রিয়েল-টাইম ফ্রুটিং চেম্বার আইওটি এবং নাইট্রোজেন সিল ড্রাই মাশরুম সরবরাহ।',
};

export default async function MushroomFarmingPublicPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <MushroomMarketplaceView lang={lang} />;
}
