'use client';

import React from 'react';
import { ShoppingCart, Truck } from 'lucide-react';
import DashboardHubOverview, { HubCardItem } from '@/components/dashboard/DashboardHubOverview';

export interface OrdersHubViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function OrdersHubView({ lang = 'en', namespace = 'admin' }: OrdersHubViewProps) {
  const isSuperAdmin = namespace === 'super-admin';
  const basePath = isSuperAdmin ? 'super-admin' : 'admin';

  const cards: HubCardItem[] = [
    {
      id: 'orders-list',
      title: isSuperAdmin ? 'All Platform Orders' : 'Order Catalog & Management',
      titleBn: isSuperAdmin ? 'সকল প্ল্যাটফর্ম অর্ডার' : 'অর্ডার ক্যাটালগ ও ব্যবস্থাপনা',
      description: isSuperAdmin
        ? 'Super Admin master oversight of marketplace customer orders across all stores, payment reconciliations, and packing stages.'
        : 'Track customer orders, verify payment status, update fulfillment processing, and print delivery invoices.',
      descriptionBn: isSuperAdmin
        ? 'মার্কেটপ্লেসের সকল দোকানের অর্ডার, পেমেন্ট স্থিতি, প্যাকিং ও ডেলিভারি অগ্রগতি কেন্দ্রীয়ভাবে তদারকি করুন।'
        : 'গ্রাহকদের অর্ডার ট্র্যাকিং, পেমেন্ট নিশ্চিতকরণ, প্যাকেজিং এবং ইনভয়েস প্রিন্ট পরিচালনা করুন।',
      icon: ShoppingCart,
      href: `/${basePath}/orders/list`,
      badge: 'Order Processing',
      badgeBn: 'অর্ডার প্রসেসিং',
      badgeVariant: 'default',
    },
    {
      id: 'deliveries',
      title: 'Delivery Logistics & Dispatch',
      titleBn: 'ডেলিভারি লজিস্টিকস ও ডিসপ্যাচ',
      description:
        'Live rider tracking, assign available delivery personnel to pending orders, and monitor on-the-road dispatch progress.',
      descriptionBn:
        'লাইভ রাইডার ট্র্যাকিং, পেন্ডিং অর্ডারে ডেলিভারি ম্যান অ্যাসাইন এবং অন-দ্য-রোড পার্সেল ট্র্যাক করুন।',
      icon: Truck,
      href: `/${basePath}/orders/deliveries`,
      badge: 'Live Logistics',
      badgeBn: 'লজিস্টিকস',
      badgeVariant: 'secondary',
    },
  ];

  return (
    <DashboardHubOverview
      lang={lang}
      sectionTag={isSuperAdmin ? 'FULFILLMENT GOVERNANCE' : 'FULFILLMENT OPERATIONS'}
      sectionTagBn={isSuperAdmin ? 'ফুলফিলমেন্ট প্রশাসন' : 'ফুলফিলমেন্ট অপারেশন'}
      title={isSuperAdmin ? 'Orders & Logistics Hub' : 'Order Operations Hub'}
      titleBn={isSuperAdmin ? 'অর্ডার ও লজিস্টিকস হাব' : 'অর্ডার ও ডেলিভারি হাব'}
      description={
        isSuperAdmin
          ? 'Comprehensive oversight and dispatch coordination for customer orders, rider assignments, and shipment delivery workflows.'
          : 'Manage and fulfill platform customer purchases, assign delivery riders, and oversee order dispatch lifecycle.'
      }
      descriptionBn={
        isSuperAdmin
          ? 'গ্রাহকদের অর্ডার তদারকি, রাইডার অ্যাসাইন এবং পার্সেল ডেলিভারি লজিস্টিকস কেন্দ্রীয়ভাবে নিয়ন্ত্রণ করুন।'
          : 'গ্রাহকের কেনাকাটা প্রসেস, রাইডার বণ্টন এবং ডেলিভারি কার্যক্রম সহজে সম্পাদন করুন।'
      }
      cards={cards}
    />
  );
}

export default OrdersHubView;
