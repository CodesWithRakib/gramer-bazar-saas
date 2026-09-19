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

// Helper component for Admin Nav links to avoid duplication
const AdminNavLinks = ({ onClick }: { onClick?: () => void }) => {
  const pathname = usePathname();
  
  const NavItem = ({ href, icon: Icon, children }: { href: string, icon: any, children: React.ReactNode }) => {
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

  return (
    <div className="space-y-1">
      <NavItem href="/en/admin" icon={LayoutDashboard}>Dashboard</NavItem>
      
      <div className="pt-4 pb-1.5 px-3 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">Users</div>
      <NavItem href="/en/admin/users" icon={Users}>All Users</NavItem>
      <NavItem href="/en/admin/sellers" icon={Store}>Sellers</NavItem>
      <NavItem href="/en/admin/riders" icon={Bike}>Riders</NavItem>
      <NavItem href="/en/admin/messages" icon={MessageSquare}>Messages</NavItem>
      
      <div className="pt-4 pb-1.5 px-3 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">Catalog</div>
      <NavItem href="/en/admin/categories" icon={Layers}>Categories</NavItem>
      <NavItem href="/en/admin/brands" icon={Tag}>Brands</NavItem>
      <NavItem href="/en/admin/products" icon={ShoppingBag}>Products</NavItem>
      
      <div className="pt-4 pb-1.5 px-3 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">Operations</div>
      <NavItem href="/en/admin/orders" icon={ShoppingCart}>Orders</NavItem>
      <NavItem href="/en/admin/deliveries" icon={Truck}>Deliveries</NavItem>
      <NavItem href="/en/admin/product-requests" icon={HeartHandshake}>Requests</NavItem>
      <NavItem href="/en/admin/reviews" icon={Star}>Reviews</NavItem>
      
      <div className="pt-4 pb-1.5 px-3 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">System</div>
      <NavItem href="/en/admin/settings" icon={Settings}>Settings</NavItem>
      <NavItem href="/en/admin/audit-logs" icon={Shield}>Audit Logs</NavItem>
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
