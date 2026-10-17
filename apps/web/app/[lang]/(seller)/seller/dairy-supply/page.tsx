import { Metadata } from 'next';
import { AdminDairyChillingHubView } from '@/features/dairy-supply';

export const metadata: Metadata = {
  title: 'সমবায় দুধ সংগ্রহ ডেস্ক ও বাল্ক মিল্ক কুলার হাব | Seller | Gramer Bazar',
  description:
    'দুধ চালান ভাউচার এন্ট্রি, ফ্যাট-এসএনএফ মূল্যায়ন, বাল্ক মিল্ক কুলার তাপমাত্রা আইওটি পর্যবেক্ষণ এবং পশুখাদ্য পুল পরিচালনা।',
};

export default async function SellerDairySupplyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminDairyChillingHubView lang={lang} />;
}
