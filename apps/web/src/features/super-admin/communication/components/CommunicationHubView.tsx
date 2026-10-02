'use client';

import React from 'react';
import { Megaphone, History, FileText } from 'lucide-react';
import DashboardHubOverview, { HubCardItem } from '@/components/dashboard/DashboardHubOverview';

export interface CommunicationHubViewProps {
  lang?: string;
}

export function CommunicationHubView({ lang = 'en' }: CommunicationHubViewProps) {
  const cards: HubCardItem[] = [
    {
      id: 'announcements',
      title: 'Broadcast Announcement',
      titleBn: 'নতুন ঘোষণা প্রচার',
      description:
        'Compose and dispatch live notifications, pop-up alerts, and system notices to customers, sellers, or riders.',
      descriptionBn:
        'গ্রাহক, সেলার বা রাইডারদের লক্ষ্য করে জরুরি বিজ্ঞপ্তি, পপ-আপ অ্যালার্ট এবং ঘোষণা সম্প্রচার করুন।',
      icon: Megaphone,
      href: '/super-admin/communication/announcements',
      badge: 'Live Dispatch',
      badgeBn: 'সরাসরি প্রচার',
      badgeVariant: 'default',
    },
    {
      id: 'history',
      title: 'Announcement History & Logs',
      titleBn: 'ঘোষণার ইতিহাস ও লগ',
      description:
        'Inspect dispatched announcements, verify delivery reach metrics, and track previously scheduled messages.',
      descriptionBn:
        'পূর্বে প্রেরিত ঘোষণা, পৌঁছানোর পরিসংখ্যান এবং নির্ধারিত বার্তাগুলোর স্থিতি পরীক্ষা করুন।',
      icon: History,
      href: '/super-admin/communication/history',
      badge: 'Audit Trail',
      badgeBn: 'ইতিহাস লগ',
      badgeVariant: 'secondary',
    },
    {
      id: 'templates',
      title: 'Message Templates',
      titleBn: 'মেসেজ ও ঘোষণা টেমপ্লেট',
      description:
        'Predefine reusable announcement layouts, standard customer notices, and festival greeting templates.',
      descriptionBn:
        'পুনর্ব্যবহারযোগ্য নোটিশ কাঠামো, স্ট্যান্ডার্ড ঘোষণা এবং উৎসবের শুভেচ্ছা বার্তা টেমপ্লেট সংরক্ষণ করুন।',
      icon: FileText,
      href: '/super-admin/communication/templates',
      badge: 'Templates',
      badgeBn: 'টেমপ্লেট',
      badgeVariant: 'outline',
    },
  ];

  return (
    <DashboardHubOverview
      lang={lang}
      sectionTag="COMMUNICATION & BROADCAST"
      sectionTagBn="যোগাযোগ ও ঘোষণা প্রশাসন"
      title="Communication Hub"
      titleBn="কমিউনিকেশন ও ঘোষণা হাব"
      description="Centrally broadcast marketplace alerts, publish platform notices to distinct user roles, and manage announcement templates."
      descriptionBn="মার্কেটপ্লেসের বিভিন্ন ব্যবহারকারীদের নোটিশ পাঠানো, পূর্বের ঘোষণার ইতিহাস এবং টেমপ্লেট পরিচালনা করুন।"
      cards={cards}
    />
  );
}

export default CommunicationHubView;
