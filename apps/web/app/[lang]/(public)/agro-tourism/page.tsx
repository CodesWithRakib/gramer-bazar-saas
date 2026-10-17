import { Metadata } from 'next';
import { AgroTourismHubView } from '@/features/agro-tourism';

export const metadata: Metadata = {
  title: 'গ্রামীণ কৃষি পর্যটন, ফার্ম স্টে ও ইকোট্যুরিজম | Gramer Bazar',
  description: 'ঐতিহ্যবাহী মাটির ঘর, চা বাগান কটেজ ও লিচু বাগান ক্যাম্পিং। ১০০% খাঁটি গ্রামীণ খাবার ও নিরাপদ এসক্রো বুকিং।',
};

export default async function AgroTourismPublicPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await params;
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <AgroTourismHubView />
    </div>
  );
}
