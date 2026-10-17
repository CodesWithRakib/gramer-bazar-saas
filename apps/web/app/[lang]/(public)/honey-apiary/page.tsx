import { Metadata } from 'next';
import { HoneyApiaryMarketplaceView } from '@/features/honey-apiary';

export const metadata: Metadata = {
  title: 'মৌচাষ, সুন্দরবনের প্রাকৃতিক মধু ও রয়্যাল জেলি খাঁটি মান নিয়ন্ত্রণ প্ল্যাটফর্ম | Gramer Bazar',
  description:
    'সুন্দরবনের ঐতিহ্যবাহী মৌয়ালদের বুনো চাক ও আধুনিক ভ্রাম্যমাণ মৌ-খামারের খাঁটি মধু। C4 আইসোটোপ ও আর্দ্রতা টেস্ট সনদসহ তাজা রয়্যাল জেলি।',
};

export default async function HoneyApiaryPublicPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <HoneyApiaryMarketplaceView lang={lang} />;
}
