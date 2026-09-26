'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { userHasRole, getUserRoles } from '@/lib/roles';
import { ShieldAlert, Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  lang: string;
  requireAuth?: boolean;
}

export function RouteGuard({
  children,
  allowedRoles,
  lang,
  requireAuth = true,
}: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isBn = lang === 'bn';

  const { user, isAuthenticated, isAuthInitialized } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (!isAuthInitialized) return;

    if (requireAuth && !isAuthenticated) {
      const redirectUrl = `/${lang}/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
    }
  }, [isAuthInitialized, isAuthenticated, requireAuth, router, lang, pathname]);

  // 1. While auth state is initializing from token/cookies or profile is loading, show loading screen
  if (!isAuthInitialized || (isAuthenticated && !user)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-80" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {isBn ? 'যাচাই করা হচ্ছে...' : 'Authenticating...'}
        </p>
      </div>
    );
  }

  // 2. Unauthenticated check
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-80" />
        <p className="text-sm text-muted-foreground">
          {isBn ? 'লগইন পেজে নিয়ে যাওয়া হচ্ছে...' : 'Redirecting to login...'}
        </p>
      </div>
    );
  }

  // 3. Role authorization check
  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = userHasRole(user, ...allowedRoles);
    
    // Super Admin has master access across all protected dashboards
    const isSuperAdmin = userHasRole(user, 'SUPER_ADMIN');
    const isAllowed = hasPermission || isSuperAdmin;

    if (!isAllowed) {
      const userRoles = getUserRoles(user);
      return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg bg-card border rounded-3xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
              {isBn ? 'প্রবেশাধিকার সংরক্ষিত (403)' : 'Access Denied (403)'}
            </h1>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              {isBn
                ? `এই সেকশনে প্রবেশের জন্য আপনার প্রয়োজনীয় অনুমতি নেই। আপনার বর্তমান রোল: ${userRoles.join(', ') || 'কোন রোল নেই'}।`
                : `You do not have permission to access this area. Your current role is: ${userRoles.join(', ') || 'None'}.`}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="outline" className="w-full sm:w-auto" asChild>
                <Link href={`/${lang}`}>
                  <Home className="w-4 h-4 mr-2" />
                  {isBn ? 'হোম পেজ' : 'Go Home'}
                </Link>
              </Button>
              {userRoles.includes('SELLER') && (
                <Button className="w-full sm:w-auto" asChild>
                  <Link href={`/${lang}/seller`}>
                    {isBn ? 'সেলার ড্যাশবোর্ড' : 'Seller Portal'}
                  </Link>
                </Button>
              )}
              {userRoles.includes('RIDER') && (
                <Button className="w-full sm:w-auto" asChild>
                  <Link href={`/${lang}/rider`}>
                    {isBn ? 'রাইডার অ্যাপ' : 'Rider Portal'}
                  </Link>
                </Button>
              )}
              {(userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN')) && (
                <Button className="w-full sm:w-auto" asChild>
                  <Link href={`/${lang}/admin`}>
                    {isBn ? 'অ্যাডমিন প্যানেল' : 'Admin Portal'}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  // 4. Render protected content
  return <>{children}</>;
}
