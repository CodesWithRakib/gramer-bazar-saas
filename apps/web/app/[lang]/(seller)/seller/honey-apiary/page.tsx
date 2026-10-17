import { Metadata } from 'next';
import { BeekeeperApiaryManagementView } from '@/features/honey-apiary';

export const metadata: Metadata = {
  title: 'মৌচাষী ও মৌয়াল কন্ট্রোল ড্যাশবোর্ড | Seller | Gramer Bazar',
  description:
    'ভ্রাম্যমাণ কাঠের মৌ-বাক্স বহর ব্যবস্থাপনা, রানীর স্বাস্থ্য স্থিতি এবং প্রাকৃতিক মধু চালান লট রেজিস্ট্রেশন।',
};

export default async function SellerHoneyApiaryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <BeekeeperApiaryManagementView lang={lang} />;
}
