import { Metadata } from 'next';
import { AdminJuteBoardTraceabilityHubView } from '@/features/jute-biotech';

export const metadata: Metadata = {
  title: 'সুপার অ্যাডমিন পাট ও পরিবেশবান্ধব প্যাকেজিং গভর্নেন্স | Gramer Bazar',
  description:
    'জাতীয় পাট মোড়কীকরণ আইন ২০১০ গভর্নেন্স, মিল এসক্রো ট্র্যাকিং ও বিজেআরআই বায়োটেক অডিট।',
};

export default async function SuperAdminJuteBoardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminJuteBoardTraceabilityHubView lang={lang} />;
}
