'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Droplets,
  Thermometer,
  Activity,
  Calculator,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Scale,
  Truck,
  Wallet,
  ArrowRight,
  Flame,
  Award,
} from 'lucide-react';
import {
  useGetDairyOverviewStatsQuery,
  useGetChillingVatsQuery,
  useGetFeedPoolsQuery,
  useCalculateMilkRateMutation,
  useCalculateFeedSavingsMutation,
  useJoinFeedPoolMutation,
  MilkType,
  FeedCategory,
  CalculateMilkRateResponse,
  CalculateFeedSavingsResponse,
} from '../dairySupplyApi';

interface DairySupplyHubViewProps {
  lang: string;
}

export const DairySupplyHubView: React.FC<DairySupplyHubViewProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  // API Queries
  const { data: statsData, isLoading: statsLoading } = useGetDairyOverviewStatsQuery();
  const { data: vatsData, isLoading: vatsLoading } = useGetChillingVatsQuery();
  const { data: poolsData, isLoading: poolsLoading } = useGetFeedPoolsQuery();

  // Mutations
  const [calculateMilkRate, { isLoading: isCalculatingRate }] = useCalculateMilkRateMutation();
  const [calculateFeedSavings, { isLoading: isCalculatingFeed }] = useCalculateFeedSavingsMutation();
  const [joinFeedPool, { isLoading: isJoiningPool }] = useJoinFeedPoolMutation();

  // Milk Rate Calculator State
  const [calcMilkType, setCalcMilkType] = useState<MilkType>('COW_MILK');
  const [calcFat, setCalcFat] = useState<number>(4.2);
  const [calcClr, setCalcClr] = useState<number>(29.5);
  const [calcVolume, setCalcVolume] = useState<number>(20);
  const [rateResult, setRateResult] = useState<CalculateMilkRateResponse | null>(null);

  // Feed Savings Calculator State
  const [feedCategory, setFeedCategory] = useState<FeedCategory>('MUSTARD_OIL_CAKE');
  const [cowsCount, setCowsCount] = useState<number>(5);
  const [feedResult, setFeedResult] = useState<CalculateFeedSavingsResponse | null>(null);

  // Join Feed Pool State
  const [joiningPoolId, setJoiningPoolId] = useState<string | null>(null);
  const [joinOrderKg, setJoinOrderKg] = useState<number>(100);
  const [joinSuccessMsg, setJoinSuccessMsg] = useState<string | null>(null);

  const stats = statsData?.data;
  const vats = vatsData?.data || [];
  const feedPools = poolsData?.data || [];

  const handleCalculateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await calculateMilkRate({
        milkType: calcMilkType,
        fatPercentage: Number(calcFat),
        lactometerReadingCorrected: Number(calcClr),
        volumeLiters: Number(calcVolume),
      }).unwrap();
      if (res.success) {
        setRateResult(res.data);
      }
    } catch {
      // Error handled
    }
  };

  const handleCalculateFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await calculateFeedSavings({
        feedCategory,
        herdCowsCount: Number(cowsCount),
      }).unwrap();
      if (res.success) {
        setFeedResult(res.data);
      }
    } catch {
      // Error handled
    }
  };

  const handleJoinPool = async (poolId: string) => {
    try {
      const res = await joinFeedPool({
        poolId,
        orderedKg: Number(joinOrderKg),
      }).unwrap();
      if (res.success) {
        setJoinSuccessMsg(
          isBn
            ? `সফলভাবে সমবায় পুলে ${joinOrderKg} কেজি ফিড অর্ডার যুক্ত হয়েছে!`
            : `Successfully committed ${joinOrderKg} kg to livestock feed group-buy pool!`
        );
        setJoiningPoolId(null);
        setTimeout(() => setJoinSuccessMsg(null), 4000);
      }
    } catch {
      // Error handled
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Banner / Hero */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-cyan-700 to-sky-800 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/30 backdrop-blur-md border border-blue-300/30 text-blue-100 text-xs sm:text-sm font-medium mb-4">
              <Droplets className="w-4 h-4 text-cyan-300" />
              <span>
                {isBn
                  ? 'দুগ্ধ সমবায় সরবরাহ শৃঙ্খল ও আইওটি চিলিং হাব'
                  : 'Dairy Cooperative Cold-Chain Supply Network'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
              {isBn
                ? 'খাঁটি দুধের ন্যায্য দর ও কোল্ড-চেইন স্মার্ট ডেইরি'
                : 'Fair Milk Pricing, Chilling IoT & Smallholder Feed Pooling'}
            </h1>
            <p className="text-base sm:text-lg text-blue-100 font-light leading-relaxed mb-6">
              {isBn
                ? 'রিচমন্ডস ফর্মুলায় ল্যাকটোমিটার (CLR) ও ফ্যাট ভিত্তিক স্বয়ংক্রিয় দর নির্ধারণ, বাল্ক মিল্ক কুলার (৪°C) আইওটি নজরদারি এবং সমবায় পশুখাদ্য বাল্ক পুলে ২৫-৩০% খরচ সাশ্রয়।'
                : "Transparent milk valuation using Richmond's SNF formula, 4.0°C Bulk Milk Cooler IoT telemetry with souring alarms, and collective smallholder feed group-buying."}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`/${lang}/seller/dairy-supply`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-800 font-semibold text-sm hover:bg-blue-50 shadow-md transition-all"
              >
                <Scale className="w-4 h-4" />
                <span>{isBn ? 'সমবায় দুধ সংগ্রহ ডেস্ক' : 'Cooperative Intake Desk'}</span>
              </Link>
              <Link
                href={`/${lang}/customer/dairy-supply`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600/60 hover:bg-blue-600 border border-blue-400/40 text-white font-medium text-sm transition-all"
              >
                <Wallet className="w-4 h-4" />
                <span>{isBn ? 'খামারি পাসবুক ও ওয়ালেট' : 'Farmer Milk Passbook'}</span>
              </Link>
            </div>
          </div>

          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
          <div className="absolute right-10 top-10 opacity-20 pointer-events-none">
            <Droplets className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* Global Overview Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-400">
                {isBn ? 'সক্রিয় চিলিং ভ্যাট (BMCs)' : 'Active Chilling Vats'}
              </span>
              <Thermometer className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {statsLoading ? '...' : stats?.activeChillingVatsCount || 4}{' '}
              <span className="text-xs font-normal text-slate-700 dark:text-slate-300">
                {isBn ? 'ইউনিট' : 'units'}
              </span>
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isBn ? '৪.০°C চিল্ড স্ট্যান্ডার্ড' : '4.0°C Optimal Standard'}</span>
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-400">
                {isBn ? 'চিল্ড দুধ মজুত' : 'Chilled Stored Milk'}
              </span>
              <Activity className="w-4 h-4 text-cyan-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {statsLoading ? '...' : (stats?.totalChilledVolumeLiters || 12000).toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-700 dark:text-slate-300">
                {isBn ? 'লিটার' : 'Liters'}
              </span>
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isBn ? 'বাঘাবাড়ি, বেড়া ও তালা' : 'Baghabari & Bera Hubs'}</span>
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-400">
                {isBn ? 'গড় ফ্যাট ও এসএনএফ' : 'Avg Fat & SNF %'}
              </span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {statsLoading ? '...' : stats?.averageMilkFatPercentage || 4.2}%{' '}
              <span className="text-xs font-normal text-slate-700 dark:text-slate-300">
                / {statsLoading ? '...' : stats?.averageSnfPercentage || 8.4}%
              </span>
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 font-semibold">
              {isBn ? 'প্রিমিয়াম গ্রেড-এ মানদণ্ড' : 'Grade-A Premium Quality'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-400">
                {isBn ? 'পশুখাদ্য সমবায় সাশ্রয়' : 'Feed Pool Farmer Savings'}
              </span>
              <Flame className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ৳{statsLoading ? '...' : (stats?.totalFeedSavingsBdt || 116250).toLocaleString()}
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-semibold">
              {isBn ? 'খামারি প্রতি ২৫-৩০% সাশ্রয়' : '20-30% Feed Cost Reduction'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Calculator & IoT Chilling Vats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Left Column (7 cols): Richmond's Formula & Milk Rate Calculator */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {isBn
                      ? 'রিচমন্ডস ফর্মুলা: দুধের ফ্যাট ও এসএনএফ রেট ক্যালকুলেটর'
                      : "Richmond's Formula Milk Pricing & SNF Calculator"}
                  </h2>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    SNF% = (CLR / 4) + (0.2 × Fat%) + 0.36
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {isBn ? 'স্বচ্ছ মূল্যায়ন' : 'Real-time Grade'}
              </span>
            </div>

            <form onSubmit={handleCalculateRate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'দুধের ধরন' : 'Milk Type'}
                  </label>
                  <select
                    value={calcMilkType}
                    onChange={(e) => setCalcMilkType(e.target.value as MilkType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="COW_MILK">{isBn ? 'গাভীর দুধ (Cow Milk)' : 'Cow Milk'}</option>
                    <option value="BUFFALO_MILK">
                      {isBn ? 'মহিষের দুধ (Buffalo Milk)' : 'Buffalo Milk'}
                    </option>
                    <option value="GOAT_MILK">{isBn ? 'ছাগলের দুধ (Goat Milk)' : 'Goat Milk'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'দুধের পরিমাণ (লিটার)' : 'Volume (Liters)'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={calcVolume}
                    onChange={(e) => setCalcVolume(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn
                      ? 'ল্যাকটোমিটার রিডিং (CLR @ 20°C)'
                      : 'Corrected Lactometer Reading (CLR)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="36"
                    value={calcClr}
                    onChange={(e) => setCalcClr(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    {isBn ? 'আদর্শ মান: ২৭.০ - ৩২.০ (২৬ এর নিচে পানি ভেজাল)' : 'Standard: 27 - 32 (<26 indicates water dilution)'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'ফ্যাট শতাংশ (Fat %)' : 'Fat Percentage (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="2.0"
                    max="12.0"
                    value={calcFat}
                    onChange={(e) => setCalcFat(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    {isBn ? 'বেস ৩.৫% ফ্যাট + প্রতি ০.৫% ফ্যাট বৃদ্ধিতে বোনাস' : 'Base 3.5% fat + ৳3.5 per 0.5% fat bonus'}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isCalculatingRate}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isCalculatingRate ? (
                  <span>{isBn ? 'হিসাব করা হচ্ছে...' : 'Calculating...'}</span>
                ) : (
                  <>
                    <Scale className="w-4 h-4" />
                    <span>{isBn ? 'ন্যায্য দর ও এসএনএফ হিসাব করুন' : 'Calculate Fair Rate & Payout'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Live Calculation Output Card */}
            {rateResult && (
              <div className="mt-6 p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-blue-200 dark:border-blue-900">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-600 text-white">
                      {rateResult.qualityGrade}
                    </span>
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                      {rateResult.richmondsFormula}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-700 dark:text-slate-300 block font-medium">
                      {isBn ? 'প্রতি লিটার দর' : 'Rate per Liter'}
                    </span>
                    <span className="text-xl font-black text-blue-700 dark:text-blue-300">
                      ৳{rateResult.ratePerLiterBdt} /L
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-4">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 block font-medium">
                      {isBn ? 'হিসাবকৃত এসএনএফ (SNF)' : 'Calculated SNF'}
                    </span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {rateResult.calculatedSnfPercentage}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 block font-medium">
                      {isBn ? 'ফ্যাট বোনাস' : 'Fat Bonus'}
                    </span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      +৳{rateResult.fatBonusBdt}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 block font-medium">
                      {isBn ? 'এসএনএফ বোনাস' : 'SNF Bonus'}
                    </span>
                    <span className="text-base font-bold text-cyan-600 dark:text-cyan-400">
                      +৳{rateResult.snfBonusBdt}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 block font-medium">
                      {isBn ? 'মোট পাওনা (Payout)' : 'Total Payout'}
                    </span>
                    <span className="text-base font-bold text-blue-700 dark:text-blue-300">
                      ৳{rateResult.totalPayoutAmountBdt}
                    </span>
                  </div>
                </div>

                {rateResult.adulterationWarning && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                      {rateResult.adulterationWarning}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cattle Feed Group Savings Simulator */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isBn
                    ? 'পশুখাদ্য সমবায় বাল্ক ক্রয় সাশ্রয় সিমুলেটর'
                    : 'Smallholder Feed Bulk Pooling Cost Simulator'}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {isBn
                    ? 'সরাসরি মিল-গেট বাল্ক পুলে সরিষার খৈল ও ভুট্টার সাইলেজ ক্রয়ে ২৫-৩০% সাশ্রয়'
                    : 'Direct mill-gate bulk aggregation reducing feeding costs by 20-30%'}
                </p>
              </div>
            </div>

            <form onSubmit={handleCalculateFeed} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'খাদ্যের প্রকার' : 'Feed Category'}
                  </label>
                  <select
                    value={feedCategory}
                    onChange={(e) => setFeedCategory(e.target.value as FeedCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="MUSTARD_OIL_CAKE">
                      {isBn ? 'সরিষার খৈল (Mustard Oil Cake)' : 'Mustard Oil Cake'}
                    </option>
                    <option value="WHEAT_BRAN_COARSE">
                      {isBn ? 'মোটা গমের ভুষি (Wheat Bran)' : 'Wheat Bran'}
                    </option>
                    <option value="CORN_SILAGE_FERMENTED">
                      {isBn ? 'ফার্মেন্টেড সাইলেজ (Fermented Corn Silage)' : 'Corn Silage'}
                    </option>
                    <option value="PELLETTED_DAIRY_FEED">
                      {isBn ? 'ডেইরি প্যালেট ফিড (Pelleted Feed)' : 'Pelleted Dairy Feed'}
                    </option>
                    <option value="CALCIUM_MINERAL_PREMIX">
                      {isBn ? 'মিনারেল প্রিমিক্স (Mineral Premix)' : 'Calcium Mineral Premix'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'খামারে গাভীর সংখ্যা' : 'Number of Milk Cows'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={cowsCount}
                    onChange={(e) => setCowsCount(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCalculatingFeed}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isCalculatingFeed ? (
                  <span>{isBn ? 'হিসাব করা হচ্ছে...' : 'Calculating...'}</span>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span>{isBn ? 'মাসিক নিট সাশ্রয় দেখুন' : 'Calculate Monthly Feed Savings'}</span>
                  </>
                )}
              </button>
            </form>

            {feedResult && (
              <div className="mt-6 p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-emerald-200 dark:border-emerald-900">
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {isBn
                      ? `মাসিক চাহিদা: ${feedResult.totalMonthlyDemandKg} কেজি`
                      : `Monthly Demand: ${feedResult.totalMonthlyDemandKg} kg`}
                  </span>
                  <span className="text-sm font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
                    {feedResult.savingsPercentage}% {isBn ? 'সাশ্রয়' : 'Cheaper'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center mb-3">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 block font-medium">
                      {isBn ? 'খুচরা বাজার খরচ' : 'Retail Market Cost'}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 line-through">
                      ৳{feedResult.retailMonthlyExpenseBdt.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 block font-medium">
                      {isBn ? 'সমবায় বাল্ক খরচ' : 'Cooperative Bulk Cost'}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      ৳{feedResult.bulkPoolMonthlyExpenseBdt.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 block font-medium">
                      {isBn ? 'মাসিক নিট সাশ্রয়' : 'Net Monthly Savings'}
                    </span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      ৳{feedResult.netMonthlySavingsBdt.toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  {feedResult.recommendedAction}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Real-Time Bulk Milk Cooler (BMC) IoT Telemetry */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300">
                  <Thermometer className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isBn ? 'মিল্ক চিলিং সেন্টার আইওটি ড্যাশবোর্ড' : 'Chilling Center BMC IoT Vats'}
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {isBn ? '৪.০°C কোল্ড-চেইন ও তাপমাত্রা পর্যবেক্ষণ' : 'Live 4.0°C Cold-Chain Telemetry'}
                  </p>
                </div>
              </div>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            {vatsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : vats.length === 0 ? (
              <p className="text-sm text-slate-700 dark:text-slate-300 text-center py-8">
                {isBn ? 'কোনো চিলিং ভ্যাট সক্রিয় নেই।' : 'No active chilling vats detected.'}
              </p>
            ) : (
              <div className="space-y-4">
                {vats.map((vat) => {
                  const isAlarm = vat.isAlarmActive || vat.currentTemperatureCelsius > 7.0;
                  const capacityPercent = Math.min(
                    100,
                    Math.round((vat.currentVolumeLiters / vat.capacityLiters) * 100)
                  );

                  return (
                    <div
                      key={vat.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isAlarm
                          ? 'border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                              {vat.vatCode}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {vat.district}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                            {vat.chillingCenterName}
                          </p>
                        </div>

                        {/* Temperature Pill */}
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm shadow-sm ${
                            isAlarm
                              ? 'bg-rose-600 text-white animate-pulse'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          <Thermometer className="w-4 h-4" />
                          <span>{vat.currentTemperatureCelsius}°C</span>
                        </div>
                      </div>

                      {/* Volume Progress Bar */}
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 font-medium">
                          <span>
                            {vat.currentVolumeLiters.toLocaleString()} /{' '}
                            {vat.capacityLiters.toLocaleString()} L
                          </span>
                          <span className="font-semibold">{capacityPercent}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              capacityPercent > 90 ? 'bg-amber-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${capacityPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Agitator & Compressor Status */}
                      <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-blue-500" />
                          <span>{isBn ? 'এজিটেটর:' : 'Agitator:'} {vat.agitatorRpm} RPM</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              vat.compressorStatus === 'RUNNING'
                                ? 'bg-emerald-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          <span>{vat.compressorStatus}</span>
                        </div>
                      </div>

                      {/* Alarm banner if triggered */}
                      {isAlarm && vat.alarmReason && (
                        <div className="mt-3 p-2 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{vat.alarmReason}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Livestock Feed Group-Buying Pools Section */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isBn ? 'সমবায় বাল্ক সাশ্রয়' : 'Cooperative Bulk Aggregation'}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isBn
                ? 'পশুখাদ্য সমবায় বাল্ক ক্রয় পুল (লাইভ ক্যাম্পেইন)'
                : 'Livestock Feed Group-Buying Pools'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
              {isBn
                ? 'সরিষার খৈল, গমের ভুষি ও ভুট্টা সাইলেজ সরাসরি মিল গেট থেকে বাল্ক অর্ডারে সংগ্রহ করুন'
                : 'Join fellow dairy farmers to unlock 20-30% volume discounts directly from feed mills.'}
            </p>
          </div>
          <Link
            href={`/${lang}/seller/dairy-supply`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all"
          >
            <span>{isBn ? 'নতুন ফিড পুল খুলুন' : 'Create Feed Pool'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {joinSuccessMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-medium flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{joinSuccessMsg}</span>
          </div>
        )}

        {poolsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : feedPools.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
              {isBn ? 'বর্তমানে কোনো সক্রিয় ফিড পুল নেই।' : 'No active feed pools currently.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {feedPools.map((pool) => {
              const progressPercent = Math.min(
                100,
                Math.round((pool.committedVolumeKg / pool.targetVolumeKg) * 100)
              );
              const savingsPerKg = pool.retailMarketPricePerKgBdt - pool.discountedPricePerKgBdt;

              return (
                <div
                  key={pool.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {pool.poolCode}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                        ৳{savingsPerKg} / {isBn ? 'কেজি সাশ্রয়' : 'kg Saved'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                      {pool.feedCategory.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mb-4 font-medium">
                      {pool.feedBrandOrMillName}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 font-medium">
                        <span>
                          {pool.committedVolumeKg.toLocaleString()} /{' '}
                          {pool.targetVolumeKg.toLocaleString()} kg
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {progressPercent}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Pricing Grid */}
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 mb-4">
                      <div>
                        <span className="text-[11px] text-slate-700 dark:text-slate-300 block font-medium">
                          {isBn ? 'সমবায় বাল্ক রেট' : 'Bulk Pool Price'}
                        </span>
                        <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                          ৳{pool.discountedPricePerKgBdt}/kg
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-700 dark:text-slate-300 block font-medium">
                          {isBn ? 'খুচরা বাজার দর' : 'Retail Price'}
                        </span>
                        <span className="text-base font-semibold text-slate-700 dark:text-slate-300 line-through">
                          ৳{pool.retailMarketPricePerKgBdt}/kg
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1 mb-5 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-blue-500" />
                        <span>{pool.deliveryHubLocation}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-amber-500" />
                        <span>
                          {isBn
                            ? `${pool.currentParticipantsCount} জন খামারি যুক্ত হয়েছেন`
                            : `${pool.currentParticipantsCount} farmers joined`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Join Action */}
                  {joiningPoolId === pool.id ? (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium">
                        <span>{isBn ? 'অর্ডারের পরিমাণ (কেজি):' : 'Order Amount (kg):'}</span>
                        <input
                          type="number"
                          step="25"
                          min="25"
                          max="2000"
                          value={joinOrderKg}
                          onChange={(e) => setJoinOrderKg(Number(e.target.value))}
                          className="w-20 px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-center"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleJoinPool(pool.id)}
                          disabled={isJoiningPool}
                          className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
                        >
                          {isJoiningPool ? '...' : isBn ? 'নিশ্চিত করুন' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setJoiningPoolId(null)}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs"
                        >
                          {isBn ? 'বাতিল' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setJoiningPoolId(pool.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{isBn ? 'সমবায় পুলে যুক্ত হোন' : 'Join Group-Buy Pool'}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
