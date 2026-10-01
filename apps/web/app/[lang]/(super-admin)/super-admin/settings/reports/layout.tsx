import { Metadata } from 'next';
import { AnalyticsReportsLayout } from '@/features/super-admin/settings';

export const metadata: Metadata = {
  title: 'Analytics & Reports | Gramer Bazar',
};

export default async function ReportsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <AnalyticsReportsLayout lang={lang} namespace="super-admin">
      {children}
    </AnalyticsReportsLayout>
  );
}
