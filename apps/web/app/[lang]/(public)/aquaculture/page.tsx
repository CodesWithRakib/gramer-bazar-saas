import { Metadata } from 'next';
import { AquacultureHubView } from '@/features/aquaculture';

export const metadata: Metadata = {
  title: 'ডিজিটাল মৎস্য খামার, গলদা ও বাগদা হ্যাচারি ও বায়োফ্লক আইওটি | Gramer Bazar',
  description: 'এসপিএফ বাগদা ও গলদা চিংড়ির পোনা মার্কেটপ্লেস, ডিওএফ পিসিআর সনদ, আইওটি পুকুর ও বায়োফ্লক পানির গুণমান ট্র্যাকিং ও অক্সিজেন ট্যাঙ্কার লাইভ মাছ পরিবহন।',
};

export default async function AquaculturePublicPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await params;
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <AquacultureHubView />
    </div>
  );
}
