'use client';

import React, { use } from 'react';
import {
  Truck,
  User,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import DashboardHubOverview, { HubCardItem } from '@/components/dashboard/DashboardHubOverview';

export interface RiderSettingsViewProps {
  lang?: string;
}

export function RiderSettingsView({ lang = 'en' }: RiderSettingsViewProps) {

  const cards: HubCardItem[] = [
    {
      id: 'profile',
      title: 'Rider Profile & Vehicle Info',
      titleBn: 'রাইডার প্রোফাইল ও যানবাহন',
      description: 'Manage personal profile, driving license number, vehicle type, and emergency contacts.',
      descriptionBn: 'ব্যক্তিগত তথ্য, ড্রাইভিং লাইসেন্স, গাড়ির বিবরণ এবং জরুরি যোগাযোগ নম্বর পরিচালনা করুন।',
      icon: User,
      href: '/rider/profile',
      badge: 'Account',
      badgeBn: 'অ্যাকাউন্ট',
    },
    {
      id: 'deliveries',
      title: 'Delivery History & Completed Orders',
      titleBn: 'ডেলিভারি ইতিহাস ও সম্পন্ন কাজ',
      description: 'Review past completed parcel drop-offs, delivery timestamps, and customer signatures.',
      descriptionBn: 'পূর্ববর্তী সফল ডেলিভারি তালিকা, ডেলিভারির সময় এবং গ্রাহকের তথ্য পর্যালোচনা করুন।',
      icon: Truck,
      href: '/rider/deliveries',
    },
    {
      id: 'messages',
      title: 'Dispatcher & Admin Messages',
      titleBn: 'ডিসপ্যাচার ও অ্যাডমিন বার্তা',
      description: 'Communicate directly with marketplace dispatchers, support administrators, and merchants.',
      descriptionBn: 'অর্ডার এবং ডেলিভারি সহায়তার জন্য অ্যাডমিন ও ডিসপ্যাচার দলের সাথে সরাসরি চ্যাট করুন।',
      icon: MessageSquare,
      href: '/rider/messages',
      badge: 'Support Chat',
      badgeBn: 'সাপোর্ট চ্যাট',
    },
  ];

  return (
    <DashboardHubOverview
      lang={lang}
      sectionTag="Fleet Operations"
      sectionTagBn="রাইডার পরিচালনা ও সেটিংস"
      title="Rider Settings & Overview"
      titleBn="রাইডার সেটিংস ও পরিচালনা"
      description="Manage your rider fleet account, vehicle details, completed deliveries, and communications."
      descriptionBn="আপনার রাইডার অ্যাকাউন্ট, যানবাহনের তথ্য, ডেলিভারি রেকর্ড এবং মেসেজসমূহ পরিচালনা করুন।"
      cards={cards}
    />
  );
}
