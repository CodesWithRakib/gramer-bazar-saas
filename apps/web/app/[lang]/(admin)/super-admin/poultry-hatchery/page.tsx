import { Metadata } from 'next';
import { AdminPoultryBiosecurityHubView } from '@/features/poultry-hatchery';

export const metadata: Metadata = {
  title: 'জাতীয় পোল্ট্রি ও হ্যাচারি বায়োসিকিউরিটি সুপারভিশন | Super Admin | Gramer Bazar',
  description:
    'সারাদেশের হ্যাচারি ফ্লক, ব্রুডার সেন্সর নেটওয়ার্ক ও বাণিজ্যিক ডিমের গ্রেডিং ও নিরাপত্তা অডিট কন্ট্রোল।',
};

export default async function SuperAdminPoultryHatcheryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminPoultryBiosecurityHubView lang={lang} />;
}
