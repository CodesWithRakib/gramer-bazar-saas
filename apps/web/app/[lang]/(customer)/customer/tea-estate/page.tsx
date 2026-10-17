import { Metadata } from 'next';
import { TeaEstateMarketplaceView } from '@/features/tea-estate';

export const metadata: Metadata = {
  title: 'প্রিমিয়াম অর্থোডক্স, গ্রিন টি ও অকশন লট অর্ডার | Gramer Bazar',
  description:
    'শ্রীমঙ্গল ও পঞ্চগড়ের স্পেশালিটি অর্থোডক্স, সিলভার নিডল ও নিলাম সার্টিফাইড তৈরি চা সংগ্রহ।',
};

export default async function CustomerTeaEstatePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <TeaEstateMarketplaceView lang={lang} />;
}
