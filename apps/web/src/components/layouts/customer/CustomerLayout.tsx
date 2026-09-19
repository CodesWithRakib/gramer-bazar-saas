'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { Home, Grid, ShoppingBag, User } from 'lucide-react';

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const MobileNavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => {
    const isActive = pathname === href || pathname === `/en${href}` || pathname === `/bn${href}`;
    return (
      <Link href={href} className="flex flex-col items-center justify-center w-full h-full hover:bg-muted/30 transition-colors">
        <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-primary drop-shadow-sm' : 'text-muted-foreground'}`} />
        <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
      </Link>
    );
  };

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

      {/* Bottom Nav Placeholder (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 z-50 w-full border-t bg-background/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center justify-around h-16 pb-safe">
        <MobileNavItem href="/" icon={Home} label="Home" />
        <MobileNavItem href="/en/categories" icon={Grid} label="Categories" />
        <MobileNavItem href="/en/cart" icon={ShoppingBag} label="Cart" />
        <MobileNavItem href="/en/profile" icon={User} label="Account" />
      </nav>
      {/* Spacer for mobile nav */}
      <div className="h-16 md:hidden pb-safe"></div>
    </div>
  );
}
