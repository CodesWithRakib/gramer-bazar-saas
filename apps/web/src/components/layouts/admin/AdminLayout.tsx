import React from 'react';

import { NotificationBell } from '@/components/ui/NotificationBell';

import Link from 'next/link';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Admin Sidebar Placeholder */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-background">
        <div className="h-14 flex items-center px-4 border-b">
          <span className="font-bold text-primary">Admin Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/en/admin" className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground">Dashboard</Link>
          <div className="pt-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Users</div>
          <Link href="/en/admin/users" className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground">All Users</Link>
          <Link href="/en/admin/sellers" className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground">Sellers</Link>
          <Link href="/en/admin/riders" className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground">Riders</Link>
          
          <div className="pt-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Catalog</div>
          <Link href="/en/admin/categories" className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground">Categories</Link>
          <Link href="/en/admin/brands" className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground">Brands</Link>
          <Link href="/en/admin/products" className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground">Products</Link>
          
          <div className="pt-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operations</div>
          <Link href="/en/admin/orders" className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground">Orders</Link>
          <Link href="/en/admin/deliveries" className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground">Deliveries</Link>
          <Link href="/en/admin/product-requests" className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground">Product Requests</Link>
          <Link href="/en/admin/reviews" className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground">Reviews</Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b bg-background flex items-center px-6">
          <span className="md:hidden font-bold">Admin Portal</span>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <NotificationBell lang="en" />
            <span className="text-sm font-medium">Super Admin</span>
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
