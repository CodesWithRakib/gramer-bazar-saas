import React, { use } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

export default function Layout({ children, params }: { children: React.ReactNode, params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return <DashboardLayout routeType="customer" lang={lang}>{children}</DashboardLayout>;
}
