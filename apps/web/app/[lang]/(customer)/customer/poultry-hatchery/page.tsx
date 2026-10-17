import { Metadata } from 'next';
import { PoultryHatcheryMarketplaceView } from '@/features/poultry-hatchery';

export const metadata: Metadata = {
  title: 'বায়োসিকিউর পোল্ট্রি বাচ্চা ও গ্রেডেড টেবিল ডিম অর্ডার | Customer | Gramer Bazar',
  description:
    'মারেক্স ও রানীক্ষেত টিকা সনদযুক্ত সোনালী ও ব্রয়লার ডে-ওল্ড-চিক (DOC) এবং ইউভি-সি স্যানিটাইজড গ্রেড-এএ টেবিল ডিম সরাসরি হ্যাচারি থেকে বুকিং।',
};

export default async function CustomerPoultryHatcheryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <PoultryHatcheryMarketplaceView lang={lang} />;
}
