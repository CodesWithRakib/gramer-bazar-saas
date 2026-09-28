import { CustomerProfileView } from '@/features/customer/profile';

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <CustomerProfileView lang={lang} />;
}
