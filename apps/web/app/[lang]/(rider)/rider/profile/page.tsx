import { RiderProfileView } from '@/features/rider/profile';

export default async function RiderProfilePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <RiderProfileView lang={lang} />;
}
