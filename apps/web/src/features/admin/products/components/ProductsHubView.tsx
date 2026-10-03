'use client';

import React from 'react';
import { Package, Tag, Building2, ClipboardList, Layers, SlidersHorizontal } from 'lucide-react';
import DashboardHubOverview, { HubCardItem } from '@/components/dashboard/DashboardHubOverview';

export interface ProductsHubViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function ProductsHubView({
  lang = 'en',
  namespace = 'admin',
}: ProductsHubViewProps) {
  const isSuperAdmin = namespace === 'super-admin';
  const basePath = isSuperAdmin ? 'super-admin' : 'admin';

  const cards: HubCardItem[] = [
    {
      id: 'catalog',
      title: isSuperAdmin ? 'Master Product Catalog' : 'Product Catalog',
      titleBn: isSuperAdmin ? 'মাস্টার পণ্য ক্যাটালগ' : 'পণ্য ক্যাটালগ ও তালিকা',
      description: isSuperAdmin
        ? 'Central control for all marketplace products, multi-variant pricing, inventory status, image assets, and catalog imports.'
        : 'Browse, search, edit, import, and manage all store catalog products, pricing, stock, and variations.',
      descriptionBn: isSuperAdmin
        ? 'সকল পণ্যের তালিকা, বহু-ভ্যারিয়েন্ট মূল্য, ইনভেন্টরি স্থিতি, ছবি এবং বাল্ক ইমপোর্ট পরিচালনা করুন।'
        : 'সকল পণ্য তালিকা, মূল্য নির্ধারণ, স্টক ও বৈচিত্র্য অনুসন্ধান ও সম্পাদনা করুন।',
      icon: Package,
      href: `/${basePath}/products/list`,
      badge: 'Core Inventory',
      badgeBn: 'মূল ক্যাটালগ',
      badgeVariant: 'default',
    },
    {
      id: 'categories',
      title: 'Categories & Taxonomy',
      titleBn: 'ক্যাটাগরি ও সাব-ক্যাটাগরি',
      description:
        'Manage root categories, nested sub-categories, category icons, display sort orders, and Bengali translations.',
      descriptionBn:
        'রুট ক্যাটাগরি, সাব-ক্যাটাগরি, আইকন, ডিসপ্লে ক্রম এবং বাংলা অনুবাদসমূহ পরিচালনা করুন।',
      icon: Tag,
      href: `/${basePath}/products/categories`,
      badge: 'Taxonomy',
      badgeBn: 'শ্রেণিবিভাগ',
      badgeVariant: 'secondary',
    },
    {
      id: 'product-types',
      title: 'Product Types',
      titleBn: 'প্রোডাক্ট টাইপ',
      description:
        'Define the concrete product types inside each category (Processor, Monitor, Router…) and the attributes they use.',
      descriptionBn:
        'প্রতিটি ক্যাটাগরির ভিতরের প্রোডাক্ট টাইপ (প্রসেসর, মনিটর, রাউটার…) ও তাদের অ্যাট্রিবিউট নির্ধারণ করুন।',
      icon: Layers,
      href: `/${basePath}/products/product-types`,
      badge: 'Product Type',
      badgeBn: 'পণ্যের ধরন',
      badgeVariant: 'default',
    },
    {
      id: 'attributes',
      title: 'Attribute Engine',
      titleBn: 'অ্যাট্রিবিউট ইঞ্জিন',
      description:
        'Manage reusable attributes, data types, selectable options, and which ones power filters and variants.',
      descriptionBn:
        'পুনরায় ব্যবহারযোগ্য অ্যাট্রিবিউট, ডেটা টাইপ, অপশন এবং ফিল্টার/ভ্যারিয়েন্ট নিয়ন্ত্রণ করুন।',
      icon: SlidersHorizontal,
      href: `/${basePath}/products/attributes`,
      badge: 'Spec Schema',
      badgeBn: 'স্পেক স্কিমা',
      badgeVariant: 'default',
    },
    {
      id: 'brands',
      title: 'Brand Directory',
      titleBn: 'ব্র্যান্ড ও প্রস্তুতকারক',
      description:
        'Manage verified manufacturer brands, brand logos, origins, and associated category mappings.',
      descriptionBn:
        'পণ্য প্রস্তুতকারক ব্র্যান্ড, ব্র্যান্ড লোগো, উৎপত্তিস্থল এবং ক্যাটাগরি ম্যাপিং পরিচালনা করুন।',
      icon: Building2,
      href: `/${basePath}/products/brands`,
      badge: 'Directory',
      badgeBn: 'ব্র্যান্ড তালিকা',
      badgeVariant: 'secondary',
    },
    {
      id: 'product-requests',
      title: 'Customer Product Requests',
      titleBn: 'গ্রাহক পণ্য অনুরোধ',
      description:
        'Review customer product requests, prioritize procurement demands, and convert requested items to active listings.',
      descriptionBn:
        'গ্রাহকদের চাহিদা অনুযায়ী পণ্যের অনুরোধ পর্যালোচনা এবং সরাসরি ক্যাটালগে অন্তর্ভুক্ত করুন।',
      icon: ClipboardList,
      href: `/${basePath}/products/product-requests`,
      badge: 'Demands',
      badgeBn: 'চাহিদা',
      badgeVariant: 'outline',
    },
  ];

  return (
    <DashboardHubOverview
      lang={lang}
      sectionTag={isSuperAdmin ? 'CATALOG GOVERNANCE' : 'CATALOG OPERATIONS'}
      sectionTagBn={isSuperAdmin ? 'ক্যাটালগ প্রশাসন' : 'ক্যাটালগ অপারেশন'}
      title={isSuperAdmin ? 'Products & Catalog Hub' : 'Product Management Hub'}
      titleBn={isSuperAdmin ? 'পণ্য ও ক্যাটালগ হাব' : 'পণ্য ব্যবস্থাপনা হাব'}
      description={
        isSuperAdmin
          ? 'Centrally govern platform products, categories, manufacturer brands, and customer procurement requests with clean sub-route navigation.'
          : 'Browse and administer product catalog items, taxonomies, brands, and customer sourcing requests.'
      }
      descriptionBn={
        isSuperAdmin
          ? 'সকল পণ্য, ক্যাটাগরি, ব্র্যান্ড এবং গ্রাহকদের পণ্য অনুরোধ কেন্দ্রীয়ভাবে পরিচালনা করুন।'
          : 'পণ্য ক্যাটালগ, ক্যাটাগরি, ব্র্যান্ড এবং গ্রাহক চাহিদা সহজে তদারকি ও নিয়ন্ত্রণ করুন।'
      }
      cards={cards}
    />
  );
}

export default ProductsHubView;
