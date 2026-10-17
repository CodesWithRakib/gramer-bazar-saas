import { Metadata } from 'next';
import { AdminMushroomLabTraceabilityHubView } from '@/features/mushroom-farming';

export const metadata: Metadata = {
  title: 'জাতীয় মাশরুম স্পন ও প্রসেসিং সুপারভিশন | Super Admin | Gramer Bazar',
  description:
    'সারাদেশের মাশরুম ল্যাবরেটরি, ফ্রুটিং চেম্বার নেটওয়ার্ক ও ড্রাই মাশরুম ফুড কোয়ালিটি সুপারভিশন হাব।',
};

export default async function SuperAdminMushroomFarmingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminMushroomLabTraceabilityHubView lang={lang} />;
}
