import { Metadata } from 'next';
import { HoneyApiaryMarketplaceView } from '@/features/honey-apiary';

export const metadata: Metadata = {
  title: 'মধু ল্যাব সনদ ও বিশুদ্ধতা নিরীক্ষা | Customer | Gramer Bazar',
  description:
    'C4 সুগার আইসোটোপ ও আর্দ্রতা অনুপাত যাচাই, বিএসটিআই মানদণ্ড এবং সরাসরি সুন্দরবনের খলিশা মধু অর্ডার পোর্টফোলিও।',
};

export default async function CustomerHoneyApiaryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <HoneyApiaryMarketplaceView lang={lang} />;
}
