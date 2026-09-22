'use client';

import React, { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

export default function RiderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const router = useRouter();
  const { lang } = use(params);
  const isBn = lang === 'bn';
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${lang}`);
      return;
    }
    const isRider = user?.roles?.some((r) => r === 'RIDER');
    if (user && !isRider) {
      toast.error(isBn ? 'এই পেজটি দেখার অনুমতি নেই' : 'Unauthorized access');
      router.push(`/${lang}`);
    }
  }, [isAuthenticated, user, router, lang, isBn]);

  if (!isAuthenticated || !user?.roles?.some((r) => r === 'RIDER')) {
    return null;
  }

  return <DashboardLayout routeType="rider" lang={lang}>{children}</DashboardLayout>;
}
