'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  BadgePercent,
  MapPin,
  Calendar,
  Building2,
  Scale,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Search,
  HelpCircle,
  Truck,
  Coins,
} from 'lucide-react';
import {
  useGetContractCampaignsQuery,
  useGetContractPlatformStatsQuery,
  ContractCropType,
} from '../contractFarmingApi';

const CROP_FILTERS: { key: ContractCropType | 'ALL'; en: string; bn: string }[] = [
  { key: 'ALL', en: 'All Crops', bn: 'সকল ফসল' },
  { key: 'POTATO_PROCESSING', en: 'Processing Potato', bn: 'চিপস আলু' },
  { key: 'CHINIGURA_AROMATIC_RICE', en: 'Chinigura Rice', bn: 'চিনিগুঁড়া সুগন্ধি চাল' },
  { key: 'TOMATO_PROCESSING', en: 'Roma Tomato', bn: 'রোমা টমেটো' },
  { key: 'MAIZE_POULTRY_FEED', en: 'Poultry Feed Maize', bn: 'ফিড ভুট্টা' },
  { key: 'CHILI_SPICE_PROCESSING', en: 'Spice Chili', bn: 'মসলা মরিচ' },
  { key: 'MUSTARD_OIL_SEED', en: 'Mustard Seed', bn: 'সরিষা বীজ' },
  { key: 'ORGANIC_VEGETABLES', en: 'Organic Veggies', bn: 'অর্গানিক শাকসবজি' },
];

