import { Metadata } from 'next';
import { AdminHeritageCraftHubView } from '@/features/sericulture-handloom';

export const metadata: Metadata = {
  title: 'রেশম ও তাঁত বোর্ড নিয়ন্ত্রণ কেন্দ্র | Admin | Gramer Bazar',
  description: 'তাঁতি এসক্রো জামানত নিষ্পত্তি, জিআই প্রত্যয়ন নিরীক্ষা এবং দেশব্যাপী রেশম গুটি উৎপাদন মনিটরিং।',
};

export default async function AdminSericultureHandloomPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await params;
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <AdminHeritageCraftHubView />
    </div>
  );
}
