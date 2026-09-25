'use client';

import React from 'react';
import { CreditCard, Wallet } from 'lucide-react';
import DashboardHubOverview, { HubCardItem } from '@/components/dashboard/DashboardHubOverview';

export interface FinanceHubViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function FinanceHubView({ lang = 'en', namespace = 'admin' }: FinanceHubViewProps) {
  const isSuperAdmin = namespace === 'super-admin';
  const basePath = isSuperAdmin ? 'super-admin' : 'admin';

  const cards: HubCardItem[] = [
    {
      id: 'payments',
      title: 'Customer Payments & Transactions',
      titleBn: 'গ্রাহক পেমেন্ট ও ট্রানজ্যাকশন',
      description: 'Review digital gateway payments, Cash on Delivery (COD) reconciliations, and customer payment logs.',
      descriptionBn: 'অনলাইন গেটওয়ে পেমেন্ট, ক্যাশ অন ডেলিভারি (সিওডি) এবং গ্রাহক লেনদেনের স্থিতি যাচাই করুন।',
      icon: CreditCard,
      href: `/${basePath}/finance/payments`,
      badge: 'SSLCOMMERZ / COD',
      badgeBn: 'পেমেন্ট গেটওয়ে',
    },
    {
      id: 'payouts',
      title: 'Merchant Payouts & Wallets',
      titleBn: 'সেলার পেআউট ও উত্তোলন',
      description: 'Audit seller wallet balances, process disbursement withdrawal requests, and approve bank/bKash payouts.',
      descriptionBn: 'সেলারদের ওয়ালেট ব্যালেন্স নিরীক্ষা, তহবিল উত্তোলন অনুরোধ অনুমোদন ও ব্যাংক/বিকাশ পেআউট পরিচালনা করুন।',
      icon: Wallet,
      href: `/${basePath}/finance/payouts`,
      badge: 'Disbursements',
      badgeBn: 'তহবিল বিতরণ',
    },
  ];

  return (
    <DashboardHubOverview
      lang={lang}
      sectionTag="Financial Operations"
      sectionTagBn="আর্থিক পরিচালনা ও লেনদেন"
      title="Finance & Payouts Hub"
      titleBn="অর্থ ও পেআউট হাব"
      description="Manage marketplace cash flow, review customer online/COD payments, and process merchant wallet withdrawal payouts."
      descriptionBn="মার্কেটপ্লেসের আর্থিক হিসাব, গ্রাহকদের পেমেন্ট এবং সেলারদের ওয়ালেট উত্তোলন অনুরোধসমূহ পরিচালনা করুন।"
      cards={cards}
    />
  );
}