export function ContractFarmingMarketplaceView({ lang = 'en' }: { lang?: string }) {
  const isBn = lang === 'bn';

  const [selectedCrop, setSelectedCrop] = useState<ContractCropType | 'ALL'>('ALL');
  const [districtFilter, setDistrictFilter] = useState<string>('');

  const { data: statsData } = useGetContractPlatformStatsQuery();
  const { data: responseData, isLoading, isFetching, refetch } = useGetContractCampaignsQuery({
    cropType: selectedCrop === 'ALL' ? undefined : selectedCrop,
    targetDistrict: districtFilter ? districtFilter.trim() : undefined,
  });

  const campaigns = responseData?.items || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-8 md:p-12 shadow-2xl border border-emerald-700/30">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 border border-emerald-400/30 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {isBn
                ? 'কর্পোরেট বাইব্যাক চুক্তি ও গ্যারান্টিযুক্ত নূন্যতম মূল্য'
                : 'Corporate Buyback Contracts & Guaranteed Price Floors'}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              {isBn
                ? 'কৃষি চুক্তিভিত্তিক চাষাবাদ ও অগ্রিম শস্য ক্রয় প্ল্যাটফর্ম'
                : 'Agricultural Contract Farming & Forward Purchase Agreement Engine'}
            </h1>
            <p className="text-base md:text-lg text-emerald-100/90 mb-8 leading-relaxed">
              {isBn
                ? 'প্রাণ, স্কয়ার ও সুপারশপের সাথে নিশ্চিত মূল্যে শস্য উৎপাদনের চুক্তি করুন। বীজ বপনের সাথে সাথে ২৫% ইনপুট নগদ অগ্রিম গ্রহণ করুন এবং ডিজিটাল ওয়েইব্রিজে ফসল সরবরাহ করে তাৎক্ষণিক মূল্য বুঝে নিন।'
                : 'Partner with top agro-corporates with legally-binding minimum buyback floor prices. Receive 25% upfront seed capital upon planting, pre-harvest field quality audits, and automated digital weighbridge settlement.'}
            </p>

            {/* Platform Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-emerald-700/50">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
                <p className="text-xs text-emerald-200">
                  {isBn ? 'সক্রিয় চুক্তি ক্যাম্পেইন' : 'Active Campaigns'}
                </p>
                <p className="text-xl md:text-2xl font-bold text-white mt-1">
                  {statsData?.totalCampaigns ?? 4}+
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
                <p className="text-xs text-emerald-200">
                  {isBn ? 'চুক্তিভুক্ত জমির পরিমাণ' : 'Enrolled Farmland'}
                </p>
                <p className="text-xl md:text-2xl font-bold text-white mt-1">
                  {(statsData?.totalEnrolledAcres ?? 485.5).toLocaleString()} {isBn ? 'একর' : 'Acres'}
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
                <p className="text-xs text-emerald-200">
                  {isBn ? 'ছাড়কৃত ইনপুট অগ্রিম' : 'Advance Disbursed'}
                </p>
                <p className="text-xl md:text-2xl font-bold text-emerald-400 mt-1">
                  ৳{(statsData?.totalAdvanceDisbursed ?? 2450000).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
                <p className="text-xs text-emerald-200">
                  {isBn ? 'নিষ্পত্তিকৃত ফসল সরবরাহ' : 'Harvest Delivered'}
                </p>
                <p className="text-xl md:text-2xl font-bold text-amber-300 mt-1">
                  {(statsData?.totalDeliveredKg ?? 184500).toLocaleString()} {isBn ? 'কেজি' : 'kg'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Filters and Controls */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Crop Type Filter Tabs */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {CROP_FILTERS.map((crop) => (
                <button
                  key={crop.key}
                  onClick={() => setSelectedCrop(crop.key)}
                  className={`px-3.5 py-2 text-xs md:text-sm font-medium rounded-xl transition-all ${
                    selectedCrop === crop.key
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {isBn ? crop.bn : crop.en}
                </button>
              ))}
            </div>

            {/* Search District and Refresh */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isBn ? 'জেলা দিয়ে খুঁজুন (বগুড়া, দিনাজপুর...)' : 'Filter by district...'}
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs md:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                title={isBn ? 'রিফ্রেশ করুন' : 'Refresh'}
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Campaign Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
            <p className="text-sm text-slate-500">
              {isBn ? 'কন্ট্রাক্ট ফার্মিং ক্যাম্পেইন লোড হচ্ছে...' : 'Loading contract farming campaigns...'}
            </p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              {isBn ? 'কোন চুক্তি ক্যাম্পেইন পাওয়া যায়নি' : 'No Contract Campaigns Found'}
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {isBn
                ? 'আপনার নির্বাচিত ফিল্টারে কোনো ক্যাম্পেইন খুঁজে পাওয়া যায়নি। অন্য ফসল বা জেলা নির্বাচন করুন।'
                : 'No campaigns match your selected crop or district filter. Try clearing filters.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {campaigns.map((camp) => {
              const enrolledPct = Math.min(
                100,
                Math.round(((camp.currentEnrolledAcres || 0) / (camp.targetTotalAcres || 1)) * 100)
              );

              return (
                <div
                  key={camp.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Buyer & Code Badge */}
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            {camp.buyerCompanyName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">{camp.campaignCode}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {camp.targetSeason}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                      {isBn ? camp.titleBn : camp.titleEn}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {isBn ? camp.descriptionBn : camp.descriptionEn}
                    </p>

                    {/* Floor Price & Advance Capital Callouts */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                          {isBn ? 'নিশ্চিত ফ্লোর প্রাইস' : 'Guaranteed Floor Price'}
                        </span>
                        <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                          ৳{Number(camp.guaranteedFloorPricePerKg).toFixed(2)}
                          <span className="text-xs font-normal text-slate-500"> / {isBn ? 'কেজি' : 'kg'}</span>
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80">
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          {isBn ? 'ইনপুট ক্যাশ অগ্রিম' : 'Upfront Advance'}
                        </span>
                        <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                          {camp.advanceInputCashPct}%
                          <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">
                            {' '}
                            {isBn ? 'বপনের সাথে' : 'on Seeding'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Target Location & Warehouse */}
                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-5">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {isBn ? 'নির্ধারিত অঞ্চল: ' : 'Target Area: '}
                          <strong>
                            {camp.targetDistrict}
                            {camp.targetUpazila ? `, ${camp.targetUpazila}` : ''}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {isBn ? 'ইনটেক হাব: ' : 'Intake Hub: '}
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {camp.intakeDropWarehouseName}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Scale className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {isBn ? 'প্রত্যাশিত ফলন: ' : 'Est. Yield: '}
                          <strong>{camp.estimatedYieldPerBighaKg} kg</strong> / {isBn ? 'বিঘা' : 'bigha'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar of Target Farmland */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-500">
                          {isBn ? 'চুক্তিভুক্ত একর' : 'Farmland Enrolled'}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {camp.currentEnrolledAcres} / {camp.targetTotalAcres} {isBn ? 'একর' : 'Acres'} (
                          {enrolledPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${enrolledPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {isBn ? 'ডিজিটাল এসক্রো ও ওজন নিশ্চয়তা' : 'Guaranteed Weighbridge Settlement'}
                    </span>
                    <Link
                      href={`/${lang}/contract-farming/${camp.id}/apply`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition"
                    >
                      <span>{isBn ? 'চুক্তির আবেদন করুন' : 'Apply for Contract'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* How Contract Farming Works Infographic Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm mt-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
              {isBn ? 'স্বচ্ছ ও নিরাপদ প্রক্রিয়া' : 'Transparent 4-Step Escrow Workflow'}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
              {isBn
                ? 'চুক্তিভিত্তিক চাষাবাদ কীভাবে কাজ করে?'
                : 'How Contract Farming & Forward Settlement Works'}
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              {isBn
                ? 'বাজারের অস্থিরতা থেকে কৃষককে সুরক্ষা দেওয়া এবং কর্পোরেট বায়ারদের প্রিমিয়াম মানের কাঁচামাল নিশ্চিত করা।'
                : 'Insulating farmers against crop market crashes while securing premium-grade agricultural produce for food processors.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-4 shadow-md shadow-emerald-600/30">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                {isBn ? 'জমির পরিমাপ ও আবেদন' : '1. Land Enrollment'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isBn
                  ? 'কৃষক জমির বিঘা ও প্রত্যাশিত ফলন উল্লেখ করে পছন্দের কর্পোরেট ক্যাম্পেইনে চুক্তির আবেদন পেশ করেন।'
                  : 'Farmer inputs land area (bighas) and target produce specs to lock in the forward purchase floor price.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 relative">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-sm mb-4 shadow-md shadow-teal-600/30">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                {isBn ? 'অনুমোদন ও ২৫% ইনপুট ক্যাশ' : '2. 25% Upfront Capital'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isBn
                  ? 'বায়ার চুক্তি অনুমোদন দিলে বীজ ও সার ক্রয়ের জন্য মোট চুক্তিমূল্যের ২৫% সরাসরি কৃষকের বিকাশ/ব্যাংকে ছাড় হয়।'
                  : 'Upon buyer approval, 25% working capital is instantly disbursed into the farmer wallet for certified seed and fertilizer inputs.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center text-sm mb-4 shadow-md shadow-amber-600/30">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                {isBn ? 'মাঠ পরিদর্শন ও অডিট' : '3. Growth Inspections'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isBn
                  ? 'অঙ্কুরোদগম ও ফসল পরিপক্কতার সময় কৃষিবিদ দ্বারা মাঠ পরিদর্শন, স্বাস্থ্য স্কোর ও মান সনদ প্রদান করা হয়।'
                  : 'Agronomists inspect germination rates, foliage health, and pest management to certify maturity and yield compliance.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm mb-4 shadow-md shadow-indigo-600/30">
                4
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                {isBn ? 'ওয়েইব্রিজ ওজন ও চূড়ান্ত ছাড়' : '4. Automated Settlement'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isBn
                  ? 'ওয়্যারহাউসে ডিজিটাল ট্রাকে নিট ওজন ও গ্রেডিং অনুযায়ী ভাউচার তৈরি হয় এবং বাকি ৭৫% ব্যালেন্স এসক্রো থেকে পেমেন্ট হয়।'
                  : 'Digital weighbridge calculates gross minus tare weight with grade premiums, instantly settling remaining escrow balance.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
