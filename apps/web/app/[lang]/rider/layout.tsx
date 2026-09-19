'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { LayoutDashboard, Map, ListOrdered, User, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function RiderLayout({
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
    const isRider = user?.roles?.some((r) => r === 'RIDER');
    if (user && !isRider) {
      toast.error(isBn ? 'এই পেজটি দেখার অনুমতি নেই' : 'Unauthorized access');
      router.push(`/${lang}`);
    }
  }, [isAuthenticated, user, router, lang, isBn]);

  if (!isAuthenticated || !user?.roles?.some((r) => r === 'RIDER')) {
    return null;
  }

  const links = [
    { href: `/${lang}/rider`, label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', icon: LayoutDashboard },
    { href: `/${lang}/rider/deliveries`, label: isBn ? 'ডেলিভারি' : 'Deliveries', icon: ListOrdered },
    { href: `/${lang}/rider/profile`, label: isBn ? 'প্রোফাইল' : 'Profile', icon: User },
  ];

  return (
    <div className="container py-4 md:py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-full md:w-64 space-y-2">
          <div className="p-4 bg-primary/10 text-primary rounded-lg mb-6 border border-primary/20">
            <h2 className="font-bold text-lg">{isBn ? 'রাইডার পোর্টাল' : 'Rider Portal'}</h2>
            <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
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

        {/* Mobile top nav (horizontal scroll) */}
        <div className="md:hidden flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-4 px-4">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        <main className="flex-1 min-h-[500px]">
          {children}
        </main>
      </div>
    </div>
  );
}
