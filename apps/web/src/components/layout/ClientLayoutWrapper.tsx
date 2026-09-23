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
  const dashboardPrefixes = ['/admin', '/seller', '/rider', '/profile', '/orders', '/messages', '/disputes', '/wishlist', '/product-requests', '/reviews'];
  const isDashboardRoute = dashboardPrefixes.some(prefix => 
    pathname === `/${lang}${prefix}` || pathname.startsWith(`/${lang}${prefix}/`)
  );

  if (isDashboardRoute) {
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
