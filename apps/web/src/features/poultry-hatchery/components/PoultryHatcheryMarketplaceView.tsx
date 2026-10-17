'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Egg,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  MapPin,
  Thermometer,
  Wind,
  Layers,
  FileCheck,
  Scale,
  Sparkles,
  ArrowRight,
  Phone,
  Clock,
  Gauge,
  Flame,
} from 'lucide-react';
import {
  useGetPoultryOverviewStatsQuery,
  useGetPoultryBatchesQuery,
  useGetTableEggLotsQuery,
  useGetBrooderTelemetryShedsQuery,
  useCalculateFlockFcrMutation,
  useEvaluateEggGradingMutation,
  PoultryBreedType,
  CalculateFlockFcrResponse,
  EvaluateEggGradingResponse,
} from '../poultryHatcheryApi';

interface PoultryHatcheryMarketplaceViewProps {
  lang: string;
}

export const PoultryHatcheryMarketplaceView: React.FC<PoultryHatcheryMarketplaceViewProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  // API Queries
  const { data: statsData, isLoading: statsLoading } = useGetPoultryOverviewStatsQuery();
  const { data: batchesData, isLoading: batchesLoading } = useGetPoultryBatchesQuery();
  const { data: eggLotsData, isLoading: eggLotsLoading } = useGetTableEggLotsQuery();
  const { data: shedsData, isLoading: shedsLoading } = useGetBrooderTelemetryShedsQuery();

  // Mutations
  const [calculateFcr, { isLoading: isCalculatingFcr }] = useCalculateFlockFcrMutation();
  const [evaluateEgg, { isLoading: isEvaluatingEgg }] = useEvaluateEggGradingMutation();

  // FCR Calculator State
  const [calcBreed, setCalcBreed] = useState<PoultryBreedType>('BROILER_COBB_500');
  const [initialChicks, setInitialChicks] = useState<number>(5000);
  const [currentLive, setCurrentLive] = useState<number>(4880);
  const [feedConsumedKg, setFeedConsumedKg] = useState<number>(14600);
  const [avgWeightGrams, setAvgWeightGrams] = useState<number>(1950);
  const [fcrResult, setFcrResult] = useState<CalculateFlockFcrResponse | null>(null);

  // Egg Grading Calculator State
  const [eggWeightGrams, setEggWeightGrams] = useState<number>(62.5);
  const [totalEggsCount, setTotalEggsCount] = useState<number>(7200);
  const [eggResult, setEggResult] = useState<EvaluateEggGradingResponse | null>(null);

  // Filters
  const [selectedBreedFilter, setSelectedBreedFilter] = useState<string>('ALL');

  const stats = statsData?.data;
  const batches = batchesData?.data || [];
  const eggLots = eggLotsData?.data || [];
  const sheds = shedsData?.data || [];

  const handleFcrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await calculateFcr({
        breedType: calcBreed,
        initialChickCount: Number(initialChicks),
        currentLiveCount: Number(currentLive),
        cumulativeFeedConsumedKg: Number(feedConsumedKg),
        averageWeightGrams: Number(avgWeightGrams),
      }).unwrap();
      if (res.success) {
        setFcrResult(res.data);
      }
    } catch {
      // Handled gracefully
    }
  };

  const handleEggGradingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await evaluateEgg({
        averageEggWeightGrams: Number(eggWeightGrams),
        totalEggsCount: Number(totalEggsCount),
      }).unwrap();
      if (res.success) {
        setEggResult(res.data);
      }
    } catch {
      // Handled gracefully
    }
  };

  const filteredBatches = batches.filter((b) => {
    if (selectedBreedFilter === 'ALL') return true;
    return b.breedType === selectedBreedFilter;
  });

  const getBreedBadgeLabel = (breed: PoultryBreedType) => {
    switch (breed) {
      case 'SONALI_CLASSIC':
        return isBn ? 'সোনালী ক্লাসিক' : 'Sonali Classic';
      case 'BROILER_COBB_500':
        return isBn ? 'ব্রয়লার কব্ব-৫০০' : 'Broiler Cobb-500';
      case 'LAYER_HY_LINE_BROWN':
        return isBn ? 'হাই-লাইন ব্রাউন লেয়ার' : 'Hy-Line Brown Layer';
      case 'HAOR_BELGIAN_DUCK':
        return isBn ? 'হাওর বেলজিয়ান ডাকলিং' : 'Haor Belgian Duck';
      case 'DESHI_NATIVE_CHICKEN':
        return isBn ? 'দেশি তিতির ও মুরগি' : 'Deshi Native Chicken';
      default:
        return breed;
    }
  };

  const getVaccinationLabel = (status: string) => {
    switch (status) {
      case 'MAREKS_DAY_1_CERTIFIED':
        return isBn ? 'মারেক্স ডে-১ টিকা সম্পন্ন' : "Marek's Day 1 Done";
      case 'RANIKHET_NEWCASTLE_RDV_COMPLETED':
        return isBn ? 'রানীক্ষেত (RDV) কমপ্লিট' : 'Ranikhet RDV Complete';
      case 'GUMBORO_IBD_BOOSTER_DONE':
        return isBn ? 'গামবোরো (IBD) বুস্টার' : 'Gumboro IBD Booster';
      case 'FOWL_CHOLERA_POX_COMPLETE':
        return isBn ? 'ফাউল কলেরা ও পক্স সম্পন্ন' : 'Fowl Cholera & Pox Complete';
      default:
        return isBn ? 'টিকা প্রক্রিয়াধীন' : 'Pending Vaccination';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white py-16 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold tracking-wide uppercase">
                <Egg className="w-4 h-4" />
                {isBn ? 'পোল্ট্রি হ্যাচারি, ডিমের গ্রেডিং ও ব্রুডার আইওটি' : 'Poultry Hatchery & IoT Engine'}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                {isBn
                  ? 'বায়োসিকিউর ডে-ওল্ড-চিক ও ডিজিটাল এগ ট্রেসেবিলিটি'
                  : 'Biosecure DOC Hatchery & Digital Egg Traceability'}
              </h1>
              <p className="text-amber-100 text-base sm:text-lg leading-relaxed">
                {isBn
                  ? 'সোনালী, ব্রয়লার ও লেয়ার বাচ্চার ডিএলএস ভেটেরিনারি সার্টিফাইড হ্যাচারি সরবরাহ, রিয়েল-টাইম অ্যামোনিয়া-তাপমাত্রা ব্রুডার আইওটি এবং ওজন ভিত্তিক ডিজিটাল ডিম গ্রেডিং প্ল্যাটফর্ম।'
                  : 'DLS certified Day-Old-Chicks (DOC), smart brooder IoT environmental telemetry (ammonia & temperature), and weight-sorted commercial table egg lots.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${lang}/seller/poultry-hatchery`}
                className="px-5 py-2.5 rounded-xl bg-white text-orange-800 font-bold hover:bg-orange-50 transition shadow-sm inline-flex items-center gap-2 text-sm"
              >
                <TrendingUp className="w-4 h-4" />
                {isBn ? 'খামার ও ব্রুডার ড্যাশবোর্ড' : 'Farmer Brooder Hub'}
              </Link>
              <Link
                href={`/${lang}/admin/poultry-hatchery`}
                className="px-5 py-2.5 rounded-xl bg-amber-900/40 border border-white/30 text-white font-semibold hover:bg-amber-900/60 transition inline-flex items-center gap-2 text-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                {isBn ? 'ডিএলএস ভেটেরিনারি অডিট' : 'DLS Vet Audit Desk'}
              </Link>
            </div>
          </div>

          {/* Overview Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-10">
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-xs text-amber-200 uppercase font-semibold">
                {isBn ? 'মোট সক্রিয় পাখি' : 'Active Flock Count'}
              </div>
              <div className="text-2xl font-black mt-1">
                {statsLoading ? '...' : (stats?.totalActiveFlockCount ?? 17500).toLocaleString()}
              </div>
              <div className="text-xs text-amber-100/70 mt-1">{isBn ? 'খামারে মজুদ' : 'In Farm Cohorts'}</div>
            </div>

            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-xs text-amber-200 uppercase font-semibold">
                {isBn ? 'উৎপাদিত বাচ্চা (DOC)' : 'DOC Produced'}
              </div>
              <div className="text-2xl font-black mt-1">
                {statsLoading ? '...' : (stats?.totalDocProducedCount ?? 18000).toLocaleString()}
              </div>
              <div className="text-xs text-amber-100/70 mt-1">{isBn ? 'ডে-১ ভ্যাক্সিনপ্রাপ্ত' : 'Day 1 Vaccinated'}</div>
            </div>

            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-xs text-amber-200 uppercase font-semibold">
                {isBn ? 'ডিমের বাণিজ্যিক কেস' : 'Egg Cases Ready'}
              </div>
              <div className="text-2xl font-black mt-1">
                {statsLoading ? '...' : (stats?.totalEggCasesAvailable ?? 90).toLocaleString()}
              </div>
              <div className="text-xs text-amber-100/70 mt-1">{isBn ? 'প্রতি কেস ৩৬০ ডিম' : '360 Eggs / Case'}</div>
            </div>

            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-xs text-amber-200 uppercase font-semibold">
                {isBn ? 'ব্রয়লার এফসিআর' : 'Broiler Avg FCR'}
              </div>
              <div className="text-2xl font-black mt-1">
                {statsLoading ? '...' : stats?.averageBroilerFcr ?? '1.58'}
              </div>
              <div className="text-xs text-amber-100/70 mt-1">{isBn ? 'মানদণ্ড: ≤ ১.৫৫' : 'Target: ≤ 1.55'}</div>
            </div>

            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-xs text-amber-200 uppercase font-semibold">
                {isBn ? 'সোনালী এফসিআর' : 'Sonali Avg FCR'}
              </div>
              <div className="text-2xl font-black mt-1">
                {statsLoading ? '...' : stats?.averageSonaliFcr ?? '2.25'}
              </div>
              <div className="text-xs text-amber-100/70 mt-1">{isBn ? 'মানদণ্ড: ≤ ২.২০' : 'Target: ≤ 2.20'}</div>
            </div>

            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-xs text-amber-200 uppercase font-semibold">
                {isBn ? 'আইওটি ব্রুডার শেড' : 'Monitored Sheds'}
              </div>
              <div className="text-2xl font-black mt-1">
                {statsLoading ? '...' : (stats?.activeBrooderShedsCount ?? 3)}
              </div>
              <div className="text-xs text-amber-100/70 mt-1">{isBn ? 'রিয়েলটাইম সেন্সর' : 'Live Ammonia & Temp'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* SECTION 1: Dual Interactive Calculators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FCR & Mortality Analytics Calculator */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {isBn ? 'ফিড কনভার্সন রেশিও (FCR) ও মৃত্যুহার এনালাইজার' : 'Flock FCR & Mortality Analyzer'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isBn
                    ? 'ব্রয়লার ও সোনালী জাতের খাদ্য রূপান্তর হার ও ডিএলএস অ্যালার্ম নির্ণয়'
                    : 'Calculate feed efficiency, biomass, and biosecurity mortality alarms'}
                </p>
              </div>
            </div>

            <form onSubmit={handleFcrSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'পাখির জাত নির্বাচন' : 'Poultry Breed Selection'}
                </label>
                <select
                  value={calcBreed}
                  onChange={(e) => setCalcBreed(e.target.value as PoultryBreedType)}
                  className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="BROILER_COBB_500">Broiler Cobb-500 (ব্রয়লার কব্ব-৫০০)</option>
                  <option value="SONALI_CLASSIC">Sonali Classic (সোনালী ক্লাসিক)</option>
                  <option value="LAYER_HY_LINE_BROWN">Hy-Line Brown Layer (লেয়ার ডিম পাড়া)</option>
                  <option value="HAOR_BELGIAN_DUCK">Haor Belgian Duck (হাওর হাঁস)</option>
                  <option value="DESHI_NATIVE_CHICKEN">Deshi Native Chicken (দেশি মুরগি)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'প্রাথমিক বাচ্চার সংখ্যা' : 'Initial Chick Count'}
                  </label>
                  <input
                    type="number"
                    value={initialChicks}
                    onChange={(e) => setInitialChicks(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'বর্তমান জীবিত সংখ্যা' : 'Current Live Count'}
                  </label>
                  <input
                    type="number"
                    value={currentLive}
                    onChange={(e) => setCurrentLive(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'মোট খাদ্যের পরিমাণ (কেজি)' : 'Total Feed Consumed (kg)'}
                  </label>
                  <input
                    type="number"
                    value={feedConsumedKg}
                    onChange={(e) => setFeedConsumedKg(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'গড় ওজন (গ্রাম)' : 'Average Weight (grams)'}
                  </label>
                  <input
                    type="number"
                    value={avgWeightGrams}
                    onChange={(e) => setAvgWeightGrams(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
                    min="10"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCalculatingFcr}
                className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                {isCalculatingFcr
                  ? isBn
                    ? 'হিসাব করা হচ্ছে...'
                    : 'Analyzing...'
                  : isBn
                  ? 'এফসিআর ও লাভ-ক্ষতি নির্ণয় করুন'
                  : 'Calculate FCR & Efficiency'}
              </button>
            </form>

            {/* FCR Results Card */}
            {fcrResult && (
              <div className="mt-5 p-4 rounded-xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-900 dark:text-orange-300">
                    {isBn ? 'হিসাবকৃত এফসিআর (FCR):' : 'Calculated FCR:'}
                  </span>
                  <span className="text-xl font-extrabold text-orange-600 dark:text-orange-400">
                    {fcrResult.calculatedFcr}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {isBn ? 'দক্ষতার রেটিং:' : 'Efficiency Grade:'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      fcrResult.fcrRating === 'EXCELLENT'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                        : fcrResult.fcrRating === 'STANDARD'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                    }`}
                  >
                    {fcrResult.fcrRating}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{isBn ? 'মৃত্যুহার (Mortality):' : 'Mortality Rate:'}</span>
                  <span
                    className={`font-bold ${
                      fcrResult.isMortalityAlarm ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {fcrResult.mortalityPercentage}% ({fcrResult.mortalityCount} birds)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{isBn ? 'মোট মাংসের ওজন (Biomass):' : 'Total Biomass:'}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {fcrResult.totalBiomassKg.toLocaleString()} kg
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{isBn ? 'প্রতি কেজি মাংসে খাদ্য খরচ:' : 'Feed Cost / kg Meat:'}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    ৳{fcrResult.feedCostPerKgMeatBdt}
                  </span>
                </div>

                {fcrResult.isMortalityAlarm && (
                  <div className="p-2.5 rounded-lg bg-red-100/80 dark:bg-red-900/40 border border-red-300 dark:border-red-800 text-xs text-red-800 dark:text-red-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{fcrResult.mortalityAlertMessage}</span>
                  </div>
                )}

                <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-orange-200/60 dark:border-orange-800/60 italic">
                  {fcrResult.fcrBenchmarkExplanation}
                </p>
              </div>
            )}
          </div>

          {/* Table Egg Weight Sorter & Valuation Estimator */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {isBn ? 'বাণিজ্যিক টেবিল ডিম সর্টিং ও গ্রেডিং ক্যালকুলেটর' : 'Table Egg Weight Sorter & Valuation'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isBn
                    ? 'ওজন ভিত্তিক জাম্বো, লার্জ, মিডিয়াম গ্রেডিং এবং পাইকারি রেট মূল্যায়ন'
                    : 'Digital egg grade classification (Jumbo, Large, Medium) and lot valuation'}
                </p>
              </div>
            </div>

            <form onSubmit={handleEggGradingSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'ডিমের গড় ওজন (গ্রাম)' : 'Average Egg Weight (grams)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={eggWeightGrams}
                  onChange={(e) => setEggWeightGrams(Number(e.target.value))}
                  className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
                  min="35"
                  max="90"
                  required
                />
                <span className="text-xs text-slate-400 mt-1 block">
                  {isBn
                    ? 'গ্রেড জাম্বো: >৬৫ গ্রাম | লার্জ: ৫৮-৬৪ গ্রাম | মিডিয়াম: ৫০-৫৭ গ্রাম'
                    : 'Jumbo: >65g | Large: 58-64g | Medium: 50-57g | Pullet: <50g'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'মোট ডিমের সংখ্যা' : 'Total Eggs Count'}
                </label>
                <input
                  type="number"
                  value={totalEggsCount}
                  onChange={(e) => setTotalEggsCount(Number(e.target.value))}
                  className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
                  min="100"
                  step="100"
                  required
                />
                <span className="text-xs text-slate-400 mt-1 block">
                  {isBn ? 'বাণিজ্যিক প্রতি কেস = ৩৬০টি ডিম (১২ ট্রে)' : '1 Standard Case = 360 eggs (12 trays)'}
                </span>
              </div>

              <button
                type="submit"
                disabled={isEvaluatingEgg}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2"
              >
                <Egg className="w-4 h-4" />
                {isEvaluatingEgg
                  ? isBn
                    ? 'গ্রেড নির্ধারণ করা হচ্ছে...'
                    : 'Grading...'
                  : isBn
                  ? 'ডিমের গ্রেড ও বাজারমূল্য নির্ধারণ করুন'
                  : 'Evaluate Grade & Market Valuation'}
              </button>
            </form>

            {/* Egg Grading Results Card */}
            {eggResult && (
              <div className="mt-5 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                    {isBn ? 'গুণগত গ্রেড (Quality Grade):' : 'Quality Grade:'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                    {eggResult.eggGrade.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{isBn ? 'প্রতি শতকের পাইকারি দর:' : 'Wholesale / 100 Eggs:'}</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                    ৳{eggResult.pricePerHundredBdt}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{isBn ? 'প্রতি পিস ডিমের মূল্য:' : 'Unit Price / Egg:'}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    ৳{eggResult.unitPricePerEggBdt}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{isBn ? 'বাণিজ্যিক কেসের সংখ্যা:' : 'Commercial Cases (360s):'}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {eggResult.commercialCasesCount} {isBn ? 'কেস' : 'cases'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-amber-200/60 dark:border-amber-800/60">
                  <span className="font-semibold">{isBn ? 'লটের মোট আর্থিক মূল্য:' : 'Total Lot Valuation:'}</span>
                  <span className="text-base font-extrabold text-amber-700 dark:text-amber-400">
                    ৳{eggResult.totalValuationBdt.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 pt-1">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{eggResult.uvSanitizationStandard}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: Hatchery Day-Old-Chicks & Flock Batches */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-orange-500" />
                {isBn ? 'ডিএলএস প্রত্যয়িত ডে-ওল্ড-চিক (DOC) ও ফ্লক ক্যাটালগ' : 'DLS Certified DOC & Flock Catalog'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isBn
                  ? 'মারেক্স, রানীক্ষেত ও গামবোরো ভ্যাক্সিন প্রত্যয়িত হ্যাচারি বাচ্চার সরাসরি সরবরাহ'
                  : 'Direct hatchery procurement of certified vaccinated day-old-chicks and grower cohorts'}
              </p>
            </div>

            {/* Breed Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'ALL', label: isBn ? 'সকল জাত' : 'All Breeds' },
                { id: 'SONALI_CLASSIC', label: isBn ? 'সোনালী' : 'Sonali' },
                { id: 'BROILER_COBB_500', label: isBn ? 'ব্রয়লার' : 'Broiler' },
                { id: 'LAYER_HY_LINE_BROWN', label: isBn ? 'লেয়ার' : 'Layer' },
                { id: 'HAOR_BELGIAN_DUCK', label: isBn ? 'হাঁস' : 'Duck' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedBreedFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedBreedFilter === tab.id
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {batchesLoading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              {isBn ? 'বাচ্চার ব্যাচ লোড হচ্ছে...' : 'Loading hatchery batches...'}
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
              {isBn ? 'এই ক্যাটাগরিতে কোনো ব্যাচ পাওয়া যায়নি।' : 'No batches found in this category.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 font-semibold">
                        {batch.batchCode}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {batch.district}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug">
                        {batch.hatcheryName}
                      </h3>
                      <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-0.5">
                        {getBreedBadgeLabel(batch.breedType)}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>{isBn ? 'স্টেজ:' : 'Stage:'}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {batch.flockStage.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>{isBn ? 'উপলব্ধ বাচ্চা:' : 'Available Count:'}</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {batch.chickCount.toLocaleString()} {isBn ? 'টি' : 'birds'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>{isBn ? 'গড় ওজন:' : 'Avg Weight:'}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {batch.averageWeightGrams} g
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>{isBn ? 'হ্যাচিং তারিখ:' : 'Hatch Date:'}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {batch.hatchDate}
                        </span>
                      </div>
                    </div>

                    {/* Vaccination & DLS Badge */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{getVaccinationLabel(batch.vaccinationStatus)}</span>
                      </div>
                      {batch.dlsSurgeonCertificationNo && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <FileCheck className="w-3 h-3 text-blue-500 shrink-0" />
                          <span>{batch.dlsSurgeonCertificationNo}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400 uppercase font-bold">
                        {isBn ? 'প্রতি পিস দর' : 'Price / Bird'}
                      </div>
                      <div className="text-lg font-black text-slate-900 dark:text-slate-100">
                        ৳{batch.unitPriceBdt}
                      </div>
                    </div>

                    <a
                      href={`tel:${batch.breederPhone}`}
                      className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {isBn ? 'বুকিং দিন' : 'Book Order'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3: Commercial Table Egg Lots Registry */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Egg className="w-6 h-6 text-amber-500" />
                {isBn ? 'বাণিজ্যিক টেবিল ডিমের লট রেজিস্ট্রি' : 'Commercial Table Egg Lot Registry'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isBn
                  ? 'ওজন গ্রেডেড (AA, A, B), ইউভি-সি জীবাণুমুক্ত এবং নিরাপদ পাইকারি ডিমের সরবরাহ'
                  : 'Weight-sorted (AA, A, B), UV-C sanitized commercial egg lots ready for bulk dispatch'}
              </p>
            </div>
          </div>

          {eggLotsLoading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              {isBn ? 'ডিমের লট লোড হচ্ছে...' : 'Loading egg lots...'}
            </div>
          ) : eggLots.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
              {isBn ? 'কোনো ডিমের লট পাওয়া যায়নি।' : 'No egg lots available.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {eggLots.map((lot) => (
                <div
                  key={lot.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 font-bold">
                      {lot.lotNumber}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {lot.district}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                      {lot.farmName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200/80 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                        {lot.eggGrade.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({lot.averageEggWeightGrams}g avg)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>{isBn ? 'মোট ডিমের সংখ্যা:' : 'Total Eggs Count:'}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {lot.totalEggsCount.toLocaleString()} {isBn ? 'টি' : 'eggs'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>{isBn ? 'উপলব্ধ কেস:' : 'Available Cases:'}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {lot.availableCasesCount} {isBn ? 'কেস' : 'cases'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>{isBn ? 'ফাটা ডিমের অনুপাত:' : 'Cracked Rate:'}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {lot.crackedEggPercentage}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{isBn ? 'ইউভি-সি স্যানিটাইজেশন ভেরিফাইড' : 'UV-C Sanitization Verified'}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400 uppercase font-bold">
                        {isBn ? 'পাইকারি দর (প্রতি শতক)' : 'Price / 100 Eggs'}
                      </div>
                      <div className="text-lg font-black text-amber-600 dark:text-amber-400">
                        ৳{lot.pricePerHundredBdt}
                      </div>
                    </div>

                    <button className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition">
                      {isBn ? 'লট ক্রয় করুন' : 'Purchase Lot'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 4: Real-time IoT Brooder Shed Surveillance */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Gauge className="w-6 h-6 text-orange-500" />
                {isBn ? 'রিয়েল-টাইম আইওটি ব্রুডার শেড মনিটর' : 'Real-Time IoT Brooder Shed Monitor'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isBn
                  ? 'বাচ্চা ব্রুডিং শেডের তাপমাত্রা, আর্দ্রতা এবং বিষাক্ত অ্যামোনিয়া (NH₃) গ্যাস পর্যবেক্ষণ'
                  : 'Live environmental surveillance of brooding ambient temperature, humidity, and ammonia gas'}
              </p>
            </div>
          </div>

          {shedsLoading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              {isBn ? 'ব্রুডার সেন্সর তথ্য লোড হচ্ছে...' : 'Loading brooder sensors...'}
            </div>
          ) : sheds.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
              {isBn ? 'কোনো ব্রুডার সেন্সর সক্রিয় নেই।' : 'No active brooder shed sensors found.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sheds.map((shed) => {
                const isAmmoniaHazard = shed.ammoniaPpm > 25.0;
                const isCold = shed.temperatureCelsius < 30.0;
                const isHeat = shed.temperatureCelsius > 36.0;

                return (
                  <div
                    key={shed.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-sm transition space-y-4 ${
                      isAmmoniaHazard
                        ? 'border-red-400 dark:border-red-800 ring-2 ring-red-400/20'
                        : isCold || isHeat
                        ? 'border-amber-400 dark:border-amber-800'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        {shed.shedCode}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          shed.alarmStatus === 'OPTIMAL_BROODING_ENVIRONMENT'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        }`}
                      >
                        {shed.alarmStatus === 'OPTIMAL_BROODING_ENVIRONMENT'
                          ? isBn
                            ? 'অনুকূল পরিবেশ'
                            : 'Optimal'
                          : isBn
                          ? 'সতর্কতা সক্রিয়'
                          : 'Alert Triggered'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                        {shed.farmName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {shed.district} {shed.flockBatchCode ? `• ${shed.flockBatchCode}` : ''}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 text-center">
                        <Thermometer className="w-4 h-4 mx-auto text-orange-600 mb-1" />
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                          {isBn ? 'তাপমাত্রা' : 'Temp'}
                        </div>
                        <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                          {shed.temperatureCelsius}°C
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-center">
                        <Wind className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                          {isBn ? 'আর্দ্রতা' : 'Humidity'}
                        </div>
                        <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                          {shed.relativeHumidityPercent}%
                        </div>
                      </div>

                      <div
                        className={`p-2.5 rounded-xl border text-center ${
                          isAmmoniaHazard
                            ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40'
                        }`}
                      >
                        <Flame
                          className={`w-4 h-4 mx-auto mb-1 ${
                            isAmmoniaHazard ? 'text-red-600' : 'text-emerald-600'
                          }`}
                        />
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                          {isBn ? 'অ্যামোনিয়া' : 'Ammonia'}
                        </div>
                        <div
                          className={`text-sm font-black ${
                            isAmmoniaHazard
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {shed.ammoniaPpm} ppm
                        </div>
                      </div>
                    </div>

                    {/* Actuator Status */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>
                        {isBn ? 'এগজস্ট ফ্যান:' : 'Exhaust Fan:'}{' '}
                        <strong className="text-slate-800 dark:text-slate-200">{shed.exhaustFanState}</strong>
                      </span>
                      <span>
                        {isBn ? 'হিটার:' : 'Heater:'}{' '}
                        <strong className="text-slate-800 dark:text-slate-200">{shed.brooderHeaterState}</strong>
                      </span>
                    </div>

                    {shed.alarmMessage && (
                      <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-xs text-red-800 dark:text-red-300 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{shed.alarmMessage}</span>
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
  );
};
