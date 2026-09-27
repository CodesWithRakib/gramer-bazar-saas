import { NotificationCenterView } from '@/features/notifications/components/NotificationCenterView';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function SuperAdminNotificationsPage({ params }: PageProps) {
  const { lang } = await params;
  return <NotificationCenterView lang={lang} />;
}
