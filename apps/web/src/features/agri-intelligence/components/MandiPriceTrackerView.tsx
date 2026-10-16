'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Calculator,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import {
  useGetMandiPricesQuery,
  useLazyGetFairPriceAdvisoryQuery,
  MandiPriceRecord,
  FairPriceAdvisoryResult,
} from '../agriIntelligenceApi';

const DIVISIONS = [
  'ALL',
  'Dhaka',
  'Rajshahi',
  'Rangpur',
  'Khulna',
  'Chittagong',
  'Sylhet',
  'Mymensingh',
  'Barisal',
];

const COMMODITY_GROUPS = [
  { key: 'ALL', labelEn: 'All Groups', labelBn: 'সকল ফসল' },
  { key: 'CEREALS', labelEn: 'Cereals & Rice', labelBn: 'চাল ও দানাশস্য' },
  { key: 'VEGETABLES', labelEn: 'Vegetables', labelBn: 'শাকসবজি' },
  { key: 'SPICES', labelEn: 'Spices', labelBn: 'মসলাজাতীয়' },
  { key: 'OILSEEDS', labelEn: 'Oilseeds', labelBn: 'তৈলবীজ' },
  { key: 'PULSES', labelEn: 'Pulses & Dal', labelBn: 'ডাল ও শিম' },
];

