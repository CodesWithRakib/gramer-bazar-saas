import { Metadata } from 'next';
import { AdminAgroTourismHubView } from '@/features/agro-tourism';

export const metadata: Metadata = {
  title: 'গ্রামীণ কৃষি পর্যটন ও এসক্রো নিষ্পত্তি নিয়ন্ত্রণ কেন্দ্র | Admin | Gramer Bazar',
  description: 'দেশব্যাপী খামার কটেজ বুকিং নিরীক্ষণ, নিরাপত্তা ও ইউনিয়ন পরিষদ সনদ অডিট এবং হোস্ট এসক্রো নিষ্পত্তি।',
};

export default async function AdminAgroTourismPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await params;
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <AdminAgroTourismHubView />
    </div>
  );
}
