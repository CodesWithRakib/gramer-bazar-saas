import { Metadata } from 'next';
import { AdminMushroomLabTraceabilityHubView } from '@/features/mushroom-farming';

export const metadata: Metadata = {
  title: 'মাশরুম ল্যাব নির্বীজন, চেম্বার CO₂ ও আর্দ্রতা অডিট | Admin | Gramer Bazar',
  description:
    'এনএমডিআই স্পন মান নিয়ন্ত্রণ, অটোক্লেভ চাপ পরিদর্শন এবং ফ্রুটিং চেম্বারের CO₂ ও শুষ্কতা অ্যালার্ম নিয়ন্ত্রণ।',
};

export default async function AdminMushroomFarmingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminMushroomLabTraceabilityHubView lang={lang} />;
}
