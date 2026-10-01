import { Metadata } from 'next';
import { AnalyticsReportsLayout } from '@/features/super-admin/settings';

export const metadata: Metadata = {
  title: 'Analytics & Reports | Gramer Bazar',
};

export default function ReportsLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  return (
    <AnalyticsReportsLayout lang={lang} namespace="super-admin">
      {children}
    </AnalyticsReportsLayout>
  );
}
