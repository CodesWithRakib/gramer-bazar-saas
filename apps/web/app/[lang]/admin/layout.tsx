import React, { use } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { adminRoutes } from '@/config/dashboard-routes';

export default function Layout({ children, params }: { children: React.ReactNode, params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return <DashboardLayout routeType="admin" lang={lang}>{children}</DashboardLayout>;
}
