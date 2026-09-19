'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, Map as MapIcon, Wallet, User } from 'lucide-react';

export function RiderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => {
    const isActive = pathname === href;
    return (
      <Link href={href} className="flex flex-col items-center justify-center w-full h-full hover:bg-muted/30 transition-colors">
        <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-primary drop-shadow-sm' : 'text-muted-foreground'}`} />
        <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      {/* Rider Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl shadow-sm text-foreground">
        <div className="container flex h-14 items-center justify-center">
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Rider App</span>
        </div>
      </header>

      {/* Main Content (Mobile Optimized) */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Bottom Nav Placeholder */}
      <nav className="fixed bottom-0 z-50 w-full border-t bg-background/80 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center justify-around h-16 pb-safe">
        <NavItem href="/en/rider" icon={ClipboardList} label="Tasks" />
        <NavItem href="/en/rider/map" icon={MapIcon} label="Map" />
        <NavItem href="/en/rider/earnings" icon={Wallet} label="Earnings" />
        <NavItem href="/en/rider/profile" icon={User} label="Profile" />
      </nav>
      {/* Padding for bottom nav */}
      <div className="h-16 pb-safe"></div>
    </div>
  );
}
