import { CustomerNotificationsView } from '@/features/customer/notifications';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function CustomerNotificationsPage({ params }: PageProps) {
  const { lang } = await params;
  return <CustomerNotificationsView lang={lang} />;
}
