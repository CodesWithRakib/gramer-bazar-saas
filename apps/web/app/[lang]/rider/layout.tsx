'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Bike, List, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { NotificationBell } from '@/components/ui/NotificationBell';

export default function RiderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const router = useRouter();
  const [lang, setLang] = useState('en');
  const pathname = usePathname();
  
  useEffect(() => {
    params.then((p) => setLang(p.lang));
  }, [params]);

  const isBn = lang === 'bn';
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${lang}`);
      return;
    }
    const isRider = user?.roles?.some((r) => r.name === 'RIDER');
    if (user && !isRider) {
      toast.error(isBn ? 'এই পেজটি দেখার অনুমতি নেই' : 'Unauthorized access');
      router.push(`/${lang}`);
    }
  }, [isAuthenticated, user, router, lang, isBn]);

  if (!isAuthenticated || !user?.roles?.some((r) => r.name === 'RIDER')) {
    return null;
  }

  const links = [
    { href: `/${lang}/rider`, label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', icon: Bike },
    { href: `/${lang}/rider/deliveries`, label: isBn ? 'অ্যাসাইনমেন্ট' : 'Assignments', icon: List },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <header className="sticky top-0 z-40 bg-background border-b flex items-center justify-between p-4">
        <h1 className="font-bold text-lg text-primary">Rider App</h1>
        <NotificationBell lang={lang} />
      </header>
      <main className="flex-1 pb-16">
        <div className="container p-4 max-w-md mx-auto">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t flex justify-around p-2 z-50">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center w-full py-2 ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
