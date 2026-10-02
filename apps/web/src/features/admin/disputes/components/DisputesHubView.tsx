'use client';

import React from 'react';
import { AlertCircle, Star } from 'lucide-react';
import DashboardHubOverview, { HubCardItem } from '@/components/dashboard/DashboardHubOverview';

export interface DisputesHubViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function DisputesHubView({ lang = 'en', namespace = 'admin' }: DisputesHubViewProps) {
  const isSuperAdmin = namespace === 'super-admin';
  const basePath = isSuperAdmin ? 'super-admin' : 'admin';

  const cards: HubCardItem[] = [
    {
      id: 'disputes-list',
      title: 'Customer & Seller Disputes',
      titleBn: 'গ্রাহক ও সেলার বিরোধ',
      description:
        'Audit active dispute cases, evaluate uploaded evidence messages, issue refund arbitration decisions, and log internal notes.',
      descriptionBn:
        'সক্রিয় বিরোধ পর্যালোচনা, প্রমাণাদি যাচাই, রিফান্ড/মীমাংসা সিদ্ধান্ত প্রদান এবং অভ্যন্তরীণ নোট সংরক্ষণ করুন।',
      icon: AlertCircle,
      href: `/${basePath}/disputes/list`,
      badge: 'Arbitration',
      badgeBn: 'মীমাংসা',
      badgeVariant: 'default',
    },
    {
      id: 'reviews',
      title: 'Product Reviews Moderation',
      titleBn: 'পণ্য রিভিউ মডারেশন',
      description:
        'Moderate customer product feedback, star ratings, verified purchase reviews, and remove policy-violating comments.',
      descriptionBn:
        'গ্রাহকদের পণ্যের রিভিউ ও স্টার রেটিং তদারকি, অশালীন মন্তব্য বাতিল এবং মানসম্পন্ন রিভিউ অনুমোদন করুন।',
      icon: Star,
      href: `/${basePath}/disputes/reviews`,
      badge: 'Quality & Trust',
      badgeBn: 'রিভিউ মান',
      badgeVariant: 'secondary',
    },
  ];

  return (
    <DashboardHubOverview
      lang={lang}
      sectionTag={isSuperAdmin ? 'PLATFORM INTEGRITY & TRUST' : 'TRUST & SAFETY'}
      sectionTagBn={isSuperAdmin ? 'প্ল্যাটফর্ম সততা ও বিশ্বাস' : 'বিশ্বাস ও নিরাপত্তা'}
      title={isSuperAdmin ? 'Disputes & Reviews Resolution Hub' : 'Disputes & Reviews Hub'}
      titleBn={isSuperAdmin ? 'বিরোধ ও রিভিউ সমাধান হাব' : 'বিরোধ ও রিভিউ হাব'}
      description={
        isSuperAdmin
          ? 'Maintain marketplace trust through centralized arbitration of buyer-seller transaction claims and public review moderation.'
          : 'Resolve order claims between customers and sellers, and monitor product review credibility.'
      }
      descriptionBn={
        isSuperAdmin
          ? 'গ্রাহক ও সেলারের মধ্যকার বিরোধ নিষ্পত্তি এবং রিভিউ মডারেশনের মাধ্যমে প্ল্যাটফর্মের বিশ্বাসযোগ্যতা বজায় রাখুন।'
          : 'অর্ডার বিরোধ নিষ্পত্তি ও মানসম্পন্ন গ্রাহক রিভিউ তদারকি পরিচালনা করুন।'
      }
      cards={cards}
    />
  );
}

export default DisputesHubView;
