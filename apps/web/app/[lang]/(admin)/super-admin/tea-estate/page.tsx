import { Metadata } from 'next';
import { AdminTeaBoardAuctionHubView } from '@/features/tea-estate';

export const metadata: Metadata = {
  title: 'সুপার অ্যাডমিন চা অকশন ও শিল্প গভর্ন্যান্স | Gramer Bazar',
  description:
    'জাতীয় চা বোর্ড অকশন মার্কেটপ্লেস, ক্ষুদ্র চাষি সুরক্ষা ও রপ্তানি চুক্তি নিয়ন্ত্রণ।',
};

export default async function SuperAdminTeaBoardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminTeaBoardAuctionHubView lang={lang} />;
}
