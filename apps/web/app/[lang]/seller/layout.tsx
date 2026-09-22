'use client';

import React, { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { userHasRole } from '@/lib/roles';

export default function SellerLayout({
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
    if (user && !userHasRole(user, 'SELLER')) {
      toast.error(isBn ? 'এই পেজটি দেখার অনুমতি নেই' : 'Unauthorized access');
      router.push(`/${lang}`);
    }
  }, [isAuthenticated, user, router, lang, isBn]);

  const isSeller = userHasRole(user, 'SELLER');
  if (!isAuthenticated || !isSeller) {
    return null;
  }

  return <DashboardLayout routeType="seller" lang={lang}>{children}</DashboardLayout>;
}
