import { SellerMicroLoansView } from '@/features/agri-fintech';

export default async function SellerMicroLoansPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <SellerMicroLoansView lang={lang} />;
}
