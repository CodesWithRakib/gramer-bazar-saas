'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { LayoutDashboard, Package, ShoppingCart, Store, LogOut, Ticket } from 'lucide-react';
import { toast } from 'sonner';

export default function SellerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const router = useRouter();
  const [lang, setLang] = React.useState('en');
  const isBn = lang === 'bn';
  const pathname = usePathname();
  
  React.useEffect(() => {
    params.then((p) => setLang(p.lang));
  }, [params]);

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${lang}`);
      return;
    }
    const isSeller = user?.roles?.some((r) => r === 'SELLER');
    if (user && !isSeller) {
      toast.error(isBn ? 'এই পেজটি দেখার অনুমতি নেই' : 'Unauthorized access');
      router.push(`/${lang}`);
    }
  }, [isAuthenticated, user, router, lang, isBn]);

  if (!isAuthenticated || !user?.roles?.some((r) => r === 'SELLER')) {
    return null;
  }

  const links = [
    { href: `/${lang}/seller`, label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', icon: LayoutDashboard },
    { href: `/${lang}/seller/products`, label: isBn ? 'পণ্য' : 'Products', icon: Package },
    { href: `/${lang}/seller/orders`, label: isBn ? 'অর্ডার' : 'Orders', icon: ShoppingCart },
    { href: `/${lang}/seller/coupons`, label: isBn ? 'কুপন' : 'Coupons', icon: Ticket },
    { href: `/${lang}/seller/profile`, label: isBn ? 'প্রোফাইল' : 'Shop Profile', icon: Store },
  ];

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-2">
          <div className="p-4 bg-muted/30 rounded-lg mb-6">
            <h2 className="font-bold text-lg">{isBn ? 'সেলার পোর্টাল' : 'Seller Portal'}</h2>
            <p className="text-sm text-muted-foreground">{user.firstName} {user.lastName}</p>
          </div>
          <nav className="flex flex-col space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 min-h-[500px]">
          {children}
        </main>
      </div>
    </div>
  );
}
