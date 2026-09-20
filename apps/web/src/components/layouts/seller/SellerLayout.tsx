'use client';

import React from 'react';

import { NotificationBell } from '@/components/ui/NotificationBell';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { 
  LayoutDashboard, Package, Warehouse, ShoppingCart, 
  MessageSquare, BarChart3, Store, DollarSign
} from 'lucide-react';
import { usePathname } from 'next/navigation';

const NavItem = ({ href, icon: Icon, children, pathname, onClick }: { href: string, icon: React.ElementType, children: React.ReactNode, pathname: string, onClick?: () => void }) => {
  const isActive = pathname === href;
  return (
    <Link 
      onClick={onClick} 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
        isActive 
          ? 'bg-primary/10 text-primary shadow-sm' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm'
      }`}
    >
      <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
      {children}
    </Link>
  );
};

const SellerNavLinks = ({ onClick }: { onClick?: () => void }) => {
  const pathname = usePathname();

  return (
    <div className="space-y-1">
      <NavItem href="/en/seller" icon={LayoutDashboard} pathname={pathname} onClick={onClick}>Overview</NavItem>
      <NavItem href="/en/seller/products" icon={Package} pathname={pathname} onClick={onClick}>My Products</NavItem>
      <NavItem href="/en/seller/inventory" icon={Warehouse} pathname={pathname} onClick={onClick}>Inventory</NavItem>
      <NavItem href="/en/seller/orders" icon={ShoppingCart} pathname={pathname} onClick={onClick}>Orders</NavItem>
      <NavItem href="/en/seller/disputes" icon={MessageSquare} pathname={pathname} onClick={onClick}>Disputes</NavItem>
      <NavItem href="/en/seller/messages" icon={MessageSquare} pathname={pathname} onClick={onClick}>Messages</NavItem>
      <NavItem href="/en/seller/reports" icon={BarChart3} pathname={pathname} onClick={onClick}>Reports</NavItem>
      <NavItem href="/en/seller/shop" icon={Store} pathname={pathname} onClick={onClick}>Shop Settings</NavItem>
      <NavItem href="/en/seller/payouts" icon={DollarSign} pathname={pathname} onClick={onClick}>Payouts</NavItem>
    </div>
  );
};

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
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 border-b bg-background/80 backdrop-blur-xl flex items-center px-4 md:px-6 shadow-sm">
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
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
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
        <main className="flex-1 p-6 md:p-8 w-full max-w-7xl mx-auto">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
