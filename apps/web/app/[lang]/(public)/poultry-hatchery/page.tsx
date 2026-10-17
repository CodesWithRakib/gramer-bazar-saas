import { Metadata } from 'next';
import { PoultryHatcheryMarketplaceView } from '@/features/poultry-hatchery';

export const metadata: Metadata = {
  title: 'পোল্ট্রি খামার, সোনালী/লেয়ার হ্যাচারি, ডিমের গ্রেডিং ও ব্রুডার আইওটি | Gramer Bazar',
  description:
    'ডিএলএস প্রত্যয়িত ডে-ওল্ড-চিক (DOC), আধুনিক ব্রুডার শেড অ্যামোনিয়া ও তাপমাত্রা সেন্সর মনিটরিং এবং ওজন-ভিত্তিক টেবিল ডিম ডিজিটাল সর্টিং প্ল্যাটফর্ম।',
};

export default async function PoultryHatcheryPublicPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <PoultryHatcheryMarketplaceView lang={lang} />;
}
