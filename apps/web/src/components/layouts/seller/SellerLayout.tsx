import React from 'react';

import { NotificationBell } from '@/components/ui/NotificationBell';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SellerNavLinks = ({ onClick }: { onClick?: () => void }) => (
  <>
    <Link onClick={onClick} href="/en/seller" className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground">Overview</Link>
    <Link onClick={onClick} href="/en/seller/products" className="block px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">My Products</Link>
    <Link onClick={onClick} href="/en/seller/inventory" className="block px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">Inventory</Link>
    <Link onClick={onClick} href="/en/seller/orders" className="block px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">Orders</Link>
    <Link onClick={onClick} href="/en/seller/messages" className="block px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">Messages</Link>
    <Link onClick={onClick} href="/en/seller/reports" className="block px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">Reports</Link>
    <Link onClick={onClick} href="/en/seller/shop" className="block px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">Shop Settings</Link>
    <Link onClick={onClick} href="/en/seller/payouts" className="block px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">Payouts</Link>
  </>
);

export function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Seller Sidebar Placeholder */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-background">
        <div className="h-14 flex items-center px-4 border-b">
          <span className="font-bold text-primary">Seller Central</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SellerNavLinks />
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b bg-background flex items-center px-4 md:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="h-14 flex items-center px-4 border-b">
                <span className="font-bold text-primary">Seller Central</span>
              </div>
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <SellerNavLinks />
              </nav>
            </SheetContent>
          </Sheet>
          <span className="font-bold">Seller</span>
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
