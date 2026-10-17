import { Metadata } from 'next';
import { AdminPoultryBiosecurityHubView } from '@/features/poultry-hatchery';

export const metadata: Metadata = {
  title: 'পোল্ট্রি বায়োসিকিউরিটি, হ্যাচারি টিকা ও ব্রুডার অ্যামোনিয়া অডিট | Admin | Gramer Bazar',
  description:
    'ডিএলএস ভেটেরিনারি সার্জন প্রত্যয়ন, হ্যাচারি টিকা সনদপত্র মনিটরিং এবং ব্রুডার শেড বিষাক্ত অ্যামোনিয়া গ্যাস নজরদারি প্ল্যাটফর্ম।',
};

export default async function AdminPoultryHatcheryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminPoultryBiosecurityHubView lang={lang} />;
}
