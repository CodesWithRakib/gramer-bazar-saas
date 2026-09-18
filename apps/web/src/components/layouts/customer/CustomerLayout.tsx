import React from 'react';
import Link from 'next/link';

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Customer Header Placeholder */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <span className="font-bold text-lg text-primary">Gramer Bazar</span>
          <div className="flex-1" />
          <nav className="flex items-center space-x-4">
            <Link href="/en/wishlist" className="text-sm font-medium hover:text-primary transition-colors">Wishlist</Link>
            <Link href="/en/reviews" className="text-sm font-medium hover:text-primary transition-colors">Reviews</Link>
            <Link href="/en/orders" className="text-sm font-medium hover:text-primary transition-colors">Orders</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Bottom Nav Placeholder (Mobile Only) */}
      <nav className="md:hidden sticky bottom-0 z-40 w-full border-t bg-background flex items-center justify-around h-14">
        <span className="text-xs font-medium">Home</span>
        <span className="text-xs font-medium">Categories</span>
        <span className="text-xs font-medium">Cart</span>
        <span className="text-xs font-medium">Account</span>
      </nav>
    </div>
  );
}
