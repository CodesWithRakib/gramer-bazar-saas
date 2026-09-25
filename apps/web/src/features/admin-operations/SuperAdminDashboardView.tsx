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
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-primary p-8 md:p-10 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
            <span>{isBn ? 'সুপার অ্যাডমিন সিকিউর পোর্টাল' : 'Super Admin Master Console'}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {isBn ? 'সিস্টেম ওভারভিউ ও ব্যবস্থাপনা' : 'System Overview & Governance'}
          </h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed">
            {isBn
              ? 'গ্রামের বাজার প্ল্যাটফর্মের সর্বোচ্চ প্রশাসনিক নিয়ন্ত্রণ। অ্যাডমিন তৈরি, পারমিশন ম্যানেজমেন্ট এবং নিরাপত্তা পর্যবেক্ষণ করুন।'
              : 'Privileged administration control of the Gramer Bazar platform. Manage administrative staff, permissions, and security.'}
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Button
              className="bg-white text-emerald-800 hover:bg-white/90 font-semibold rounded-xl shadow-md"
              asChild
            >
              <Link href={`/${lang}/super-admin/create-user`}>
                <UserPlus className="w-4 h-4 mr-2" />
                {isBn ? 'নতুন স্টাফ/অ্যাডমিন তৈরি' : 'Create Staff / Admin'}
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 rounded-xl"
              asChild
            >
              <Link href={`/${lang}/super-admin/admins`}>
                <ShieldCheck className="w-4 h-4 mr-2" />
                {isBn ? 'অ্যাডমিন রোস্টার' : 'View Admin Roster'}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-2xl border-muted/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isBn ? 'নিবন্ধিত অ্যাডমিন' : 'Active Admins'}
            </CardTitle>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAdmins}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isBn ? 'প্ল্যাটফর্ম নিয়ন্ত্রক' : 'Platform operators'}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-muted/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isBn ? 'অনুমোদিত সেলার' : 'Approved Sellers'}
            </CardTitle>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSellers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isBn ? 'সক্রিয় দোকানদার' : 'Active village merchants'}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-muted/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isBn ? 'সক্রিয় রাইডার' : 'Active Riders'}
            </CardTitle>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRiders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isBn ? 'ডেলিভারি নেটওয়ার্ক' : 'Delivery force'}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-muted/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isBn ? 'মোট ব্যবহারকারী' : 'Total Users'}
            </CardTitle>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isBn ? 'সকল অ্যাকাউন্ট' : 'All accounts combined'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-muted/50 shadow-sm hover:border-primary/30 transition-all">
          <CardHeader>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg">
              {isBn ? 'অ্যাডমিন পরিচালনা' : 'Admin Management'}
            </CardTitle>
            <CardDescription>
              {isBn
                ? 'সিস্টেম অ্যাডমিনদের তালিকা দেখুন, তাদের রোল এবং অ্যাক্সেস স্ট্যাটাস আপডেট করুন।'
                : 'Inspect administrative personnel, update operational privileges and manage account statuses.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-between group" asChild>
              <Link href={`/${lang}/super-admin/admins`}>
                <span>{isBn ? 'অ্যাডমিন রোস্টার দেখুন' : 'View Admins'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-muted/50 shadow-sm hover:border-primary/30 transition-all">
          <CardHeader>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
              <ClipboardList className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg">
              {isBn ? 'আবেদন পর্যালোচনা' : 'Partner Applications'}
            </CardTitle>
            <CardDescription>
              {isBn
                ? 'নতুন সেলার এবং রাইডার আবেদনগুলো পর্যালোচনা করুন এবং অনুমোদন দিন।'
                : 'Review pending vendor and rider partner submissions for vetting and authorization.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-between group" asChild>
              <Link href={`/${lang}/super-admin/seller-applications`}>
                <span>{isBn ? 'সেলার আবেদনসমূহ' : 'Seller Applications'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-between group" asChild>
              <Link href={`/${lang}/super-admin/rider-applications`}>
                <span>{isBn ? 'রাইডার আবেদনসমূহ' : 'Rider Applications'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-muted/50 shadow-sm hover:border-primary/30 transition-all">
          <CardHeader>
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center mb-3">
              <Activity className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg">
              {isBn ? 'নিরাপত্তা ও সেটিংস' : 'Security & Policies'}
            </CardTitle>
            <CardDescription>
              {isBn
                ? 'প্ল্যাটফর্মের গ্লোবাল সেটিংস এবং নিরাপত্তা অডিট লগ যাচাই করুন।'
                : 'Monitor sensitive security audit records and manage global platform rules.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-between group" asChild>
              <Link href={`/${lang}/super-admin/audit-logs`}>
                <span>{isBn ? 'অডিট লগ' : 'Security Audit Logs'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-between group" asChild>
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
