'use client';

import React, { use } from 'react';
import {
  Store,
  User,
  Wallet,
  Boxes,
  Ticket,
  AlertCircle,
} from 'lucide-react';
import DashboardHubOverview, { HubCardItem } from '@/components/dashboard/DashboardHubOverview';

export interface SellerSettingsViewProps {
  lang?: string;
}

export function SellerSettingsView({ lang = 'en' }: SellerSettingsViewProps) {
  

  const cards: HubCardItem[] = [
    {
      id: 'shop',
      title: 'Shop Profile & Branding',
      titleBn: 'দোকানের প্রোফাইল ও ব্যানার',
      description: 'Update store logo, banner, store description, business hours, and delivery zone info.',
      descriptionBn: 'দোকানের লোগো, ব্যানার, বিবরণ, সময়সূচী এবং ডেলিভারি সংক্রান্ত তথ্য আপডেট করুন।',
      icon: Store,
      href: '/seller/shop',
      badge: 'Public Storefront',
      badgeBn: 'পাবলিক স্টোর',
    },
    {
      id: 'profile',
      title: 'Seller Account Details',
      titleBn: 'সেলার অ্যাকাউন্ট ও তথ্য',
      description: 'Manage merchant owner profile, personal contact numbers, and login credentials.',
      descriptionBn: 'সেলার মালিকের নাম, মোবাইল নম্বর এবং অ্যাকাউন্ট সিকিউরিটি তথ্য পরিচালনা করুন।',
      icon: User,
      href: '/seller/profile',
    },
    {
      id: 'wallet',
      title: 'Payout & Wallet Settings',
      titleBn: 'ওয়ালেট ও পেআউট উত্তোলন',
      description: 'View earnings balance, set up disbursement bank/bKash accounts, and submit withdrawal requests.',
      descriptionBn: 'মোট ব্যালেন্স দেখুন, টাকা উত্তোলনের জন্য ব্যাংক বা বিকাশ যুক্ত করুন ও উইথড্র করুন।',
      icon: Wallet,
      href: '/seller/wallet',
      badge: 'Earnings',
      badgeBn: 'উপার্জন',
    },
    {
      id: 'inventory',
      title: 'Inventory & Stock Controls',
      titleBn: 'স্টক ও ইনভেন্টরি নিয়ন্ত্রণ',
      description: 'Monitor warehouse stock levels, update SKU quantities, and manage low-stock alerts.',
      descriptionBn: 'পণ্যের স্টক সংখ্যা পরিবর্তন করুন, স্টক ঘাটতি পর্যবেক্ষণ ও ইনভেন্টরি পরিচালনা করুন।',
      icon: Boxes,
      href: '/seller/products/inventory',
    },
    {
      id: 'coupons',
      title: 'Shop Coupons & Offers',
      titleBn: 'দোকানের কুপন ও অফার',
      description: 'Create unique shop discount coupon codes to attract more village customers.',
      descriptionBn: 'গ্রাহকদের আকর্ষণ করতে নিজস্ব দোকানভিত্তিক ডিসকাউন্ট কুপন কোড তৈরি করুন।',
      icon: Ticket,
      href: '/seller/coupons',
    },
    {
      id: 'disputes',
      title: 'Customer Claims & Disputes',
      titleBn: 'গ্রাহক বিরোধ ও সমাধান',
      description: 'View and resolve customer disputes, product return requests, and order complaints.',
      descriptionBn: 'পণ্য ফেরত বা অর্ডার সংক্রান্ত গ্রাহক অভিযোগ দেখুন এবং দ্রুত সমাধান করুন।',
      icon: AlertCircle,
      href: '/seller/disputes',
    },
  ];

  return (
    <DashboardHubOverview
      lang={lang}
      sectionTag="Merchant Management"
      sectionTagBn="সেলার পরিচালনা ও সেটিংস"
      title="Store Settings & Configuration"
      titleBn="দোকান সেটিংস ও ব্যবস্থাপনা"
      description="Manage your storefront branding, owner account info, payout options, inventory settings, and promotional coupons."
      descriptionBn="আপনার দোকানের ব্র্যান্ডিং, প্রোফাইল, টাকা তোলার মাধ্যম, স্টক ও ডিসকাউন্ট কুপন এক জায়গা থেকে পরিচালনা করুন।"
      cards={cards}
    />
  );
}
