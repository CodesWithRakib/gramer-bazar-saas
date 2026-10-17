import { Metadata } from 'next';
import { SmallholderTeaGrowerHubView } from '@/features/tea-estate';

export const metadata: Metadata = {
  title: 'ক্ষুদ্র চা চাষি ও কারখানা কন্ট্রোল সেন্টার | Gramer Bazar',
  description:
    'দুটি পাতা একটি কুঁড়ি কাঁচা পাতা ডেলিভারি স্লিপ, পানি কর্তন হিসাব এবং চা কারখানা ব্যাচ টেলিমেট্রি।',
};

export default async function SellerTeaEstateHubPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <SmallholderTeaGrowerHubView lang={lang} />;
}
