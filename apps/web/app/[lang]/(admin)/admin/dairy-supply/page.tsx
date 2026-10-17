import { Metadata } from 'next';
import { AdminDairyChillingHubView } from '@/features/dairy-supply';

export const metadata: Metadata = {
  title: 'দুগ্ধ সমবায় কোল্ড-চেইন ও আইওটি নিয়ন্ত্রণ কেন্দ্র | Admin | Gramer Bazar',
  description:
    'সারাদেশের বাল্ক মিল্ক কুলার আইওটি টেলিমেট্রি, ৪°C কোল্ড-চেইন অ্যালার্ম, খামারিদের ওয়ালেট পে-আউট ও পশুখাদ্য পুল ম্যানেজমেন্ট।',
};

export default async function AdminDairySupplyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminDairyChillingHubView lang={lang} />;
}
