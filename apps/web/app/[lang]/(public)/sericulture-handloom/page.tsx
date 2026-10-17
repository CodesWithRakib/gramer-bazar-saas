import { Metadata } from 'next';
import { SericultureMarketplaceHubView } from '@/features/sericulture-handloom';

export const metadata: Metadata = {
  title: 'রেশম চাষ, খাঁটি সিল্ক, ঢাকাই জামদানি ও গ্রামীণ তাঁতশিল্প হাব | Gramer Bazar',
  description: 'সরাসরি তাঁতি সমবায় থেকে জিআই প্রত্যয়িত ঢাকাই জামদানি, সোপুরা মালবেরি সিল্ক ও কোমর তাঁত। ১০০% খাঁটি সিল্ক বার্ন টেস্ট সনদ ও নিরাপদ এসক্রো বুনন।',
};

export default async function SericultureHandloomPublicPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await params;
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <SericultureMarketplaceHubView />
    </div>
  );
}
