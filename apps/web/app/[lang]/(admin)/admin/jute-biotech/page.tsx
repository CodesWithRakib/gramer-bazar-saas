import { Metadata } from 'next';
import { AdminJuteBoardTraceabilityHubView } from '@/features/jute-biotech';

export const metadata: Metadata = {
  title: 'পাট অধিদপ্তর ও বিজেআরআই অডিট হাব | Gramer Bazar',
  description:
    'পণ্যে পাটজাত মোড়কের বাধ্যতামূলক ব্যবহার আইন ২০১০ বাস্তবায়ন ও হাই-ময়েশ্চার ঝুঁকি অডিট রেজিস্টার।',
};

export default async function AdminJuteBoardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminJuteBoardTraceabilityHubView lang={lang} />;
}
