import { AdminMessagesView } from '@/features/admin/messages';

export default async function AdminMessagesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <AdminMessagesView lang={lang} namespace="admin" />;
}
