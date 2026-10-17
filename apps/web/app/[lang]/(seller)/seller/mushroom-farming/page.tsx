import { Metadata } from 'next';
import { MushroomGrowerChamberHubView } from '@/features/mushroom-farming';

export const metadata: Metadata = {
  title: 'মাশরুম খামার, স্পন ল্যাব ও ফ্রুটিং চেম্বার কন্ট্রোল | Seller | Gramer Bazar',
  description:
    'স্পন ব্যাচ উৎপাদন, ফ্রুটিং চেম্বারের CO₂ ও আর্দ্রতা সেন্সর সিংক এবং ড্রাই মাশরুম প্রসেসিং ইনভেন্টরি।',
};

export default async function SellerMushroomFarmingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <MushroomGrowerChamberHubView lang={lang} />;
}
