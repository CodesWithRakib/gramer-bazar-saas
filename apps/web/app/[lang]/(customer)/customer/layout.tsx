'use client';

import React, { use } from 'react';
import { usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function CustomerDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const pathname = usePathname();

  // Full-width flows like checkout and payment should not display dashboard sidebar
  const isFullWidthCustomerRoute = pathname.includes('/checkout') || pathname.includes('/payment');

  if (isFullWidthCustomerRoute) {
    return (
      <RouteGuard lang={lang} requireAuth={true} allowedRoles={['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']}>
        <div className="min-h-[70vh] py-6">{children}</div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard lang={lang} requireAuth={true} allowedRoles={['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']}>
      <DashboardLayout routeType="customer" lang={lang}>
        {children}
      </DashboardLayout>
    </RouteGuard>
  );
}
