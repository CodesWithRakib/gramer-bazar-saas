import { Metadata } from 'next';
import { PoultryFarmBrooderHubView } from '@/features/poultry-hatchery';

export const metadata: Metadata = {
  title: 'পোল্ট্রি খামার, হ্যাচারি ব্যাচ ও ব্রুডার আইওটি কন্ট্রোল | Seller | Gramer Bazar',
  description:
    'বাচ্চার ব্যাচ নিবন্ধন, ব্রুডার সেন্সর তাপমাত্রা-অ্যামোনিয়া সিংক এবং ওজন-ভিত্তিক টেবিল ডিম ডিজিটাল গ্রেডিং কন্ট্রোল।',
};

export default async function SellerPoultryHatcheryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <PoultryFarmBrooderHubView lang={lang} />;
}
