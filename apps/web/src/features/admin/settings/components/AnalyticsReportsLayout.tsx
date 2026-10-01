'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BarChart3, TrendingUp, Package, Users, Search } from 'lucide-react';

export interface AnalyticsReportsLayoutProps {
  children: React.ReactNode;
  lang: string;
  namespace?: 'admin' | 'super-admin';
}

export function AnalyticsReportsLayout({
  children,
  lang,
  namespace = 'admin',
}: AnalyticsReportsLayoutProps) {
  const pathname = usePathname();
  const isBn = lang === 'bn';

  const basePath = `/${lang}/${namespace}/settings/reports`;

  const tabs = [
    {
      id: 'overview',
      name: isBn ? 'ওভারভিউ' : 'Overview',
      href: `${basePath}/overview`,
      icon: BarChart3,
    },
    {
      id: 'sales',
      name: isBn ? 'বিক্রয়' : 'Sales',
      href: `${basePath}/sales`,
      icon: TrendingUp,
    },
    {
      id: 'products',
      name: isBn ? 'পণ্যসমূহ' : 'Products',
      href: `${basePath}/products`,
      icon: Package,
    },
    {
      id: 'customers',
      name: isBn ? 'গ্রাহক' : 'Customers',
      href: `${basePath}/customers`,
      icon: Users,
    },
    {
      id: 'demand',
      name: isBn ? 'চাহিদা ও ক্যাটাগরি' : 'Demand & Category',
      href: `${basePath}/demand`,
      icon: Search,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isBn ? 'অ্যানালিটিক্স ও রিপোর্ট' : 'Analytics & Reports'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isBn
            ? 'আপনার প্ল্যাটফর্মের বিক্রয়, পণ্য এবং গ্রাহকদের ডাটা বিশ্লেষণ করুন।'
            : 'Analyze data for sales, products, and customers across your platform.'}
        </p>
      </div>

      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = pathname.includes(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-2">{children}</div>
    </div>
  );
}
