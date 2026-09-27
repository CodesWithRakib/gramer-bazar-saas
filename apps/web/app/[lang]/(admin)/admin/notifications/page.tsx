import { NotificationCenterView } from '@/features/notifications/components/NotificationCenterView';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function AdminNotificationsPage({ params }: PageProps) {
  const { lang } = await params;
  return <NotificationCenterView lang={lang} />;
}
