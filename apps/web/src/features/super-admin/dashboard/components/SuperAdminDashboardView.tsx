'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useGetUsersQuery, Role } from '@/features/users/usersApi';
import {
  ShieldCheck,
  Users,
  Store,
  Truck,
  ArrowRight,
  ClipboardList,
  Activity,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export interface SuperAdminDashboardViewProps {
  lang?: string;
}

export function SuperAdminDashboardView({ lang = 'en' }: SuperAdminDashboardViewProps) {
  const isBn = lang === 'bn';

  const { data: adminsData } = useGetUsersQuery({ role: Role.ADMIN, limit: 1 });
  const { data: sellersData } = useGetUsersQuery({ role: Role.SELLER, limit: 1 });
  const { data: ridersData } = useGetUsersQuery({ role: Role.RIDER, limit: 1 });
  const { data: allUsersData } = useGetUsersQuery({ limit: 1 });

  const totalAdmins = adminsData?.meta?.total ?? 0;
  const totalSellers = sellersData?.meta?.total ?? 0;
  const totalRiders = ridersData?.meta?.total ?? 0;
  const totalUsers = allUsersData?.meta?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Clean Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/50">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {isBn ? 'সিস্টেম ওভারভিউ ও ব্যবস্থাপনা' : 'System Overview & Governance'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isBn
              ? 'গ্রামের বাজার প্ল্যাটফর্মের সর্বোচ্চ প্রশাসনিক নিয়ন্ত্রণ, নিরাপত্তা ও কর্মী পরিচালনা।'
              : 'Privileged administration control of the Gramer Bazar platform, staff, and governance.'}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            className="rounded-lg font-medium"
            asChild
          >
            <Link href={`/${lang}/super-admin/create-user`}>
              <UserPlus className="w-4 h-4 mr-2" />
              {isBn ? 'নতুন স্টাফ তৈরি' : 'Create Staff'}
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-lg"
            asChild
          >
            <Link href={`/${lang}/super-admin/admins`}>
              <ShieldCheck className="w-4 h-4 mr-2" />
              {isBn ? 'অ্যাডমিন রোস্টার' : 'Admin Roster'}
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card className="rounded-xl border border-border shadow-none bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isBn ? 'নিবন্ধিত অ্যাডমিন' : 'Active Admins'}
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">{totalAdmins}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isBn ? 'প্ল্যাটফর্ম নিয়ন্ত্রক' : 'Platform operators'}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-none bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isBn ? 'অনুমোদিত সেলার' : 'Approved Sellers'}
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">{totalSellers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isBn ? 'সক্রিয় দোকানদার' : 'Active village merchants'}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-none bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isBn ? 'সক্রিয় রাইডার' : 'Active Riders'}
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">{totalRiders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isBn ? 'ডেলিভারি নেটওয়ার্ক' : 'Delivery force'}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-none bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isBn ? 'মোট ব্যবহারকারী' : 'Total Users'}
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isBn ? 'সকল অ্যাকাউন্ট' : 'All accounts combined'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="rounded-xl border border-border shadow-none bg-card">
          <CardHeader className="pb-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <CardTitle className="text-base font-semibold">
              {isBn ? 'অ্যাডমিন পরিচালনা' : 'Admin Management'}
            </CardTitle>
            <CardDescription className="text-xs">
              {isBn
                ? 'সিস্টেম অ্যাডমিনদের তালিকা দেখুন, তাদের রোল এবং অ্যাক্সেস স্ট্যাটাস আপডেট করুন।'
                : 'Inspect administrative personnel, update operational privileges and manage account statuses.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" size="sm" className="w-full justify-between group text-xs font-medium" asChild>
              <Link href={`/${lang}/super-admin/admins`}>
                <span>{isBn ? 'অ্যাডমিন রোস্টার দেখুন' : 'View Admins'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-none bg-card">
          <CardHeader className="pb-3">
            <div className="w-9 h-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center mb-2">
              <ClipboardList className="w-5 h-5" />
            </div>
            <CardTitle className="text-base font-semibold">
              {isBn ? 'আবেদন পর্যালোচনা' : 'Partner Applications'}
            </CardTitle>
            <CardDescription className="text-xs">
              {isBn
                ? 'নতুন সেলার এবং রাইডার আবেদনগুলো পর্যালোচনা করুন এবং অনুমোদন দিন।'
                : 'Review pending vendor and rider partner submissions for vetting and authorization.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-between group text-xs font-medium" asChild>
              <Link href={`/${lang}/super-admin/seller-applications`}>
                <span>{isBn ? 'সেলার আবেদনসমূহ' : 'Seller Applications'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-between group text-xs font-medium" asChild>
              <Link href={`/${lang}/super-admin/rider-applications`}>
                <span>{isBn ? 'রাইডার আবেদনসমূহ' : 'Rider Applications'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-none bg-card">
          <CardHeader className="pb-3">
            <div className="w-9 h-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center mb-2">
              <Activity className="w-5 h-5" />
            </div>
            <CardTitle className="text-base font-semibold">
              {isBn ? 'নিরাপত্তা ও সেটিংস' : 'Security & Policies'}
            </CardTitle>
            <CardDescription className="text-xs">
              {isBn
                ? 'প্ল্যাটফর্মের গ্লোবাল সেটিংস এবং নিরাপত্তা অডিট লগ যাচাই করুন।'
                : 'Monitor sensitive security audit records and manage global platform rules.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-between group text-xs font-medium" asChild>
              <Link href={`/${lang}/super-admin/audit-logs`}>
                <span>{isBn ? 'অডিট লগ' : 'Security Audit Logs'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-between group text-xs font-medium" asChild>
              <Link href={`/${lang}/super-admin/settings`}>
                <span>{isBn ? 'প্ল্যাটফর্ম কনফিগ' : 'Platform Settings'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
