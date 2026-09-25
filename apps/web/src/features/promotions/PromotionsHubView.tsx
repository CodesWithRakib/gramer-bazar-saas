'use client';

import React from 'react';
import { Zap, Ticket, Image as ImageIcon } from 'lucide-react';
import DashboardHubOverview, { HubCardItem } from '@/components/dashboard/DashboardHubOverview';

export interface PromotionsHubViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function PromotionsHubView({ lang = 'en', namespace = 'admin' }: PromotionsHubViewProps) {
  const isSuperAdmin = namespace === 'super-admin';
  const basePath = isSuperAdmin ? 'super-admin' : 'admin';

  const cards: HubCardItem[] = [
    {
      id: 'flash-sales',
      title: 'Flash Sales Campaigns',
      titleBn: 'ফ্ল্যাশ সেল ক্যাম্পেইন',
      description: 'Create time-limited flash sale events, configure product discounts, and schedule real-time deals.',
      descriptionBn: 'সীমিত সময়ের ফ্ল্যাশ সেল তৈরি, পণ্যে আকর্ষণীয় ছাড় নির্ধারণ ও কাউন্টডাউন পরিচালনা করুন।',
      icon: Zap,
      href: `/${basePath}/promotions/flash-sales`,
      badge: 'High Conversion',
      badgeBn: 'বিশেষ সেল',
    },
    {
      id: 'coupons',
      title: 'Coupons & Promo Codes',
      titleBn: 'কুপন ও ডিসকাউন্ট ভাউচার',
      description: 'Configure percentage and flat discount vouchers, set minimum order values, and track usage limits.',
      descriptionBn: 'শতাংশ বা নির্দিষ্ট টাকার ডিসকাউন্ট কোড, সর্বনিম্ন অর্ডার মূল্য এবং মেয়াদ নির্ধারণ করুন।',
      icon: Ticket,
      href: `/${basePath}/promotions/coupons`,
    },
    {
      id: 'banners',
      title: 'Hero Sliders & Banners',
      titleBn: 'হোমপেজ ব্যানার ও বিজ্ঞাপন',
      description: 'Upload and manage top homepage carousel sliders, promotional announcement graphics, and action links.',
      descriptionBn: 'মার্কেটপ্লেসের মূল স্লাইডার, অফার ব্যানার এবং প্রচারমূলক ছবি ও লিংক আপলোড করুন।',
      icon: ImageIcon,
      href: `/${basePath}/promotions/banners`,
    },
  ];

  return (
    <DashboardHubOverview
      lang={lang}
      sectionTag="Growth & Campaign Engine"
      sectionTagBn="মার্কেটিং ও গ্রোথ ইঞ্জিন"
      title="Marketing & Promotions Hub"
      titleBn="মার্কেটিং ও প্রমোশন হাব"
      description="Manage sales promotions, consumer discount vouchers, hero carousel banners, and time-sensitive marketplace campaigns."
      descriptionBn="ফ্ল্যাশ সেল ক্যাম্পেইন, ডিসকাউন্ট কুপন, ব্যানার এবং অফারসমূহ সহজেই পরিচালনা ও নিয়ন্ত্রণ করুন।"
      cards={cards}
    />
  );
}
