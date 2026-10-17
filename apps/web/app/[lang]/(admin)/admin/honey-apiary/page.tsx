import { Metadata } from 'next';
import { AdminApiaryTraceabilityHubView } from '@/features/honey-apiary';

export const metadata: Metadata = {
  title: 'মৌচাষ, বন পারমিট ও বিএসটিআই ল্যাব অডিট | Admin | Gramer Bazar',
  description:
    'সুন্দরবনের বুনো মৌয়াল পারমিট ট্র্যাকিং, C4 সুগার ভেজাল স্ক্রিনিং এবং তাজা রয়্যাল জেলি -১৮°C কোল্ড-চেইন প্রশাসন।',
};

export default async function AdminHoneyApiaryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminApiaryTraceabilityHubView lang={lang} />;
}
