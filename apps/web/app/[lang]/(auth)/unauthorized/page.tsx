'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { ShieldAlert, LogOut, Home, LayoutDashboard } from 'lucide-react';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { BrandLogo } from '@/components/common/BrandLogo';

export default function UnauthorizedPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const router = useRouter();
  const dispatch = useDispatch();
  const isBn = lang === 'bn';

  const user = useSelector((state: RootState) => state.auth.user);
  const roles = user?.roles || [];

  const handleLogout = () => {
    dispatch(logout());
    router.push(`/${lang}/login`);
  };

  const getDashboardLink = () => {
    if (roles.includes('SUPER_ADMIN')) return `/${lang}/super-admin`;
    if (roles.includes('ADMIN')) return `/${lang}/admin`;
    if (roles.includes('SELLER')) return `/${lang}/seller`;
    if (roles.includes('RIDER')) return `/${lang}/rider`;
    return `/${lang}/customer/profile`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      {/* Brand Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <Link href={`/${lang}`} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <BrandLogo lang={lang} variant="full" width={140} height={38} />
        </Link>
        <LanguageSwitcher currentLocale={lang} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-card border rounded-xl p-8 text-center">
          <div className="w-14 h-14 rounded-xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center mb-5">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-destructive/10 text-destructive mb-3">
            403 Forbidden
          </span>

          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
            {isBn ? 'অনুমতি নেই' : 'Access Denied'}
          </h1>

          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            {isBn
              ? 'আপনার বর্তমান অ্যাকাউন্ট দিয়ে এই পৃষ্ঠাটিতে প্রবেশের অনুমতি নেই। সঠিক রোলে প্রবেশ করতে অনুগ্রহ করে উপযুক্ত পোর্টালে যান।'
              : 'You do not have permission to view or manage this area with your current account privileges.'}
          </p>

          {user && (
            <div className="mb-6 p-4 rounded-lg bg-muted/40 border text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isBn ? 'ব্যবহারকারী' : 'Signed in as'}:</span>
                <span className="font-semibold text-foreground">{user.firstName} {user.lastName} ({user.phone || user.email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isBn ? 'বর্তমান রোল' : 'Active Roles'}:</span>
                <span className="font-semibold text-primary">{roles.join(', ') || 'CUSTOMER'}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={getDashboardLink()} className="w-full sm:w-auto">
              <Button className="w-full gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span>{isBn ? 'আমার ড্যাশবোর্ড' : 'Go to My Portal'}</span>
              </Button>
            </Link>

            <Link href={`/${lang}`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full gap-2">
                <Home className="w-4 h-4" />
                <span>{isBn ? 'হোম পেইজ' : 'Return Home'}</span>
              </Button>
            </Link>

            <Button variant="ghost" onClick={handleLogout} className="w-full sm:w-auto gap-2 text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4" />
              <span>{isBn ? 'অন্য অ্যাকাউন্টে লগইন' : 'Switch Account'}</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
