import React from 'react';

import { NotificationBell } from '@/components/ui/NotificationBell';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Admin Sidebar Placeholder */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-background">
        <div className="h-14 flex items-center px-4 border-b">
          <span className="font-bold text-primary">Admin Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <div className="px-3 py-2 text-sm font-medium rounded-md bg-muted text-foreground">Dashboard</div>
          <div className="px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground">Orders</div>
          <div className="px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground">Users</div>
          <div className="px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground">Settings</div>
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
