import React from 'react';
import Link from 'next/link';

export function RiderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Rider Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-primary text-primary-foreground">
        <div className="container flex h-14 items-center justify-center">
          <span className="font-bold text-lg">Rider App</span>
        </div>
      </header>

      {/* Main Content (Mobile Optimized) */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Bottom Nav Placeholder */}
      <nav className="sticky bottom-0 z-40 w-full border-t bg-background flex items-center justify-around h-16 pb-safe">
        <Link href="/en/rider" className="flex flex-col items-center hover:text-primary transition-colors text-muted-foreground">
          <div className="w-6 h-6 bg-muted rounded-full mb-1"></div>
          <span className="text-[10px] font-medium">Tasks</span>
        </Link>
        <Link href="/en/rider/map" className="flex flex-col items-center hover:text-primary transition-colors text-muted-foreground">
          <div className="w-6 h-6 bg-muted rounded-full mb-1"></div>
          <span className="text-[10px] font-medium">Map</span>
        </Link>
        <Link href="/en/rider/earnings" className="flex flex-col items-center hover:text-primary transition-colors text-muted-foreground">
          <div className="w-6 h-6 bg-muted rounded-full mb-1"></div>
          <span className="text-[10px] font-medium">Earnings</span>
        </Link>
        <Link href="/en/rider/profile" className="flex flex-col items-center hover:text-primary transition-colors text-muted-foreground">
          <div className="w-6 h-6 bg-muted rounded-full mb-1"></div>
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
