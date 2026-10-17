import { Metadata } from 'next';
import { LivestockMarketplaceView } from '@/features/livestock';

export const metadata: Metadata = {
  title: 'ডিজিটাল পশুর হাট ও ডিএলএস স্বাস্থ্য পাসপোর্ট | Gramer Bazar',
  description: 'মধ্যস্বত্বভোগী ও হাসিলমুক্ত নিরাপদ ডিজিটাল গবাদি পশুর হাট, সরকারি ডিএলএস কানট্যাগ স্বাস্থ্য পাসপোর্ট, লাইভ ওজন ও কৃত্রিম প্রজনন সেবা।',
};

export default async function LivestockPublicPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await params;
  return <LivestockMarketplaceView />;
}
