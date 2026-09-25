'use client';

import React, { use } from 'react';
import { usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function CustomerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const pathname = usePathname();

  // Cart and Flash-sales are accessible publicly
  const isPublicRoute = pathname.includes('/flash-sale') || pathname.includes('/cart');

  if (isPublicRoute) {
    return <div className="min-h-[70vh] py-6">{children}</div>;
  }

  return (
    <RouteGuard lang={lang} requireAuth={true}>
      <DashboardLayout routeType="customer" lang={lang}>
        {children}
      </DashboardLayout>
    </RouteGuard>
  );
}
