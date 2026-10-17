import { Metadata } from 'next';
import { MushroomMarketplaceView } from '@/features/mushroom-farming';

export const metadata: Metadata = {
  title: 'মাশরুম স্পন প্যাকেট ও ড্রাই গুরমেট মাশরুম অর্ডার | Customer | Gramer Bazar',
  description:
    'এনএমডিআই অনুমোদিত তাজা ওয়েস্টার মাশরুম, ঔষধি রেইশি গ্যানোডার্মা পাউডার এবং রান্নার জন্য প্রস্তুত ড্রাই মাশরুম স্লাইস।',
};

export default async function CustomerMushroomFarmingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <MushroomMarketplaceView lang={lang} />;
}
