import { Metadata } from 'next';
import { AdminAquacultureRegulatoryHubView } from '@/features/aquaculture';

export const metadata: Metadata = {
  title: 'মৎস্য অধিদপ্তর ও অ্যাকুয়াকালচার নিয়ন্ত্রণ কেন্দ্র | Admin | Gramer Bazar',
  description: 'হ্যাচারি পিসিআর রোগমুক্ত সনদ যাচাই, দেশব্যাপী পুকুর আইওটি হাইপোক্সিয়া ও অ্যামোনিয়া মনিটরিং এবং লাইভ মাছ পরিবহন ডিসপ্যাচ।',
};

export default async function AdminAquaculturePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await params;
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <AdminAquacultureRegulatoryHubView />
    </div>
  );
}
