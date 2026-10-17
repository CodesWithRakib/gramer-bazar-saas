import { Metadata } from 'next';
import { FarmerDairyPassbookView } from '@/features/dairy-supply';

export const metadata: Metadata = {
  title: 'খামারি দুগ্ধ সরবরাহ পাসবুক ও ওয়ালেট পে-আউট | Customer | Gramer Bazar',
  description:
    'দৈনিক দুধ সরবরাহ খতিয়ান, ল্যাকটোমিটার (CLR) ও ফ্যাট-এসএনএফ পরীক্ষা রিপোর্ট এবং সরাসরি বিকাশ/নগদ ওয়ালেট পেমেন্ট।',
};

export default async function CustomerDairySupplyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <FarmerDairyPassbookView lang={lang} />;
}
