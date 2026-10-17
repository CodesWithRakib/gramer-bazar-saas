'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  MapPin,
  Thermometer,
  Award,
  Leaf,
  Snowflake,
  Layers,
  FileText,
  Scale,
  Compass,
  ArrowRight,
} from 'lucide-react';
import {
  useGetHoneyOverviewStatsQuery,
  useGetHoneyLotsQuery,
  useGetSuperfoodBatchesQuery,
  useCalculateHoneyPurityMutation,
  useCalculateApiaryMigrationYieldMutation,
  HoneyFloralSource,
  CalculateHoneyPurityResponse,
  CalculateApiaryMigrationYieldResponse,
} from '../honeyApiaryApi';

interface HoneyApiaryMarketplaceViewProps {
  lang: string;
}

export const HoneyApiaryMarketplaceView: React.FC<HoneyApiaryMarketplaceViewProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  // API Queries
  const { data: statsData, isLoading: statsLoading } = useGetHoneyOverviewStatsQuery();
  const { data: lotsData, isLoading: lotsLoading } = useGetHoneyLotsQuery();
  const { data: superfoodsData, isLoading: superfoodsLoading } = useGetSuperfoodBatchesQuery();

  // Mutations
  const [calculatePurity, { isLoading: isCalculatingPurity }] = useCalculateHoneyPurityMutation();
  const [calculateMigration, { isLoading: isCalculatingMigration }] = useCalculateApiaryMigrationYieldMutation();

  // Purity Calculator State
  const [calcMoisture, setCalcMoisture] = useState<number>(17.8);
  const [calcC4, setCalcC4] = useState<number>(-26.5);
  const [calcHmf, setCalcHmf] = useState<number>(12.0);
  const [calcFloralSource, setCalcFloralSource] = useState<HoneyFloralSource>('SUNDARBANS_KHALISHA_WILD');
  const [purityResult, setPurityResult] = useState<CalculateHoneyPurityResponse | null>(null);

  // Migration Yield Calculator State
  const [migBoxes, setMigBoxes] = useState<number>(50);
  const [migFloral, setMigFloral] = useState<HoneyFloralSource>('MUSTARD_BLOSSOM_CREAM');
  const [migDays, setMigDays] = useState<number>(30);
  const [migrationResult, setMigrationResult] = useState<CalculateApiaryMigrationYieldResponse | null>(null);

  const stats = statsData?.data;
  const lots = lotsData?.data || [];
  const superfoods = superfoodsData?.data || [];

  const handlePuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await calculatePurity({
        moisturePercentage: Number(calcMoisture),
        c4SugarIsotopeRatioPermil: Number(calcC4),
        hmfFreshnessMgPerKg: Number(calcHmf),
        floralSource: calcFloralSource,
      }).unwrap();
      if (res.success) {
        setPurityResult(res.data);
      }
    } catch {
      // Handled
    }
  };

  const handleMigrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await calculateMigration({
        beeBoxesCount: Number(migBoxes),
        floralSource: migFloral,
        daysInBloom: Number(migDays),
      }).unwrap();
      if (res.success) {
        setMigrationResult(res.data);
      }
    } catch {
      // Handled
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/30 backdrop-blur-md border border-amber-300/30 text-amber-100 text-xs sm:text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>
                {isBn
                  ? 'মৌচাষ, সুন্দরবনের প্রাকৃতিক মধু ও রয়্যাল জেলি খাঁটি মান নিয়ন্ত্রণ প্ল্যাটফর্ম'
                  : 'Honey & Apiary Traceability, Forest Beekeeping & Royal Jelly Engine'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
              {isBn
                ? 'শতভাগ খাঁটি মধু ও সুপারফুড কোল্ড-চেইন'
                : '100% Lab-Verified Honey & Royal Jelly Cold-Chain'}
            </h1>
            <p className="text-base sm:text-lg text-amber-100 font-light leading-relaxed mb-6">
              {isBn
                ? 'C4 কর্ন সিরাপ ভেজালমুক্ত আইসোটোপ ও আর্দ্রতা পরীক্ষা, সুন্দরবনের ঐতিহ্যবাহী মৌয়াল বন পারমিট এবং তাজা রয়্যাল জেলি -১৮°C সংরক্ষণ।'
                : 'C4 sugar isotope testing, moisture thresholds (<18.5%), Sundarbans Forest Department harvest permits, and -18°C sub-zero fresh royal jelly preservation.'}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`/${lang}/seller/honey-apiary`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-amber-900 font-semibold text-sm hover:bg-amber-50 shadow-md transition-all"
              >
                <Compass className="w-4 h-4" />
                <span>{isBn ? 'মৌ-খামার ও বাক্স ব্যবস্থাপনা' : 'Apiary Fleet Dashboard'}</span>
              </Link>
              <Link
                href={`/${lang}/customer/honey-apiary`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-700/60 hover:bg-amber-700 border border-amber-400/40 text-white font-medium text-sm transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isBn ? 'ল্যাব টেস্ট সনদ যাচাই' : 'Verify Honey Lab Pass'}</span>
              </Link>
            </div>
          </div>

          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
          <div className="absolute right-10 top-10 opacity-20 pointer-events-none">
            <Sparkles className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* Global Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-400">
                {isBn ? 'মোট সংগৃহীত মধু' : 'Total Harvested Honey'}
              </span>
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {statsLoading ? '...' : (stats?.totalHarvestedVolumeKg || 5070).toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-700 dark:text-slate-300">
                {isBn ? 'কেজি' : 'kg'}
              </span>
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 font-semibold">
              {statsLoading ? '...' : (stats?.totalForestWildHoneyKg || 1470).toLocaleString()} kg {isBn ? 'সুন্দরবনের বুনো মধু' : 'Wild Mangrove'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-400">
                {isBn ? 'গড় আর্দ্রতা (Moisture)' : 'Average Moisture %'}
              </span>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {statsLoading ? '...' : stats?.averageMoisturePercentage || 18.2}%
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isBn ? '১৮.৫% এর নিচে এক্সপোর্ট কোয়ালিটি' : '< 18.5% Export Grade'}</span>
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-400">
                {isBn ? 'সক্রিয় মৌ-বাক্স বহর' : 'Active Apiary Boxes'}
              </span>
              <Compass className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {statsLoading ? '...' : stats?.activeApiaryBoxesCount || 4}{' '}
              <span className="text-xs font-normal text-slate-700 dark:text-slate-300">
                {isBn ? 'ইউনিট' : 'boxes'}
              </span>
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 font-semibold">
              {isBn ? 'টাঙ্গাইল, দিনাজপুর ও শরীয়তপুর' : 'Tangail & Dinajpur'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-400">
                {isBn ? 'রয়্যাল জেলি 10-HDA %' : 'Royal Jelly 10-HDA'}
              </span>
              <Snowflake className="w-4 h-4 text-cyan-600" />
            </div>
            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
              {statsLoading ? '...' : stats?.averageTenHdaPercentage || 1.9}%
            </p>
            <p className="text-xs text-cyan-700 dark:text-cyan-400 mt-1 font-semibold">
              {isBn ? '-১৮°C ডিপ-ফ্রিজ প্রিজার্ভেশন' : '-18°C Deep Frozen'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Honey Purity Lab Analyzer & Seasonal Bloom Simulator */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Left Column (7 cols): C4 Carbon Isotope & Moisture Purity Diagnostic */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {isBn
                      ? 'মধু বিশুদ্ধতা ও C4 কর্ন সিরাপ ভেজাল শনাক্তকরণ ল্যাব'
                      : 'Honey Purity & C4 Sugar Isotope Lab Analyzer'}
                  </h2>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {isBn
                      ? 'কার্বন আইসোটোপ (δ13C ‰), আর্দ্রতা % ও HMF ফ্রেশনেস এনালাইজার'
                      : 'Isotopic ratio, moisture threshold, and HMF freshness grading'}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {isBn ? 'বিএসটিআই মান' : 'BSTI Verified'}
              </span>
            </div>

            <form onSubmit={handlePuritySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'ফুলের উৎস (Floral Source)' : 'Floral Source'}
                  </label>
                  <select
                    value={calcFloralSource}
                    onChange={(e) => setCalcFloralSource(e.target.value as HoneyFloralSource)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="SUNDARBANS_KHALISHA_WILD">সুন্দরবনের খলিশা বুনো মধু</option>
                    <option value="SUNDARBANS_GORAN_GEWA">সুন্দরবনের গরান ও গেওয়া মধু</option>
                    <option value="MUSTARD_BLOSSOM_CREAM">সরিষা ফুল প্রাকৃতিক ক্রিম মধু</option>
                    <option value="LITCHI_ORCHARD_BLOSSOM">দিনাজপুরের লিচু ফুল মধু</option>
                    <option value="BLACK_CUMIN_KALOJEERA">কালোজিরা ফুল ঔষধি মধু</option>
                    <option value="CORIANDER_BLOSSOM">ধনে ফুল সোনালী মধু</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'আর্দ্রতা শতকরা হার (Moisture %)' : 'Moisture Percentage (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="10.0"
                    max="30.0"
                    value={calcMoisture}
                    onChange={(e) => setCalcMoisture(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    {isBn ? 'আদর্শ মান: < ১৮.৫% (২০% এর বেশি হলে গাঁজন ঝুঁকি)' : 'Standard: < 18.5% (>20% risk of fermentation)'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'C4 কার্বন আইসোটোপ অনুপাত (δ13C ‰)' : 'C4 Carbon Isotope (δ13C ‰)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="-35.0"
                    max="-5.0"
                    value={calcC4}
                    onChange={(e) => setCalcC4(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    {isBn ? 'খাঁটি মধু: -২৫‰ থেকে -২৮‰ (> -২৩.৫‰ হলে কর্ন সিরাপ ভেজাল)' : 'Pure: -25‰ to -28‰ (> -23.5‰ indicates HFCS adulteration)'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'HMF ফ্রেশনেস (mg/kg)' : 'HMF Freshness (mg/kg)'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1.0"
                    max="150.0"
                    value={calcHmf}
                    onChange={(e) => setCalcHmf(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    {isBn ? 'তাজা কাঁচা মধু: < ২০ mg/kg (উত্তপ্ত/পুরনো: > ৪০ mg/kg)' : 'Fresh Raw Honey: < 20 mg/kg (Heated/aged: > 40 mg/kg)'}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isCalculatingPurity}
                className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isCalculatingPurity ? (
                  <span>{isBn ? 'পরীক্ষা করা হচ্ছে...' : 'Analyzing Sample...'}</span>
                ) : (
                  <>
                    <Scale className="w-4 h-4" />
                    <span>{isBn ? 'খাঁটি মান ও ল্যাব রিপোর্ট পরীক্ষা করুন' : 'Run Purity Diagnostic'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Purity Calculation Result */}
            {purityResult && (
              <div className="mt-6 p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-amber-200 dark:border-amber-900">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        purityResult.purityGrade === 'GRADE_A_RAW_UNPROCESSED'
                          ? 'bg-emerald-600 text-white'
                          : purityResult.purityGrade === 'GRADE_B_DOMESTIC_STANDARD'
                          ? 'bg-blue-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {purityResult.purityGrade.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border text-slate-700 dark:text-slate-300">
                      {isBn ? 'বিশুদ্ধতা স্কোর:' : 'Purity Score:'} {purityResult.purityScoreOutOf100}/100
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-700 dark:text-slate-300 block font-medium">
                      {isBn ? 'ন্যায্য খুচরা দর' : 'Fair Retail Value'}
                    </span>
                    <span className="text-xl font-black text-amber-700 dark:text-amber-300">
                      ৳{purityResult.recommendedRetailPriceBdt} /kg
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center mb-4">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 block font-medium">
                      {isBn ? 'আর্দ্রতা মান' : 'Moisture Status'}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        purityResult.isFermentationRisk ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {purityResult.moisturePercentage}%{' '}
                      {purityResult.isFermentationRisk ? '(উচ্চ)' : '(নিরাপদ)'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 block font-medium">
                      {isBn ? 'C4 কর্ন সিরাপ' : 'C4 Corn Syrup'}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        purityResult.isC4Adulterated ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {purityResult.isC4Adulterated
                        ? isBn
                          ? 'শনাক্ত (ভেজাল)'
                          : 'Adulterated'
                        : isBn
                        ? 'নেগেটিভ (খাঁটি)'
                        : 'Negative (Pure)'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 block font-medium">
                      {isBn ? 'বিএসটিআই মানদণ্ড' : 'BSTI Standard'}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        purityResult.bstiCompliance ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {purityResult.bstiCompliance ? 'উত্তীর্ণ (Passed)' : 'অনুপযুক্ত (Failed)'}
                    </span>
                  </div>
                </div>

                {purityResult.adulterationWarning ? (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                      {purityResult.adulterationWarning}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    {purityResult.auditExplanation}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Seasonal Apiary Migration & Pollination Simulator */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isBn
                    ? 'ভ্রাম্যমাণ মৌ-বাক্স উৎপাদন ও পরাগায়ন সিমুলেটর'
                    : 'Migratory Apiary Yield & Pollination Forecast'}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {isBn
                    ? 'সরিষা ও লিচু ফুলে মৌমাছির পরাগায়নে কৃষকের ফলন বৃদ্ধি ও মধু উৎপাদন হিসাব'
                    : 'Forecast seasonal honey yield and host farmer cross-pollination gains'}
                </p>
              </div>
            </div>

            <form onSubmit={handleMigrationSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'মৌ-বাক্সের সংখ্যা' : 'Bee Boxes Count'}
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={migBoxes}
                    onChange={(e) => setMigBoxes(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'ফুলের মৌসুম' : 'Crop Bloom'}
                  </label>
                  <select
                    value={migFloral}
                    onChange={(e) => setMigFloral(e.target.value as HoneyFloralSource)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="MUSTARD_BLOSSOM_CREAM">সরিষা ফুল (টাঙ্গাইল/মানিকগঞ্জ)</option>
                    <option value="LITCHI_ORCHARD_BLOSSOM">লিচু মুকুল (দিনাজপুর/পাবনা)</option>
                    <option value="BLACK_CUMIN_KALOJEERA">কালোজিরা ফুল (শরীয়তপুর)</option>
                    <option value="SUNDARBANS_KHALISHA_WILD">সুন্দরবন খলিশা ফুল</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'পুষ্পায়ন কাল (দিন)' : 'Days in Bloom'}
                  </label>
                  <input
                    type="number"
                    min="7"
                    max="60"
                    value={migDays}
                    onChange={(e) => setMigDays(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCalculatingMigration}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isCalculatingMigration ? (
                  <span>{isBn ? 'হিসাব করা হচ্ছে...' : 'Forecasting...'}</span>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span>{isBn ? 'ফলন ও রাজস্ব অনুমান দেখুন' : 'Forecast Yield & Revenue'}</span>
                  </>
                )}
              </button>
            </form>

            {migrationResult && (
              <div className="mt-6 p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-emerald-200 dark:border-emerald-900">
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {isBn
                      ? `আনুমানিক মধু ফলন: ${migrationResult.estimatedYieldKg} কেজি`
                      : `Estimated Yield: ${migrationResult.estimatedYieldKg} kg`}
                  </span>
                  <span className="text-sm font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
                    +{migrationResult.hostFarmerCropBoostPercent}% {isBn ? 'ফসল বৃদ্ধি' : 'Crop Boost'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center mb-3">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 block font-medium">
                      {isBn ? 'মোট রাজস্ব' : 'Gross Revenue'}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      ৳{migrationResult.estimatedGrossRevenueBdt.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 block font-medium">
                      {isBn ? 'পরিবহণ ও মাইগ্রেশন খরচ' : 'Relocation Cost'}
                    </span>
                    <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                      ৳{migrationResult.estimatedRelocationCostBdt.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 block font-medium">
                      {isBn ? 'নিট লাভ (Net Profit)' : 'Net Profit'}
                    </span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      ৳{migrationResult.netProfitBdt.toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                  {migrationResult.pollinationEcosystemValueNote}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Fresh Frozen Royal Jelly & Superfood Vault */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300">
                  <Snowflake className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isBn ? 'রয়্যাল জেলি ও সুপারফুড কোল্ড ভল্ট' : 'Royal Jelly Superfood Vault'}
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {isBn ? '-১৮°C সাব-জিরো কোল্ড চেইন সংরক্ষণ' : '-18°C Sub-Zero Cold-Chain Assurance'}
                  </p>
                </div>
              </div>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>

            {superfoodsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : superfoods.length === 0 ? (
              <p className="text-sm text-slate-700 dark:text-slate-300 text-center py-8">
                {isBn ? 'কোনো সুপারফুড ব্যাচ তালিকাভুক্ত নেই।' : 'No superfood batches available.'}
              </p>
            ) : (
              <div className="space-y-4">
                {superfoods.map((sf) => (
                  <div
                    key={sf.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-cyan-300 dark:hover:border-cyan-800 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                            {sf.batchNumber}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 font-semibold">
                            {sf.productType.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
                          {sf.producerName}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-bold text-slate-900 dark:text-white block">
                          ৳{sf.priceBdt}
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-400">
                          {sf.weightGrams}g
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300 pt-3 border-t border-slate-200 dark:border-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-cyan-500" />
                        <span>{sf.storageTemperatureCelsius}°C Cold-Chain</span>
                      </div>
                      {sf.tenHdaPercentage > 0 ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>10-HDA: {sf.tenHdaPercentage}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>স্টক: {sf.availableStockCount} টি</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Honey Harvest Lots Marketplace Section */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isBn ? 'সরাসরি মৌয়াল ও মৌ-খামার থেকে' : 'Direct From Beekeepers & Forest Mouwals'}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isBn
                ? 'ল্যাব সনদ ও বন পারমিটসহ প্রাকৃতিক খাঁটি মধু লট'
                : 'Certified Honey Harvest Lots'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
              {isBn
                ? 'সুন্দরবনের খলিশা, গরান, সরিষা ক্রিম ও লিচু বাগানের ১০০% ভেজালহীন কাঁচা মধু'
                : 'Sundarbans Khalisha mangrove wild honey, Tangail mustard cream, and Dinajpur litchi lots.'}
            </p>
          </div>
          <Link
            href={`/${lang}/seller/honey-apiary`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all"
          >
            <span>{isBn ? 'নতুন লট তালিকাভুক্ত করুন' : 'List Harvest Lot'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {lotsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : lots.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
              {isBn ? 'কোনো মধুর লট পাওয়া যায়নি।' : 'No honey harvest lots found.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lots.map((lot) => (
              <div
                key={lot.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {lot.lotNumber}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        lot.isForestCertifiedWild
                          ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {lot.isForestCertifiedWild
                        ? isBn
                          ? 'সুন্দরবনের বুনো চাক'
                          : 'Wild Mangrove'
                        : isBn
                        ? 'মৌ-বাক্স খামার'
                        : 'Apiary Farm'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    {lot.floralSource.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mb-3 font-medium">
                    {lot.beekeeperName} ({lot.district})
                  </p>

                  {/* Quality Badges */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 mb-4 text-xs font-medium">
                    <div>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 block">
                        {isBn ? 'আর্দ্রতা' : 'Moisture'}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {lot.moisturePercentage}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 block">
                        {isBn ? 'HMF মান' : 'HMF'}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {lot.hmfFreshnessMgPerKg} mg/kg
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1 mb-5 font-medium">
                    {lot.labCertificateNo && (
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span>ল্যাব সনদ: {lot.labCertificateNo}</span>
                      </div>
                    )}
                    {lot.forestDeptPermitNo && (
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>বন পারমিট: {lot.forestDeptPermitNo}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {isBn ? 'মজুত:' : 'Stock:'} {lot.stockQuantityKg} kg
                    </span>
                    <span className="text-lg font-black text-amber-700 dark:text-amber-400">
                      ৳{lot.wholesalePricePerKgBdt} /kg
                    </span>
                  </div>

                  <button className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isBn ? 'খাঁটি মধু অর্ডার করুন' : 'Order Honey Lot'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
