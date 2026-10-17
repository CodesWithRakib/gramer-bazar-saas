'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Tractor,
  Droplets,
  Zap,
  Wrench,
  Clock,
  MapPin,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Filter,
  RefreshCw,
  Search,
  Sparkles,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  useGetMachineryItemsQuery,
  MachineryCategory,
  PricingBasis,
  MachineryItem,
} from '../machineryApi';

interface MachineryMarketplaceViewProps {
  lang?: string;
}

const CATEGORIES: { key: MachineryCategory | 'ALL'; en: string; bn: string; icon: any }[] = [
  { key: 'ALL', en: 'All Equipment', bn: 'সকল যন্ত্রপাতি', icon: Tractor },
  { key: 'POWER_TILLER', en: 'Power Tillers', bn: 'পাওয়ার টিলার', icon: Tractor },
  { key: 'TRACTOR', en: 'Tractors', bn: 'ট্রাক্টর', icon: Tractor },
  { key: 'COMBINE_HARVESTER', en: 'Combine Harvesters', bn: 'কম্বাইন্ড হারভেস্টার', icon: Sparkles },
  { key: 'IRRIGATION_PUMP_DIESEL', en: 'Diesel Pumps', bn: 'ডিজেল সেচ পাম্প', icon: Droplets },
  { key: 'IRRIGATION_PUMP_SOLAR', en: 'Solar Pumps', bn: 'সোলার সেচ পাম্প', icon: Zap },
  { key: 'PADDY_THRESHER', en: 'Threshers', bn: 'ধান মাড়াই কল', icon: Wrench },
  { key: 'SPRAYING_DRONE', en: 'Spraying Drones', bn: 'বালাইনাশক ড্রোন', icon: Sparkles },
];

