import React from 'react';

import { NotificationBell } from '@/components/ui/NotificationBell';
import Link from 'next/link';

export function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Seller Sidebar Placeholder */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-background">
        <div className="h-14 flex items-center px-4 border-b">
          <span className="font-bold text-primary">Seller Central</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/en/seller" className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground">Overview</Link>
          <Link href="/en/seller/products" className="block px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">My Products</Link>
          <Link href="/en/seller/orders" className="block px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">Orders</Link>
          <Link href="/en/seller/messages" className="block px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">Messages</Link>
          <Link href="/en/seller/payouts" className="block px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">Payouts</Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b bg-background flex items-center px-6">
          <span className="md:hidden font-bold">Seller Central</span>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <NotificationBell lang="en" />
            <span className="text-sm font-medium">Store Owner</span>
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
