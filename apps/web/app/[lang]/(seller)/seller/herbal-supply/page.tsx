import { Metadata } from 'next';
import { GrowerCooperativeManagementView } from '@/features/herbal-supply';

export const metadata: Metadata = {
  title: 'ভেষজ চাষী ও সমবায় ব্যাচ ব্যবস্থাপনা | Gramer Bazar',
  description: 'ঔষধি গ্রাম সমবায় ব্যাচ তালিকাভুক্তকরণ, হ্যালোজেন আর্দ্রতা মিটার অডিট ও প্রাতিষ্ঠানিক চুক্তি সরবরাহ ট্র্যাকিং।',
};

export default async function SellerHerbalSupplyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await params;
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <GrowerCooperativeManagementView />
    </div>
  );
}
