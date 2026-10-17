import { Metadata } from 'next';
import { ArtisanLoomManagementView } from '@/features/sericulture-handloom';

export const metadata: Metadata = {
  title: 'তাঁতশিল্পী ও রেশম চাষী ড্যাশবোর্ড | Gramer Bazar',
  description: 'তাঁতের সক্রিয় কাস্টম অর্ডার অগ্রগতি, টানা-পোড়েন ট্র্যাকিং, নতুন হস্তশিল্প তালিকাভুক্তকরণ ও রেশম গুটি লট।',
};

export default async function SellerSericultureHandloomPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await params;
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <ArtisanLoomManagementView />
    </div>
  );
}
