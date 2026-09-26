'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { FloatingChatWidget } from '@/components/chat/FloatingChatWidget';

export function ClientLayoutWrapper({ lang, children }: { lang: string; children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Dashboard routes where we don't want the global storefront header/footer
  const isDashboardRoute =
    pathname === `/${lang}/customer` ||
    (pathname.startsWith(`/${lang}/customer/`) &&
      !pathname.includes('/customer/checkout') &&
      !pathname.includes('/customer/payment')) ||
    pathname.startsWith(`/${lang}/admin`) ||
    pathname.startsWith(`/${lang}/super-admin`) ||
    pathname.startsWith(`/${lang}/seller`) ||
    pathname.startsWith(`/${lang}/rider`) ||
    [
      '/profile',
      '/orders',
      '/wishlist',
      '/disputes',
      '/messages',
      '/reviews',
      '/product-requests',
      '/notifications',
    ].some((prefix) => pathname === `/${lang}${prefix}` || pathname.startsWith(`/${lang}${prefix}/`));

  // Authentication routes where the storefront header/footer must NOT be displayed
  const isAuthRoute = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/unauthorized',
  ].some((prefix) => pathname === `/${lang}${prefix}` || pathname.startsWith(`/${lang}${prefix}/`));

  if (isDashboardRoute || isAuthRoute) {
    return <main className="flex-grow flex flex-col">{children}</main>;
  }

  return (
    <>
      <Header lang={lang} />
      <main className="flex-grow flex flex-col pb-16 md:pb-0">
        {children}
      </main>
      <Footer lang={lang} />
      <MobileBottomNav lang={lang} />
      <FloatingChatWidget lang={lang} />
    </>
  );
}
