import { Metadata } from 'next';
import { AIBreedingServiceView } from '@/features/livestock';

export const metadata: Metadata = {
  title: 'কৃত্রিম প্রজনন (AI) ও বিশুদ্ধ জাতের সিমেন সেবা | Gramer Bazar',
  description: 'দোরগোড়ায় উন্নত জাতের কৃত্রিম প্রজনন সেবা, সাভার গবেষণাগার ও ব্র্যাক সিমেন স্ট্র, সকাল-সন্ধ্যা এআই টাইমিং ক্যালকুলেটর।',
};

export default async function AIBreedingPublicPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await params;
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <AIBreedingServiceView />
      </div>
    </div>
  );
}
