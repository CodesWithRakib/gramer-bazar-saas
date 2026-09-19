'use client';

import React from 'react';

import { NotificationBell } from '@/components/ui/NotificationBell';

import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { 
  LayoutDashboard, Users, Store, Bike, MessageSquare, 
  Layers, Tag, ShoppingBag, ShoppingCart, Truck, 
  HeartHandshake, Star, Settings, Shield
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

// Helper component for Admin Nav links to avoid duplication
const AdminNavLinks = ({ onClick }: { onClick?: () => void }) => {
  const pathname = usePathname();

  return (
    <div className="space-y-1">
      <NavItem href="/en/admin" icon={LayoutDashboard} pathname={pathname} onClick={onClick}>Dashboard</NavItem>
      
      <div className="pt-4 pb-1.5 px-3 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">Users</div>
      <NavItem href="/en/admin/users" icon={Users} pathname={pathname} onClick={onClick}>All Users</NavItem>
      <NavItem href="/en/admin/sellers" icon={Store} pathname={pathname} onClick={onClick}>Sellers</NavItem>
      <NavItem href="/en/admin/riders" icon={Bike} pathname={pathname} onClick={onClick}>Riders</NavItem>
      <NavItem href="/en/admin/messages" icon={MessageSquare} pathname={pathname} onClick={onClick}>Messages</NavItem>
      
      <div className="pt-4 pb-1.5 px-3 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">Catalog</div>
      <NavItem href="/en/admin/categories" icon={Layers} pathname={pathname} onClick={onClick}>Categories</NavItem>
      <NavItem href="/en/admin/brands" icon={Tag} pathname={pathname} onClick={onClick}>Brands</NavItem>
      <NavItem href="/en/admin/products" icon={ShoppingBag} pathname={pathname} onClick={onClick}>Products</NavItem>
      
      <div className="pt-4 pb-1.5 px-3 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">Operations</div>
      <NavItem href="/en/admin/orders" icon={ShoppingCart} pathname={pathname} onClick={onClick}>Orders</NavItem>
      <NavItem href="/en/admin/deliveries" icon={Truck} pathname={pathname} onClick={onClick}>Deliveries</NavItem>
      <NavItem href="/en/admin/product-requests" icon={HeartHandshake} pathname={pathname} onClick={onClick}>Requests</NavItem>
      <NavItem href="/en/admin/reviews" icon={Star} pathname={pathname} onClick={onClick}>Reviews</NavItem>
      
      <div className="pt-4 pb-1.5 px-3 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">System</div>
      <NavItem href="/en/admin/settings" icon={Settings} pathname={pathname} onClick={onClick}>Settings</NavItem>
      <NavItem href="/en/admin/audit-logs" icon={Shield} pathname={pathname} onClick={onClick}>Audit Logs</NavItem>
    </div>
  );
};

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Admin Sidebar Placeholder */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-background">
        <div className="h-14 flex items-center px-4 border-b">
          <span className="font-bold text-primary">Admin Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <AdminNavLinks />
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
                <span className="font-bold text-primary">Admin Portal</span>
              </div>
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
                <AdminNavLinks />
              </nav>
            </SheetContent>
          </Sheet>
          <span className="font-bold">Admin</span>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <NotificationBell lang="en" />
            <span className="text-sm font-medium">Super Admin</span>
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
