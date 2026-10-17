import { Metadata } from 'next';
import { AdminLivestockRegulatoryHubView } from '@/features/livestock';

export const metadata: Metadata = {
  title: 'প্রাণিসম্পদ অধিদপ্তর ও ডিজিটাল হাট নিয়ন্ত্রণ কেন্দ্র | Admin | Gramer Bazar',
  description: 'পশু স্বাস্থ্য পরীক্ষা, ডিএলএস স্বাস্থ্য সনদ প্রদান, টিকাদান রেজিস্ট্রি, পরিবহন মনিটরিং ও এসক্রো নিষ্পত্তি ব্যবস্থা।',
};

export default async function AdminLivestockPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await params;
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <AdminLivestockRegulatoryHubView />
    </div>
  );
}