export function MachineryMarketplaceView({ lang = 'en' }: { lang?: string }) {
  const isBn = lang === 'bn';

  const [selectedCategory, setSelectedCategory] = useState<MachineryCategory | 'ALL'>('ALL');
  const [districtFilter, setDistrictFilter] = useState('');
  const [upazilaFilter, setUpazilaFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const queryParams = useMemo(() => {
    return {
      category: selectedCategory === 'ALL' ? undefined : selectedCategory,
      district: districtFilter ? districtFilter.trim() : undefined,
      upazila: upazilaFilter ? upazilaFilter.trim() : undefined,
      search: searchTerm ? searchTerm.trim() : undefined,
    };
  }, [selectedCategory, districtFilter, upazilaFilter, searchTerm]);

  const { data: responseData, isLoading, isFetching, refetch } = useGetMachineryItemsQuery(queryParams);
  const items = responseData?.items || [];
  const total = responseData?.total || 0;

  const formatPriceBasis = (basis: PricingBasis, rate: number) => {
    switch (basis) {
      case 'PER_BIGHA':
        return isBn ? `৳${rate.toLocaleString()} / বিঘা` : `৳${rate.toLocaleString()} / Bigha`;
      case 'PER_HOUR':
        return isBn ? `৳${rate.toLocaleString()} / ঘণ্টা` : `৳${rate.toLocaleString()} / Hour`;
      case 'PER_DAY':
        return isBn ? `৳${rate.toLocaleString()} / দিন` : `৳${rate.toLocaleString()} / Day`;
      default:
        return `৳${rate.toLocaleString()}`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-emerald-700/40">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold mb-4">
            <Tractor className="w-4 h-4" />
            {isBn ? 'কৃষি যান্ত্রিকীকরণ ও সমবায় পুলিং' : 'Agricultural Mechanization & Cooperative Pooling'}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3">
            {isBn
              ? 'কৃষি যন্ত্রপাতি ও সেচ পাম্প সমবায় ভাড়া'
              : 'Rural Farm Machinery & Irrigation Equipment Rental'}
          </h1>

          <p className="max-w-3xl text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            {isBn
              ? 'পাওয়ার টিলার, হারভেস্টার, সেচ পাম্প বা ড্রোন ভাড়া নিন সরাসরি স্থানীয় মালিকদের থেকে। প্রতিবেশীদের সাথে জমি ক্লাস্টার করে বুকিং দিলে পাচ্ছেন বিশেষ ১০% সমবায় ছাড় এবং নিরাপদ এসক্রো জামানত সুরক্ষা।'
              : 'Hire power tillers, combine harvesters, solar/diesel irrigation pumps, and crop spraying drones from verified local owners. Pool neighboring plots to unlock up to 10% cooperative cluster savings with escrow damage protection.'}
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-emerald-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/40 flex items-center justify-center text-emerald-200">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-emerald-200/80">{isBn ? 'সমবায় ক্লাস্টার ছাড়' : 'Cluster Savings'}</p>
                <p className="text-sm font-bold text-white">{isBn ? '১০% পর্যন্ত সাশ্রয়' : 'Up to 10% Off'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/40 flex items-center justify-center text-emerald-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-emerald-200/80">{isBn ? 'নিরাপদ এসক্রো' : 'Escrow Protected'}</p>
                <p className="text-sm font-bold text-white">{isBn ? '১০০% নিরাপদ ডিপোজিট' : '100% Safe Deposit'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/40 flex items-center justify-center text-emerald-200">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-emerald-200/80">{isBn ? 'সময়মতো ডেলিভারি' : 'Timely Dispatch'}</p>
                <p className="text-sm font-bold text-white">{isBn ? 'নির্ধারিত তারিখেই জমিতে' : 'Guaranteed Slot'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/40 flex items-center justify-center text-emerald-200">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-emerald-200/80">{isBn ? 'অভিজ্ঞ চালক ও জ্বালানি' : 'Fuel & Operator'}</p>
                <p className="text-sm font-bold text-white">{isBn ? 'প্যাকেজ সুবিধাসহ' : 'Full Package Option'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shadow-sm ${
                  isSelected
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-500 shadow-emerald-600/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {isBn ? cat.bn : cat.en}
              </button>
            );
          })}
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={isBn ? 'যন্ত্রপাতির নাম বা মডেল খুঁজুন...' : 'Search machinery or model...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* District Filter */}
            <div className="sm:col-span-3">
              <input
                type="text"
                placeholder={isBn ? 'জেলা (যেমন: বগুড়া, দিনাজপুর)' : 'District (e.g. Bogura)'}
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Upazila Filter */}
            <div className="sm:col-span-3">
              <input
                type="text"
                placeholder={isBn ? 'উপজেলা (যেমন: শেরপুর, বিরগঞ্জ)' : 'Upazila (e.g. Sherpur)'}
                value={upazilaFilter}
                onChange={(e) => setUpazilaFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Refresh Button */}
            <div className="sm:col-span-1 flex justify-end">
              <button
                type="button"
                onClick={() => refetch()}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
                title={isBn ? 'রিফ্রেশ' : 'Refresh'}
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Catalog Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-80 rounded-2xl bg-white dark:bg-slate-900 p-6 animate-pulse border border-slate-200 dark:border-slate-800"
              >
                <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
                <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
                <div className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded-xl mb-4" />
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-4">
            <Tractor className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
              {isBn ? 'কোনো কৃষি যন্ত্রপাতি পাওয়া যায়নি' : 'No machinery found matching your criteria'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              {isBn
                ? 'ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন অথবা সরাসরি আপনার এলাকার ডিলারদের অনুরোধ পাঠান।'
                : 'Try adjusting your district, upazila, or equipment category filter.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('ALL');
                setDistrictFilter('');
                setUpazilaFilter('');
                setSearchTerm('');
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
            >
              {isBn ? 'সকল ফিল্টার রিসেট করুন' : 'Reset All Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5">
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {item.category.replace(/_/g, ' ')}
                    </span>

                    {item.neighborClusterDiscountPct > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <TrendingDown className="w-3.5 h-3.5" />
                        {isBn ? `${item.neighborClusterDiscountPct}% সমবায় সাশ্রয়` : `${item.neighborClusterDiscountPct}% Cluster Save`}
                      </span>
                    )}
                  </div>

                  {/* Title & Model */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-1">
                    {isBn ? item.titleBn : item.titleEn}
                  </h3>
                  {item.modelNumber && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-3">
                      Model: {item.modelNumber}
                    </p>
                  )}

                  {/* Location Tag */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>
                      {item.upazila}, {item.district} ({item.serviceRadiusKm} km {isBn ? 'সার্ভিস ব্যাসার্ধ' : 'radius'})
                    </span>
                  </div>

                  {/* Pricing Box */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200/70 dark:border-slate-700/60 mb-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {isBn ? 'ভাড়ার হার' : 'Rental Rate'}
                      </span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {formatPriceBasis(item.pricingBasis, item.baseRate)}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                        {item.fuelOption === 'FUEL_INCLUDED'
                          ? isBn
                            ? 'জ্বালানি সহ'
                            : 'Fuel Included'
                          : isBn
                            ? 'জ্বালানি ছাড়া'
                            : 'Fuel Excluded'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                        {item.operatorOption === 'OPERATOR_INCLUDED'
                          ? isBn
                            ? 'চালক সহ'
                            : 'Operator Included'
                          : isBn
                            ? 'স্ব-চালিত'
                            : 'Self-Operated'}
                      </span>
                      {item.securityDeposit > 0 && (
                        <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-medium">
                          {isBn ? `জামানত: ৳${item.securityDeposit}` : `Deposit: ৳${item.securityDeposit}`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Owner Info Preview */}
                  {item.owner && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>
                        {isBn ? 'মালিক: ' : 'Owner: '}
                        <strong className="text-slate-700 dark:text-slate-200">
                          {item.owner.firstName || 'Farmer Co-op'}
                        </strong>
                      </span>
                      <span className="font-mono text-slate-600 dark:text-slate-400">{item.owner.phone}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Button */}
                <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800">
                  <Link
                    href={`/${lang}/machinery/${item.id}/book`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition active:scale-95"
                  >
                    <span>{isBn ? 'জমি বুক করুন ও রেট দেখুন' : 'Book & Calculate Quote'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
