'use client';

import React from 'react';
import {
  Settings as SettingsIcon,
  CreditCard,
  ShieldCheck,
  BarChart3,
  UserCog,
  UserPlus,
} from 'lucide-react';
import DashboardHubOverview, { HubCardItem } from '@/components/dashboard/DashboardHubOverview';

export interface SettingsHubViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function SettingsHubView({ lang = 'en', namespace = 'admin' }: SettingsHubViewProps) {
  const isSuperAdmin = namespace === 'super-admin';
  const basePath = isSuperAdmin ? 'super-admin' : 'admin';

  const cards: HubCardItem[] = [
    {
      id: 'general',
      title: 'Platform & Contact Details',
      titleBn: 'প্ল্যাটফর্ম ও যোগাযোগের তথ্য',
      description: 'Configure marketplace branding name, official customer support email, hotline numbers, and vendor registrations.',
      descriptionBn: 'মার্কেটপ্লেসের নাম, সাপোর্ট ইমেইল, হেল্পলাইন নম্বর এবং সেলার রেজিস্ট্রেশন নীতি কনফিগার করুন।',
      icon: SettingsIcon,
      href: `/${basePath}/settings/general`,
    },
    {
      id: 'payment-gateway',
      title: 'SSLCOMMERZ Gateway & Tunnel',
      titleBn: 'এসএসএলকমার্জ পেমেন্ট গেটওয়ে ও টানেল',
      description: 'Manage merchant store credentials, live production switch, IPN webhook endpoints, and active ngrok tunnel URLs.',
      descriptionBn: 'মার্চেন্ট স্টোর আইডি, পাসওয়ার্ড, লাইভ/স্যান্ডবক্স মোড, আইপিএন ওয়েবহুক ও এনগ্রোক টানেল পরিচালনা করুন।',
      icon: CreditCard,
      href: `/${basePath}/settings/general#gateway`,
      badge: 'Payments Core',
      badgeBn: 'পেমেন্ট কোর',
    },
    ...(isSuperAdmin
      ? [
          {
            id: 'admins',
            title: 'Admin & Staff Management',
            titleBn: 'অ্যাডমিন ও স্টাফ পরিচালনা',
            description: 'Manage administrator accounts, assign permissions, oversee staff credentials, and view active admin rosters.',
            descriptionBn: 'সিস্টেম অ্যাডমিনদের তালিকা, ভূমিকার দায়িত্ব এবং অ্যাক্সেস পারমিশন পরিচালনা করুন।',
            icon: UserCog,
            href: '/super-admin/users-management/admins',
            badge: 'Super Admin',
            badgeBn: 'সুপার অ্যাডমিন',
            badgeVariant: 'default' as const,
          },
          {
            id: 'create-user',
            title: 'Create Staff Member',
            titleBn: 'নতুন স্টাফ / অ্যাডমিন তৈরি',
            description: 'Directly register a new system administrator, operational staff member, or regional coordinator.',
            descriptionBn: 'সরাসরি নতুন অ্যাডমিন বা অপারেশনাল স্টাফ সদস্য তৈরি করুন এবং ভূমিকা নির্ধারণ করুন।',
            icon: UserPlus,
            href: '/super-admin/users-management/create-user',
            badge: 'Staff Provisioning',
            badgeBn: 'স্টাফ তৈরি',
          },
        ]
      : []),
    {
      id: 'audit-logs',
      title: 'Security & Audit Logs',
      titleBn: 'সিকিউরিটি ও সিস্টেম অডিট লগ',
      description: 'Review administrative audit trails, security sensitive events, account modifications, and login IP records.',
      descriptionBn: 'অ্যাডমিন অ্যাক্টিভিটি, ডাটাবেজ পরিবর্তন, নিরাপত্তা লগ এবং প্রবেশকারী আইপি রেকর্ড পরীক্ষা করুন।',
      icon: ShieldCheck,
      href: `/${basePath}/settings/audit-logs`,
      badge: 'Security',
      badgeBn: 'নিরাপত্তা',
    },
    {
      id: 'demand-reports',
      title: 'Market Demand & Analytics',
      titleBn: 'বাজার চাহিদা ও পণ্য বিশ্লেষণ',
      description: 'Examine out-of-stock product inquiries, regional consumer demand metrics, and category trend forecasts.',
      descriptionBn: 'পণ্যের চাহিদা বিশ্লেষণ, স্টক শেষের পর গ্রাহক অনুসন্ধান এবং আঞ্চলিক ক্রয় প্রবণতা রিপোর্ট দেখুন।',
      icon: BarChart3,
      href: `/${basePath}/settings/reports/demand`,
    },
  ];

  return (
    <DashboardHubOverview
      lang={lang}
      sectionTag={isSuperAdmin ? 'System Configuration & Control' : 'System Configuration'}
      sectionTagBn={isSuperAdmin ? 'সিস্টেম কনফিগারেশন ও নিয়ন্ত্রণ' : 'সিস্টেম ও কনফিগারেশন হাব'}
      title="Settings & System Overview"
      titleBn="সেটিংস ও সিস্টেম ব্যবস্থাপনা"
      description={
        isSuperAdmin
          ? 'The master administration center for system settings, payment gateways, staff credentials, security audit logs, and demand analytics.'
          : 'Manage marketplace general configurations, payment gateway credentials, audit security logs, and business demand analytics.'
      }
      descriptionBn={
        isSuperAdmin
          ? 'সুপার অ্যাডমিনদের জন্য সম্পূর্ণ কনফিগারেশন কেন্দ্র: সিস্টেম সেটিংস, পেমেন্ট গেটওয়ে, স্টাফ পারমিশন, অডিট লগ এবং চাহিদা রিপোর্ট।'
          : 'মার্কেটপ্লেস কনফিগারেশন, পেমেন্ট গেটওয়ে, নিরাপত্তা অডিট লগ এবং ব্যবসায়িক রিপোর্ট পরিচালনা করুন।'
      }
      cards={cards}
    />
  );
}
