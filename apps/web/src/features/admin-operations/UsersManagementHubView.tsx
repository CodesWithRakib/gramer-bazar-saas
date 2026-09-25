'use client';

import React from 'react';
import {
  Users,
  Store,
  ClipboardList,
  Truck,
  FileCheck,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import DashboardHubOverview, { HubCardItem } from '@/components/dashboard/DashboardHubOverview';

export interface UsersManagementHubViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function UsersManagementHubView({ lang = 'en', namespace = 'admin' }: UsersManagementHubViewProps) {
  const isSuperAdmin = namespace === 'super-admin';
  const basePath = isSuperAdmin ? 'super-admin' : 'admin';

  const cards: HubCardItem[] = [
    ...(isSuperAdmin
      ? [
          {
            id: 'admins',
            title: 'Administrator Roster',
            titleBn: 'সিস্টেম অ্যাডমিন পরিচালনা',
            description: 'Manage system administrators, oversee assigned roles, monitor administrative access, and view permissions.',
            descriptionBn: 'সিস্টেম অ্যাডমিনদের তালিকা, ভূমিকার দায়িত্ব এবং অ্যাক্সেস পারমিশন পরিচালনা করুন।',
            icon: ShieldCheck,
            href: '/super-admin/users-management/admins',
            badge: 'Super Admin',
            badgeBn: 'সুপার অ্যাডমিন',
            badgeVariant: 'default' as const,
          },
          {
            id: 'create-user',
            title: 'Create Staff Member',
            titleBn: 'নতুন স্টাফ / অ্যাডমিন তৈরি',
            description: 'Quickly onboard a new system administrator, staff operator, or regional support manager with direct role assignment.',
            descriptionBn: 'সরাসরি নতুন অ্যাডমিন বা অপারেশনাল স্টাফ সদস্য তৈরি করুন এবং ভূমিকা নির্ধারণ করুন।',
            icon: UserPlus,
            href: '/super-admin/users-management/create-user',
            badge: 'Staff Provisioning',
            badgeBn: 'স্টাফ তৈরি',
          },
        ]
      : []),
    {
      id: 'users',
      title: isSuperAdmin ? 'All Registered Users' : 'Customer & User Accounts',
      titleBn: isSuperAdmin ? 'সকল নিবন্ধিত ব্যবহারকারী' : 'গ্রাহক ও সাধারণ ব্যবহারকারী',
      description: isSuperAdmin
        ? 'Browse, search, and manage all accounts across customers, sellers, riders, and platform participants.'
        : 'Search, filter, and inspect registered customer accounts, verify emails, and manage account statuses.',
      descriptionBn: isSuperAdmin
        ? 'গ্রাহক, সেলার ও রাইডার সহ সকল ব্যবহারকারী প্রোফাইল অনুসন্ধান ও নিয়ন্ত্রণ করুন।'
        : 'সকল নিবন্ধিত গ্রাহক অ্যাকাউন্ট অনুসন্ধান, ইমেইল যাচাইকরণ ও অ্যাকাউন্ট সক্রিয়/নিষ্ক্রিয় করুন।',
      icon: Users,
      href: `/${basePath}/users-management/users`,
    },
    {
      id: 'sellers',
      title: isSuperAdmin ? 'Merchant & Store Directory' : 'Sellers & Store Directory',
      titleBn: 'অনুমোদিত সেলার ও দোকানসমূহ',
      description: isSuperAdmin
        ? 'Oversee verified merchant stores, inspect shop performance, manage accounts, and verify business operations.'
        : 'Manage verified merchant stores, view seller contact info, shop ratings, and vendor activity.',
      descriptionBn: 'যাচাইকৃত সেলার দোকান পরিচালনা, যোগাযোগের তথ্য, রেটিং এবং পারফরম্যান্স পর্যবেক্ষণ করুন।',
      icon: Store,
      href: `/${basePath}/users-management/sellers`,
    },
    {
      id: 'seller-applications',
      title: 'Seller KYC Applications',
      titleBn: 'সেলার পার্টনারশিপ আবেদন',
      description: 'Review pending shop registration applications, verify trade licenses/NID, and approve new merchants.',
      descriptionBn: 'নতুন দোকান খোলার আবেদন যাচাই, ট্রেড লাইসেন্স ও এনআইডি পরীক্ষা এবং সেলার অনুমোদন দিন।',
      icon: ClipboardList,
      href: `/${basePath}/users-management/seller-applications`,
      badge: 'KYC Verification',
      badgeBn: 'কেওয়াইসি যাচাই',
    },
    {
      id: 'riders',
      title: 'Delivery Fleet & Riders',
      titleBn: 'ডেলিভারি রাইডার ও বহর',
      description: 'Monitor active delivery personnel, vehicle details, assigned upazilas, and delivery statuses.',
      descriptionBn: 'ডেলিভারি রাইডার তালিকা, যানবাহনের ধরন, উপজেলা জোন এবং রাইডারের স্থিতি পরিচালনা করুন।',
      icon: Truck,
      href: `/${basePath}/users-management/riders`,
    },
    {
      id: 'rider-applications',
      title: 'Rider Driver Applications',
      titleBn: 'রাইডার আবেদন ও যাচাই',
      description: 'Review incoming delivery rider applications, driving licenses, and onboard regional drivers.',
      descriptionBn: 'নতুন রাইডারদের ড্রাইভিং লাইসেন্স এবং পরিচয়পত্র যাচাই করে অনুমোদন প্রদান করুন।',
      icon: FileCheck,
      href: `/${basePath}/users-management/rider-applications`,
      badge: 'Fleet Onboarding',
      badgeBn: 'রাইডার নিয়োগ',
    },
  ];

  return (
    <DashboardHubOverview
      lang={lang}
      sectionTag={isSuperAdmin ? 'Full Access Control' : 'Stakeholder Management'}
      sectionTagBn={isSuperAdmin ? 'সম্পূর্ণ ব্যবহারকারী ও স্টাফ নিয়ন্ত্রণ' : 'অংশীদার ও ব্যবহারকারী ব্যবস্থাপনা'}
      title={isSuperAdmin ? 'User & Partner Management Hub' : 'Users & Partners Hub'}
      titleBn={isSuperAdmin ? 'ব্যবহারকারী, অ্যাডমিন ও অংশীদার ব্যবস্থাপনা' : 'ব্যবহারকারী ও পার্টনার ব্যবস্থাপনা'}
      description={
        isSuperAdmin
          ? 'The master control center for all platform roles: Administrators, staff, merchants, delivery riders, and customers.'
          : 'Centrally manage all customer accounts, verified merchants, pending seller KYC applications, and delivery fleet riders.'
      }
      descriptionBn={
        isSuperAdmin
          ? 'সুপার অ্যাডমিনদের জন্য সম্পূর্ণ নিয়ন্ত্রণ কেন্দ্র: অ্যাডমিনিস্ট্রেটর, স্টাফ, সেলার, রাইডার এবং সাধারণ গ্রাহকদের কেন্দ্রীয় ব্যবস্থাপনা।'
          : 'গ্রাহক অ্যাকাউন্ট, অনুমোদিত সেলার, নতুন পার্টনার আবেদন এবং ডেলিভারি রাইডারদের কেন্দ্রীভূতভাবে পরিচালনা করুন।'
      }
      cards={cards}
    />
  );
}
