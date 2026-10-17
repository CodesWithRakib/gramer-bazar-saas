import { Metadata } from 'next';
import { FarmerLivestockManagementView } from '@/features/livestock';

export const metadata: Metadata = {
  title: 'আমার খামারের গবাদি পশু ও হাট ব্যবস্থাপনা | Gramer Bazar',
  description: 'খামারের পশু নিবন্ধন, সরকারি কানট্যাগ, স্বাস্থ্য পাসপোর্ট সনদ এবং কৃত্রিম প্রজনন বুকিং।',
};

export default async function SellerLivestockPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await params;
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <FarmerLivestockManagementView />
    </div>
  );
}
