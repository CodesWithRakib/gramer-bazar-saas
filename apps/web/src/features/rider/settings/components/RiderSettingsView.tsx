'use client';

import React from 'react';
import { Banknote, Bell, Bike, History, MessageSquare, User } from 'lucide-react';
import DashboardHubOverview, { HubCardItem } from '@/components/dashboard/DashboardHubOverview';

export interface RiderSettingsViewProps {
  lang?: string;
}

export function RiderSettingsView({ lang = 'en' }: RiderSettingsViewProps) {
  const cards: HubCardItem[] = [
    {
      id: 'profile',
      title: 'Rider Profile & Vehicle',
      titleBn: 'রাইডার প্রোফাইল ও যানবাহন',
      description:
        'Manage your contact details, service zone, emergency contact and vehicle information.',
      descriptionBn:
        'যোগাযোগের তথ্য, কাজের এলাকা, জরুরি যোগাযোগ এবং যানবাহনের তথ্য পরিচালনা করুন।',
      icon: Bike,
      href: '/rider/profile',
      badge: 'Account',
      badgeBn: 'অ্যাকাউন্ট',
    },
    {
      id: 'earnings',
      title: 'Earnings & Payouts',
      titleBn: 'আয় ও পে-আউট',
      description: 'Review your delivery earnings and withdraw your available balance.',
      descriptionBn: 'আপনার ডেলিভারি আয় দেখুন এবং উত্তোলনযোগ্য ব্যালেন্স তুলুন।',
      icon: Banknote,
      href: '/rider/earnings',
      badge: 'Finance',
      badgeBn: 'আর্থিক',
    },
    {
      id: 'history',
      title: 'Delivery History',
      titleBn: 'ডেলিভারি ইতিহাস',
      description: 'Browse your completed and past deliveries with outcomes and earnings.',
      descriptionBn: 'সম্পন্ন ও পূর্বের ডেলিভারির রেকর্ড ও আয় দেখুন।',
      icon: History,
      href: '/rider/history',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      titleBn: 'নোটিফিকেশন',
      description: 'View delivery assignments, payout updates and account messages.',
      descriptionBn: 'ডেলিভারি অ্যাসাইনমেন্ট, পে-আউট আপডেট ও অ্যাকাউন্ট বার্তা দেখুন।',
      icon: Bell,
      href: '/rider/notifications',
    },
    {
      id: 'messages',
      title: 'Messages',
      titleBn: 'বার্তা',
      description: 'Chat with customers and the dispatch team about active deliveries.',
      descriptionBn: 'চলমান ডেলিভারি নিয়ে গ্রাহক ও ডিসপ্যাচ টিমের সাথে চ্যাট করুন।',
      icon: MessageSquare,
      href: '/rider/messages',
    },
    {
      id: 'dashboard',
      title: 'Account Overview',
      titleBn: 'অ্যাকাউন্ট সারসংক্ষেপ',
      description: 'Return to your operational dashboard for assignments and today’s tasks.',
      descriptionBn: 'আজকের কাজ ও অ্যাসাইনমেন্টের জন্য ড্যাশবোর্ডে ফিরে যান।',
      icon: User,
      href: '/rider',
    },
  ];

  return (
    <DashboardHubOverview
      lang={lang}
      sectionTag="Account & Support"
      sectionTagBn="অ্যাকাউন্ট ও সহায়তা"
      title="Rider Settings"
      titleBn="রাইডার সেটিংস"
      description="Manage your rider account, earnings and communication in one place."
      descriptionBn="আপনার রাইডার অ্যাকাউন্ট, আয় এবং যোগাযোগ এক জায়গায় পরিচালনা করুন।"
      cards={cards}
    />
  );
}
