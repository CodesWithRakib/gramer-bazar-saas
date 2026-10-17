'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sprout,
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
  Droplets,
  Flame,
  CloudFog,
  Package,
} from 'lucide-react';
import {
  useGetMushroomOverviewStatsQuery,
  useGetMushroomSpawnBatchesQuery,
  useGetFruitingChambersQuery,
  useGetDehydratedMushroomLotsQuery,
  useCalculateDehydrationYieldMutation,
  useEvaluateChamberClimateMutation,
  MushroomVariety,
  CalculateDehydrationYieldResponse,
  EvaluateChamberClimateResponse,
} from '../mushroomFarmingApi';

interface MushroomMarketplaceViewProps {
  lang: string;
}

export const MushroomMarketplaceView: React.FC<MushroomMarketplaceViewProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  // API Queries
  const { data: statsData, isLoading: statsLoading } = useGetMushroomOverviewStatsQuery();
  const { data: spawnsData, isLoading: spawnsLoading } = useGetMushroomSpawnBatchesQuery();
  const { data: chambersData, isLoading: chambersLoading } = useGetFruitingChambersQuery();
  const { data: lotsData, isLoading: lotsLoading } = useGetDehydratedMushroomLotsQuery();

  // Mutations
  const [calculateDehydration, { isLoading: isCalculatingDehydration }] = useCalculateDehydrationYieldMutation();
  const [evaluateClimate, { isLoading: isEvaluatingClimate }] = useEvaluateChamberClimateMutation();

  // Dehydration Calculator State
  const [calcVariety, setCalcVariety] = useState<MushroomVariety>('OYSTER_WHITE_PO2');
  const [freshWeight, setFreshWeight] = useState<number>(100);
  const [targetMoisture, setTargetMoisture] = useState<number>(8.5);
  const [dehydrationResult, setDehydrationResult] = useState<CalculateDehydrationYieldResponse | null>(null);

  // Climate Analyzer State
  const [chamberTemp, setChamberTemp] = useState<number>(24.0);
  const [chamberHum, setChamberHum] = useState<number>(85.0);
  const [chamberCo2, setChamberCo2] = useState<number>(820.0);
  const [climateResult, setClimateResult] = useState<EvaluateChamberClimateResponse | null>(null);

  // Filter
  const [selectedVarietyFilter, setSelectedVarietyFilter] = useState<string>('ALL');

  const stats = statsData?.data;
  const spawns = spawnsData?.data || [];
  const chambers = chambersData?.data || [];
  const lots = lotsData?.data || [];

  const handleDehydrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await calculateDehydration({
        variety: calcVariety,
        freshWeightKg: Number(freshWeight),
        targetMoisturePercentage: Number(targetMoisture),
      }).unwrap();
      if (res.success) {
        setDehydrationResult(res.data);
      }
    } catch {
      // Handled
    }
  };

  const handleClimateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await evaluateClimate({
        temperatureCelsius: Number(chamberTemp),
        relativeHumidityPercent: Number(chamberHum),
        co2Ppm: Number(chamberCo2),
      }).unwrap();
      if (res.success) {
        setClimateResult(res.data);
      }
    } catch {
      // Handled
    }
  };

  const filteredSpawns = spawns.filter((s) => {
    if (selectedVarietyFilter === 'ALL') return true;
    return s.variety === selectedVarietyFilter;
  });

  const getVarietyLabel = (variety: MushroomVariety) => {
    switch (variety) {
      case 'OYSTER_WHITE_PO2':
        return isBn ? 'সাদা ওয়েস্টার (PO-2)' : 'Oyster White (PO-2)';
      case 'OYSTER_GREY_HK51':
        return isBn ? 'ধূসর ওয়েস্টার (HK-51)' : 'Oyster Grey (HK-51)';
      case 'MILKY_WHITE_SUMMER':
        return isBn ? 'মিল্কি হোয়াইট সামার' : 'Milky White Summer';
      case 'BUTTON_AGARICUS_WINTER':
        return isBn ? 'বাটন মাশরুম (অ্যাগারিকাস)' : 'Button (Agaricus)';
      case 'GANODERMA_REISHI_MEDICINAL':
        return isBn ? 'রেইশি গ্যানোডার্মা ভেষজ' : 'Ganoderma Reishi Medicinal';
      case 'SHIITAKE_LENTINULA':
        return isBn ? 'শিতাকে মাশরুম' : 'Shiitake';
      default:
        return variety;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-950 text-white py-16 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold tracking-wide uppercase">
                <Sprout className="w-4 h-4" />
                {isBn ? 'মাশরুম স্পন ল্যাব, ফ্রুটিং চেম্বার আইওটি ও ডিহাইড্রেশন' : 'Mushroom Spawn Lab & Dehydration Engine'}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                {isBn
                  ? 'উন্নত জাতের মাশরুম স্পন ও ড্রাই মাশরুম প্ল্যাটফর্ম'
                  : 'Certified Spawn Strains & Dehydrated Mushroom Supply Chain'}
              </h1>
              <p className="text-emerald-100 text-base sm:text-lg leading-relaxed">
                {isBn
                  ? 'এনএমডিআই ও বারি সার্টিফাইড ওয়েস্টার, মিল্কি ও রেইশি মাশরুম স্পন প্যাকেট, ফ্রুটিং চেম্বারের রিয়েলটাইম CO₂-আর্দ্রতা সেন্সর এবং খাদ্যমান প্রত্যয়িত ড্রাই মাশরুম।'
                  : 'NMDI & BARI certified mother spawn tissue cultures, real-time chamber CO2 & ultrasonic mist IoT climate telemetry, and nitrogen-sealed dehydrated gourmet mushroom slices.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${lang}/seller/mushroom-farming`}
                className="px-5 py-2.5 rounded-xl bg-white text-emerald-900 font-bold hover:bg-emerald-50 transition shadow-sm inline-flex items-center gap-2 text-sm"
              >
                <TrendingUp className="w-4 h-4" />
                {isBn ? 'গ্রোয়ার ও চেম্বার হাব' : 'Grower Chamber Hub'}
              </Link>
              <Link
                href={`/${lang}/admin/mushroom-farming`}
                className="px-5 py-2.5 rounded-xl bg-emerald-900/40 border border-white/30 text-white font-semibold hover:bg-emerald-900/60 transition inline-flex items-center gap-2 text-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                {isBn ? 'ল্যাব ও চেম্বার অডিট ডেস্ক' : 'NMDI Lab Audit Desk'}
              </Link>
            </div>
          </div>

          {/* Overview Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-10">
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-xs text-emerald-200 uppercase font-semibold">
                {isBn ? 'সক্রিয় স্পন প্যাকেট' : 'Active Spawn Packets'}
              </div>
              <div className="text-2xl font-black mt-1">
                {statsLoading ? '...' : (stats?.totalActiveSpawnPacketsCount ?? 5500).toLocaleString()}
              </div>
              <div className="text-xs text-emerald-100/70 mt-1">{isBn ? 'অটোক্লেভ নির্বীজিত' : 'Autoclave Sterilized'}</div>
            </div>

            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-xs text-emerald-200 uppercase font-semibold">
                {isBn ? 'ড্রাই মাশরুম স্টক' : 'Dehydrated Stock'}
              </div>
              <div className="text-2xl font-black mt-1">
                {statsLoading ? '...' : (stats?.totalDehydratedStockKg ?? 55.0)} kg
              </div>
              <div className="text-xs text-emerald-100/70 mt-1">{isBn ? 'আর্দ্রতা ≤ ১০%' : 'Moisture ≤ 10%'}</div>
            </div>

            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-xs text-emerald-200 uppercase font-semibold">
                {isBn ? 'তাজা ফলন ক্ষমতা' : 'Fresh Capacity'}
              </div>
              <div className="text-2xl font-black mt-1">
                {statsLoading ? '...' : (stats?.totalFreshHarvestCapacityKg ?? 870.0)} kg
              </div>
              <div className="text-xs text-emerald-100/70 mt-1">{isBn ? 'মাসিক ফলন' : 'Monthly Harvest'}</div>
            </div>

            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-xs text-emerald-200 uppercase font-semibold">
                {isBn ? 'আইওটি ফ্রুটিং চেম্বার' : 'Fruiting Chambers'}
              </div>
              <div className="text-2xl font-black mt-1">
                {statsLoading ? '...' : (stats?.activeFruitingChambersCount ?? 3)}
              </div>
              <div className="text-xs text-emerald-100/70 mt-1">{isBn ? 'স্বয়ংক্রিয় সেন্সর' : 'Live CO2 & Humidity'}</div>
            </div>

            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-xs text-emerald-200 uppercase font-semibold">
                {isBn ? 'গড় আপেক্ষিক আর্দ্রতা' : 'Avg Chamber RH'}
              </div>
              <div className="text-2xl font-black mt-1">
                {statsLoading ? '...' : `${stats?.averageChamberHumidityPercent ?? 86.0}%`}
              </div>
              <div className="text-xs text-emerald-100/70 mt-1">{isBn ? 'আদর্শ: ৮০-৯০%' : 'Optimal: 80-90%'}</div>
            </div>

            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-xs text-emerald-200 uppercase font-semibold">
                {isBn ? 'ড্রাই রূপান্তর অনুপাত' : 'Dry Conversion Ratio'}
              </div>
              <div className="text-2xl font-black mt-1">10:1</div>
              <div className="text-xs text-emerald-100/70 mt-1">{isBn ? '১০ কেজি তাজা = ১ কেজি ড্রাই' : '10 kg fresh = 1 kg dry'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* SECTION 1: Dual Interactive Calculators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dehydration Yield & Moisture Loss Calculator */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {isBn ? 'মাশরুম ডিহাইড্রেশন ও ড্রাই রূপান্তর ক্যালকুলেটর' : 'Dehydration & Moisture Loss Processor'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isBn
                    ? 'তাজা মাশরুম থেকে ড্রাই ওজন, আর্দ্রতা হ্রাস ও পাইকারি বাজারমূল্য নির্ণয়'
                    : 'Calculate dry weight yield, moisture loss, and commercial dry lot valuation'}
                </p>
              </div>
            </div>

            <form onSubmit={handleDehydrationSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'মাশরুমের জাত নির্বাচন' : 'Mushroom Variety'}
                </label>
                <select
                  value={calcVariety}
                  onChange={(e) => setCalcVariety(e.target.value as MushroomVariety)}
                  className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="OYSTER_WHITE_PO2">Oyster White PO-2 (সাদা ওয়েস্টার - ১০:১ অনুপাত)</option>
                  <option value="OYSTER_GREY_HK51">Oyster Grey HK-51 (ধূসর ওয়েস্টার - ১০:১ অনুপাত)</option>
                  <option value="MILKY_WHITE_SUMMER">Milky White Summer (মিল্কি মাশরুম - ১১:১ অনুপাত)</option>
                  <option value="BUTTON_AGARICUS_WINTER">Button Agaricus (বাটন মাশরুম - ১২:১ অনুপাত)</option>
                  <option value="GANODERMA_REISHI_MEDICINAL">Ganoderma Reishi (রেইশি ভেষজ - ৪:১ অনুপাত)</option>
                  <option value="SHIITAKE_LENTINULA">Shiitake (শিতাকে মাশরুম - ৮:১ অনুপাত)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'তাজা মাশরুমের ওজন (কেজি)' : 'Fresh Weight (kg)'}
                  </label>
                  <input
                    type="number"
                    value={freshWeight}
                    onChange={(e) => setFreshWeight(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'টার্গেট ড্রাই আর্দ্রতা (%)' : 'Target Dry Moisture (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetMoisture}
                    onChange={(e) => setTargetMoisture(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
                    min="5"
                    max="12"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCalculatingDehydration}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2"
              >
                <Scale className="w-4 h-4" />
                {isCalculatingDehydration
                  ? isBn
                    ? 'হিসাব করা হচ্ছে...'
                    : 'Calculating...'
                  : isBn
                  ? 'ডিহাইড্রেশন ফলন ও আর্থিক মূল্য হিসাব করুন'
                  : 'Calculate Dehydration Yield'}
              </button>
            </form>

            {/* Results Card */}
            {dehydrationResult && (
              <div className="mt-5 p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    {isBn ? 'ড্রাই মাশরুম আউটপুট:' : 'Dry Mushroom Output:'}
                  </span>
                  <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {dehydrationResult.estimatedDryWeightKg} kg
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{isBn ? 'রূপান্তর অনুপাত:' : 'Conversion Ratio:'}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {dehydrationResult.freshToDryRatio} ({dehydrationResult.yieldPercentage}% yield)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{isBn ? 'বাষ্পীভূত আর্দ্রতা হ্রাস:' : 'Moisture Evaporated:'}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {dehydrationResult.moistureLossKg} kg
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{isBn ? 'পাইকারি বাজার দর:' : 'Estimated Rate / kg:'}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    ৳{dehydrationResult.estimatedWholesaleRatePerKgBdt}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60">
                  <span className="font-semibold">{isBn ? 'মোট ড্রাই লটের আর্থিক মূল্য:' : 'Gross Valuation:'}</span>
                  <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                    ৳{dehydrationResult.estimatedGrossValuationBdt.toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 italic">
                  {dehydrationResult.shelfLifeComparison}
                </p>
              </div>
            )}
          </div>

          {/* Fruiting Chamber Climate Analyzer */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
                <CloudFog className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {isBn ? 'ফ্রুটিং চেম্বার ক্লাইমেট ও CO₂ অ্যানালাইজার' : 'Fruiting Chamber Climate Analyzer'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isBn
                    ? 'চেম্বারের তাপমাত্রা, আপেক্ষিক আর্দ্রতা ও CO₂ অনুপাত যাচাই ও সতর্কবার্তা'
                    : 'Real-time climate validation, ultrasonic misting, and fresh air damper triggers'}
                </p>
              </div>
            </div>

            <form onSubmit={handleClimateSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'তাপমাত্রা (°C)' : 'Temp (°C)'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={chamberTemp}
                    onChange={(e) => setChamberTemp(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
                    min="15"
                    max="40"
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">আদর্শ: ২২–২৬°C</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'আর্দ্রতা (%)' : 'Humidity (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={chamberHum}
                    onChange={(e) => setChamberHum(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
                    min="40"
                    max="100"
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">আদর্শ: ৮০–৯০%</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'CO₂ গ্যাস (ppm)' : 'CO2 (ppm)'}
                  </label>
                  <input
                    type="number"
                    value={chamberCo2}
                    onChange={(e) => setChamberCo2(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
                    min="400"
                    max="3000"
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">সর্বোচ্চ: ১০০০</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isEvaluatingClimate}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2"
              >
                <CloudFog className="w-4 h-4" />
                {isEvaluatingClimate
                  ? isBn
                    ? 'যাচাই করা হচ্ছে...'
                    : 'Analyzing...'
                  : isBn
                  ? 'চেম্বার ক্লাইমেট ও অ্যালার্ম যাচাই করুন'
                  : 'Evaluate Chamber Climate'}
              </button>
            </form>

            {/* Results Card */}
            {climateResult && (
              <div className="mt-5 p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900 dark:text-teal-300">
                    {isBn ? 'ক্লাইমেট স্ট্যাটাস:' : 'Climate Status:'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      climateResult.alarmStatus === 'OPTIMAL_GROWTH_CLIMATE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                    }`}
                  >
                    {climateResult.alarmStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{isBn ? 'ফ্রেশ এয়ার ড্যাম্পার অ্যাকচুয়েটর:' : 'Fresh Air Damper:'}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {climateResult.recommendedDamperState}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{isBn ? 'আল্ট্রাসনিক ফগার মিস্ট অ্যাকচুয়েটর:' : 'Ultrasonic Fogger:'}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {climateResult.recommendedFoggerState}
                  </span>
                </div>

                {climateResult.alarmMessage && (
                  <div className="p-2.5 rounded-lg bg-red-100 dark:bg-red-900/40 text-xs text-red-800 dark:text-red-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{climateResult.alarmMessage}</span>
                  </div>
                )}

                <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-teal-200/60 dark:border-teal-800/60">
                  {climateResult.climateEvaluationNote}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: Mushroom Spawn Batches & Strains Catalog */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-emerald-600" />
                {isBn ? 'এনএমডিআই প্রত্যয়িত মাশরুম স্পন প্যাকেট ক্যাটালগ' : 'Certified Spawn Strains Catalog'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isBn
                  ? '১২১°C অটোক্লেভ নির্বীজিত কাঠের গুঁড়া ও দানা স্পন (ওয়েস্টার, মিল্কি, রেইশি)'
                  : '121°C autoclave sterilized commercial sawdust & grain spawn cylinders'}
              </p>
            </div>

            {/* Variety Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'ALL', label: isBn ? 'সকল জাত' : 'All Strains' },
                { id: 'OYSTER_WHITE_PO2', label: isBn ? 'সাদা ওয়েস্টার' : 'Oyster White' },
                { id: 'OYSTER_GREY_HK51', label: isBn ? 'ধূসর ওয়েস্টার' : 'Oyster Grey' },
                { id: 'GANODERMA_REISHI_MEDICINAL', label: isBn ? 'রেইশি ভেষজ' : 'Reishi' },
                { id: 'MILKY_WHITE_SUMMER', label: isBn ? 'মিল্কি' : 'Milky' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedVarietyFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedVarietyFilter === tab.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {spawnsLoading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              {isBn ? 'স্পন প্যাকেট লোড হচ্ছে...' : 'Loading spawn packets...'}
            </div>
          ) : filteredSpawns.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
              {isBn ? 'কোনো স্পন প্যাকেট পাওয়া যায়নি।' : 'No spawn packets found.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredSpawns.map((s) => (
                <div
                  key={s.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-semibold">
                        {s.batchNumber}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {s.district}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug">
                        {s.labName}
                      </h3>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                        {getVarietyLabel(s.variety)}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>{isBn ? 'স্টেজ:' : 'Stage:'}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {s.generationStage.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>{isBn ? 'উপলব্ধ প্যাকেট:' : 'Available Packets:'}</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {s.packetsCount.toLocaleString()} {isBn ? 'টি' : 'pkts'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>{isBn ? 'অটোক্লেভ নির্বীজন:' : 'Autoclave:'}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {s.autoclaveTempCelsius}°C / {s.autoclavePressurePsi} psi
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>{isBn ? 'ইনোকুলেশন তারিখ:' : 'Inoculation:'}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {s.inoculationDate}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{isBn ? 'সবুজ ছত্রাক (ট্রাইকোডার্মা) মুক্ত' : 'Contamination Free'}</span>
                      </div>
                      {s.nmdiLabCertificationNo && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <FileCheck className="w-3 h-3 text-blue-500 shrink-0" />
                          <span>{s.nmdiLabCertificationNo}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400 uppercase font-bold">
                        {isBn ? 'প্রতি প্যাকেট' : 'Per Packet'}
                      </div>
                      <div className="text-lg font-black text-slate-900 dark:text-slate-100">
                        ৳{s.pricePerPacketBdt}
                      </div>
                    </div>

                    <a
                      href={`tel:${s.growerPhone}`}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {isBn ? 'স্পন অর্ডার' : 'Order Spawn'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3: Dehydrated Gourmet Slices & Extracts */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Package className="w-6 h-6 text-teal-600" />
                {isBn ? 'ড্রাই মাশরুম স্লাইস ও ঔষধি রেইশি এক্সট্র্যাক্ট' : 'Dehydrated Gourmet Slices & Extracts'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isBn
                  ? '১০% এর কম আর্দ্রতায় নাইট্রোজেন ফ্লাশ ও ভ্যাকুয়াম সিল করা দীর্ঘস্থায়ী ড্রাই মাশরুম'
                  : 'Nitrogen-flushed, hermetically sealed culinary slices and Ganoderma beta-glucan extracts'}
              </p>
            </div>
          </div>

          {lotsLoading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              {isBn ? 'ড্রাই মাশরুম লট লোড হচ্ছে...' : 'Loading lots...'}
            </div>
          ) : lots.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
              {isBn ? 'কোনো ড্রাই মাশরুম লট নেই।' : 'No lots found.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {lots.map((lot) => (
                <div
                  key={lot.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/40 text-teal-900 dark:text-teal-300 font-bold">
                      {lot.lotCode}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {lot.district}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                      {lot.processorName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-200/80 text-teal-900 dark:bg-teal-900/60 dark:text-teal-200">
                        {lot.productForm.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({getVarietyLabel(lot.variety)})
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>{isBn ? 'ড্রাই ওজন স্টক:' : 'Dry Weight Stock:'}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {lot.availableStockKg} kg
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>{isBn ? 'চূড়ান্ত আর্দ্রতা:' : 'Final Moisture:'}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {lot.moisturePercentage}% (≤ 10% Pass)
                      </span>
                    </div>

                    {lot.polysaccharideBetaGlucanPercent && (
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>{isBn ? 'বিটা-গ্লুকান বায়ো-মার্কার:' : 'Beta-Glucan:'}</span>
                        <span className="font-bold text-teal-600 dark:text-teal-400">
                          {lot.polysaccharideBetaGlucanPercent}%
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{isBn ? 'নাইট্রোজেন সিল ও ড্রায়ার সার্টিফাইড' : 'Nitrogen Vacuum Sealed'}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400 uppercase font-bold">
                        {isBn ? 'পাইকারি দর (কেজি)' : 'Rate / kg'}
                      </div>
                      <div className="text-lg font-black text-teal-700 dark:text-teal-400">
                        ৳{lot.pricePerKgBdt}
                      </div>
                    </div>

                    <button className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition">
                      {isBn ? 'লট ক্রয় করুন' : 'Purchase Lot'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 4: Real-time Fruiting Chamber IoT Monitor */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CloudFog className="w-6 h-6 text-emerald-600" />
                {isBn ? 'রিয়েল-টাইম আইওটি ফ্রুটিং চেম্বার মনিটর' : 'Real-Time IoT Fruiting Chamber Monitor'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isBn
                  ? 'মাশরুম ফলন কক্ষের তাপমাত্রা, আর্দ্রতা ও CO₂ অনুপাত এবং ফগার-ড্যাম্পার অটোমেশন'
                  : 'Automated ultrasonic fogger and fresh air damper controls based on CO2 & humidity telemetry'}
              </p>
            </div>
          </div>

          {chambersLoading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              {isBn ? 'চেম্বার তথ্য লোড হচ্ছে...' : 'Loading chambers...'}
            </div>
          ) : chambers.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
              {isBn ? 'কোনো চেম্বার সক্রিয় নেই।' : 'No chambers active.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {chambers.map((chamber) => {
                const isOptimal = chamber.alarmStatus === 'OPTIMAL_GROWTH_CLIMATE';
                return (
                  <div
                    key={chamber.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-sm space-y-4 ${
                      isOptimal
                        ? 'border-slate-200 dark:border-slate-800'
                        : 'border-red-400 dark:border-red-800 ring-2 ring-red-400/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">
                        {chamber.chamberCode}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isOptimal
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        }`}
                      >
                        {isOptimal ? (isBn ? 'অনুকূল বৃদ্ধি' : 'Optimal') : (isBn ? 'সতর্কতা সক্রিয়' : 'Alert Triggered')}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{chamber.farmName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{chamber.district} • {chamber.activeBatchNumber}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40">
                        <Thermometer className="w-4 h-4 mx-auto text-orange-600 mb-1" />
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Temp</div>
                        <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                          {chamber.temperatureCelsius}°C
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                        <Droplets className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Humidity</div>
                        <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                          {chamber.relativeHumidityPercent}%
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                        <Wind className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">CO₂ Gas</div>
                        <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                          {chamber.co2Ppm} ppm
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Damper: <strong>{chamber.freshAirDamperState}</strong></span>
                      <span>Fogger: <strong>{chamber.foggerMistState}</strong></span>
                    </div>

                    {chamber.alarmMessage && (
                      <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-xs text-red-800 dark:text-red-300 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{chamber.alarmMessage}</span>
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
