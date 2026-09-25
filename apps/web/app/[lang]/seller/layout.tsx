'use client';

import React, { use } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function SellerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);

  return (
    <RouteGuard lang={lang} allowedRoles={['SELLER']}>
      <DashboardLayout routeType="seller" lang={lang}>
        {children}
      </DashboardLayout>
    </RouteGuard>
  );
}