export function MandiPriceTrackerView({ lang = 'bn' }: { lang?: string }) {
  const isBn = lang === 'bn';

  // Filters
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fair-Price Calculator State
  const [calcCrop, setCalcCrop] = useState<string>('Miniket Rice');
  const [calcPrice, setCalcPrice] = useState<string>('72');
  const [calcDistrict, setCalcDistrict] = useState<string>('Bogra');

  // Query Hooks
  const { data: prices = [], isLoading } = useGetMandiPricesQuery({
    division: selectedDivision === 'ALL' ? undefined : selectedDivision,
    commodityGroup: selectedGroup === 'ALL' ? undefined : selectedGroup,
    search: searchTerm || undefined,
  });

  const [triggerAdvisory, { data: advisoryResult, isFetching: isCalculating }] =
    useLazyGetFairPriceAdvisoryQuery();

  const handleCalculateAdvisory = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(calcPrice);
    if (!calcCrop || isNaN(priceNum) || priceNum <= 0) return;

    triggerAdvisory({
      cropName: calcCrop,
      offeredPrice: priceNum,
      district: calcDistrict || undefined,
    });
  };

  const renderTrendIcon = (trend: string) => {
    switch (trend) {
      case 'UP':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            <TrendingUp className="w-3.5 h-3.5" />
            {isBn ? 'ঊর্ধ্বমুখী' : 'Rising'}
          </span>
        );
      case 'DOWN':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <TrendingDown className="w-3.5 h-3.5" />
            {isBn ? 'নিম্নমুখী' : 'Falling'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Minus className="w-3.5 h-3.5" />
            {isBn ? 'স্থিতিশীল' : 'Stable'}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-700/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium text-emerald-200 mb-4 border border-emerald-500/30">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              {isBn ? 'রিয়েল-টাইম কৃষি বাজার দর ও ফেয়ার প্রাইসিং' : 'Real-Time Agri Spot Rates & Fair Pricing'}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {isBn ? 'জাতীয় পাইকারি মান্ডি বাজার দর' : 'National Mandi Wholesale Spot Market'}
            </h1>
            <p className="mt-3 text-base sm:text-lg text-emerald-100/90 leading-relaxed">
              {isBn
                ? 'বাংলাদেশের বিভিন্ন আড়ত ও পাইকারি হাট থেকে সংগৃহীত সরাসরি শস্য ও কৃষিপণ্যের দর। মধ্যস্বত্বভোগী ছাড়াই ন্যায্যমূল্য যাচাই করুন।'
                : 'Direct daily wholesale benchmark prices aggregated across regional agricultural hats and mandi arats. Verify fair pricing transparently.'}
            </p>
          </div>
          <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none">
            <Scale className="w-96 h-96 text-white" />
          </div>
        </div>

        {/* Section 1: Smart Fair Price Calculator */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isBn ? 'স্মার্ট ফেয়ার প্রাইস অ্যাডভাইজরি' : 'Smart Fair Price Advisory Engine'}
              </h2>
              <p className="text-sm text-slate-500">
                {isBn
                  ? 'আপনার ফসলের বিক্রয় মূল্য লিখুন এবং পাইকারি বাজার দরের সাথে তুলনা করে তাত্ক্ষণিক পরামর্শ পান'
                  : 'Enter your offered crop price to receive real-time comparative valuation against prevailing mandi benchmarks'}
              </p>
            </div>
          </div>

          <form onSubmit={handleCalculateAdvisory} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'ফসলের নাম (Crop)' : 'Crop Name'}
              </label>
              <input
                type="text"
                value={calcCrop}
                onChange={(e) => setCalcCrop(e.target.value)}
                placeholder={isBn ? 'যেমন: Miniket Rice' : 'e.g. Miniket Rice'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'আপনার মূল্য (৳ প্রতি কেজি/একক)' : 'Your Price (BDT / Unit)'}
              </label>
              <input
                type="number"
                step="0.5"
                value={calcPrice}
                onChange={(e) => setCalcPrice(e.target.value)}
                placeholder="70"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'জেলা (District)' : 'District (Optional)'}
              </label>
              <input
                type="text"
                value={calcDistrict}
                onChange={(e) => setCalcDistrict(e.target.value)}
                placeholder={isBn ? 'যেমন: Bogra' : 'e.g. Bogra'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isCalculating}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isCalculating
                  ? isBn
                    ? 'যাচাই করা হচ্ছে...'
                    : 'Analyzing...'
                  : isBn
                    ? 'ন্যায্য মূল্য যাচাই'
                    : 'Analyze Fair Price'}
              </button>
            </div>
          </form>

          {/* Advisory Result Banner */}
          {advisoryResult && (
            <div className="mt-6 p-5 rounded-2xl border transition-all animate-fadeIn bg-slate-50 border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  {advisoryResult.pricingStatus === 'FAIR_MARKET' && (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  )}
                  {advisoryResult.pricingStatus === 'BELOW_MARKET' && (
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  )}
                  {advisoryResult.pricingStatus === 'ABOVE_MARKET' && (
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">
                        {isBn ? advisoryResult.cropNameBn : advisoryResult.cropName}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          advisoryResult.pricingStatus === 'FAIR_MARKET'
                            ? 'bg-emerald-100 text-emerald-800'
                            : advisoryResult.pricingStatus === 'BELOW_MARKET'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {advisoryResult.pricingStatus === 'FAIR_MARKET' &&
                          (isBn ? 'ন্যায্য বাজার দর' : 'Fair Market Price')}
                        {advisoryResult.pricingStatus === 'BELOW_MARKET' &&
                          (isBn ? 'বাজার গড়ের চেয়ে কম' : 'Below Mandi Average')}
                        {advisoryResult.pricingStatus === 'ABOVE_MARKET' &&
                          (isBn ? 'বাজার গড়ের চেয়ে বেশি' : 'Above Mandi Average')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isBn ? 'বাজার:' : 'Benchmark Market:'} {advisoryResult.marketName} (
                      {advisoryResult.district})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-xs text-slate-500 block">
                      {isBn ? 'আপনার মূল্য' : 'Your Price'}
                    </span>
                    <span className="text-lg font-extrabold text-slate-900">
                      ৳{advisoryResult.offeredPrice}/{advisoryResult.priceUnit}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">
                      {isBn ? 'মন্ডি পাইকারি গড়' : 'Mandi Benchmark'}
                    </span>
                    <span className="text-lg font-extrabold text-emerald-700">
                      ৳{advisoryResult.benchmarkModalPrice}/{advisoryResult.priceUnit}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200/80">
                <span className="font-semibold text-slate-900">
                  {isBn ? 'পরামর্শ:' : 'Advisory Note:'}{' '}
                </span>
                {isBn ? advisoryResult.adviceBn : advisoryResult.adviceEn}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Mandi Price Board */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Filters Bar */}
          <div className="p-6 border-b border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isBn ? 'বর্তমান পাইকারি বাজার দর তালিকা' : 'Daily Mandi Wholesale Price Board'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isBn
                    ? 'বিভাগ ও ক্যাটাগরি অনুযায়ী শস্যের পাইকারি দর ফিল্টার করুন'
                    : 'Filter real-time commodity rates across divisions and product categories'}
                </p>
              </div>

              {/* Search box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isBn ? 'ফসল বা আড়ত খুঁজুন...' : 'Search crop or market...'}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Division Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {DIVISIONS.map((div) => (
                <button
                  key={div}
                  onClick={() => setSelectedDivision(div)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedDivision === div
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {div === 'ALL' ? (isBn ? 'সকল বিভাগ' : 'All Divisions') : div}
                </button>
              ))}
            </div>

            {/* Commodity Group Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {COMMODITY_GROUPS.map((grp) => (
                <button
                  key={grp.key}
                  onClick={() => setSelectedGroup(grp.key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedGroup === grp.key
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isBn ? grp.labelBn : grp.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Table of Mandi Rates */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">{isBn ? 'ফসল / পণ্য' : 'Crop / Commodity'}</th>
                  <th className="py-3.5 px-6">{isBn ? 'বিভাগ ও জেলা' : 'Region'}</th>
                  <th className="py-3.5 px-6">{isBn ? 'বাজার / আড়ত' : 'Wholesale Mandi'}</th>
                  <th className="py-3.5 px-6">{isBn ? 'পাইকারি গড় দর' : 'Modal Rate'}</th>
                  <th className="py-3.5 px-6">{isBn ? 'সর্বনিম্ন - সর্বোচ্চ' : 'Range'}</th>
                  <th className="py-3.5 px-6">{isBn ? 'মূল্য ধারা' : '7-Day Trend'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      {isBn ? 'বাজার দর লোড হচ্ছে...' : 'Loading mandi spot prices...'}
                    </td>
                  </tr>
                ) : prices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      {isBn
                        ? 'কোনো তথ্য পাওয়া যায়নি। অন্য ফিল্টার দিয়ে চেষ্টা করুন।'
                        : 'No mandi records found matching your filters.'}
                    </td>
                  </tr>
                ) : (
                  prices.map((record: MandiPriceRecord) => (
                    <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        <div>{isBn ? record.cropNameBn : record.cropName}</div>
                        <div className="text-xs font-normal text-slate-400">
                          {record.commodityGroup}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-slate-800">{record.district}</div>
                        <div className="text-xs text-slate-400">{record.division}</div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-800">
                        {record.marketName}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-base font-extrabold text-emerald-700">
                          ৳{Number(record.modalPrice).toFixed(0)}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">/{record.priceUnit}</span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                        ৳{Number(record.minPrice).toFixed(0)} - ৳
                        {Number(record.maxPrice).toFixed(0)}
                      </td>
                      <td className="py-4 px-6">{renderTrendIcon(record.trendDirection)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
