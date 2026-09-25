'use client';

import React, { use } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function SuperAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);

  return (
    <RouteGuard lang={lang} allowedRoles={['SUPER_ADMIN']}>
      <DashboardLayout routeType="super-admin" lang={lang}>
        {children}
      </DashboardLayout>
    </RouteGuard>
  );
}
