'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft, LogOut, Home, LayoutDashboard } from 'lucide-react';

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
    return `/${lang}`;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-muted/20 px-4 py-12">
      <div className="w-full max-w-lg bg-card border rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive mb-3">
          403 Forbidden
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
          {isBn ? 'অনুমতি নেই' : 'Access Denied'}
        </h1>

        <p className="text-muted-foreground text-sm sm:text-base mb-6 leading-relaxed">
          {isBn
            ? 'আপনার বর্তমান অ্যাকাউন্ট দিয়ে এই পৃষ্ঠাটিতে প্রবেশের অনুমতি নেই। যদি এটি একটি ভুল মনে হয়, তবে আপনার সিস্টেমে সঠিক রোলে লগইন করুন।'
            : 'You do not have permission to view or manage this area with your current account privileges.'}
        </p>

        {user && (
          <div className="mb-6 p-4 rounded-xl bg-muted/50 border text-left text-xs space-y-1.5">
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
    </div>
  );
}
