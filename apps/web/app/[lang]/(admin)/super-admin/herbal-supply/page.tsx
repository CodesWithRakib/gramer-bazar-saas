import { Metadata } from 'next';
import { AdminPharmaRegulatoryHubView } from '@/features/herbal-supply';

export const metadata: Metadata = {
  title: 'ভেষজ ও ঔষধি গাছ ডিজিডিএ মান নিয়ন্ত্রণ ও প্রাতিষ্ঠানিক চুক্তি হাব | Super Admin | Gramer Bazar',
  description: 'জিএসিপি গ্রেড অনুমোদন, হ্যালোজেন আর্দ্রতা মিটার অডিট, এফলাটক্সিন পরীক্ষা এবং আয়ুর্বেদিক ফার্মা এসক্রো চুক্তি ব্যবস্থাপনা।',
};

export default async function SuperAdminHerbalSupplyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await params;
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <AdminPharmaRegulatoryHubView />
    </div>
  );
}
