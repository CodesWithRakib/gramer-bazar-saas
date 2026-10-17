import { Metadata } from 'next';
import { HostFarmManagementView } from '@/features/agro-tourism';

export const metadata: Metadata = {
  title: 'খামার কটেজ ও গ্রামীণ হোস্ট ব্যবস্থাপনা | Gramer Bazar',
  description: 'মাটির ঘর ও খামার কটেজ তালিকাভুক্তকরণ, ফ্রুট পিকিং কর্মশালা তৈরি এবং অতিথি চেক-ইন পিন ভেরিফিকেশন।',
};

export default async function SellerAgroTourismPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await params;
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <HostFarmManagementView />
    </div>
  );
}
