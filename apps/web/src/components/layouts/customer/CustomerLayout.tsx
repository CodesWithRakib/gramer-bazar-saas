'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      {/* Customer Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-sm transition-all">
        <div className="container flex h-16 items-center">
          <Link href="/" className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 tracking-tight hover:opacity-80 transition-opacity">
            Gramer Bazar
          </Link>
          <div className="flex-1" />
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/en/categories" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Categories</Link>
            <Link href="/en/wishlist" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Wishlist</Link>
            <Link href="/en/reviews" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Reviews</Link>
            <Link href="/en/orders" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Orders</Link>
            <Link href="/en/disputes" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Disputes</Link>
            <div className="pl-2 border-l border-border/50">
              <NotificationBell lang="en" />
            </div>
          </nav>
          
          <div className="md:hidden flex items-center">
            <NotificationBell lang="en" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <MobileBottomNav />
    </div>
  );
}
