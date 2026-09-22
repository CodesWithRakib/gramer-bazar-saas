'use client';

import React, { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { userHasRole } from '@/lib/roles';

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
    if (user && !userHasRole(user, 'RIDER')) {
      toast.error(isBn ? 'এই পেজটি দেখার অনুমতি নেই' : 'Unauthorized access');
      router.push(`/${lang}`);
    }
  }, [isAuthenticated, user, router, lang, isBn]);

  const isRider = userHasRole(user, 'RIDER');
  if (!isAuthenticated || !isRider) {
    return null;
  }

  return <DashboardLayout routeType="rider" lang={lang}>{children}</DashboardLayout>;
}
