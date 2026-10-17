'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  MapPin,
  Thermometer,
  Scale,
  Sparkles,
  ArrowRight,
  Phone,
  Droplets,
  Package,
  Layers,
  FileCheck,
  Building2,
  ScrollText,
} from 'lucide-react';
import {
  useGetJuteOverviewStatsQuery,
  useGetAllRettingBatchesQuery,
  useGetAllFiberLotsQuery,
  useGetAllB2bContractsQuery,
  useCalculateMoistureDeductionMutation,
  useEvaluateRettingPondMutation,
  JuteVariety,
  JuteFiberGrade,
  RettingMethod,
  MoistureDeductionResult,
  RettingPondEvaluationResult,
} from '../juteBiotechApi';

interface JuteMarketplaceViewProps {
  lang: string;
}

export const JuteMarketplaceView: React.FC<JuteMarketplaceViewProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  // API Queries
  const { data: statsData, isLoading: statsLoading } = useGetJuteOverviewStatsQuery();
  const { data: rettingData, isLoading: rettingLoading } = useGetAllRettingBatchesQuery();
  const { data: lotsData, isLoading: lotsLoading } = useGetAllFiberLotsQuery();
  const { data: contractsData, isLoading: contractsLoading } = useGetAllB2bContractsQuery();

  // Mutations
  const [calculateMoisture, { isLoading: isCalculatingMoisture }] = useCalculateMoistureDeductionMutation();
  const [evaluatePond, { isLoading: isEvaluatingPond }] = useEvaluateRettingPondMutation();

  // Weighbridge & Moisture Calculator State
  const [calcVariety, setCalcVariety] = useState<JuteVariety>('TOSSA_JUTE');
  const [calcGrade, setCalcGrade] = useState<JuteFiberGrade>('BJC_SPECIAL_TOP');
  const [grossWeight, setGrossWeight] = useState<number>(2050);
  const [tareWeight, setTareWeight] = useState<number>(50);
  const [moisturePct, setMoisturePct] = useState<number>(13.2);
  const [pricePerMaund, setPricePerMaund] = useState<number>(4000);
  const [moistureResult, setMoistureResult] = useState<MoistureDeductionResult | null>(null);

  // Retting Pond Evaluator State
  const [waterTemp, setWaterTemp] = useState<number>(31.0);
  const [waterPh, setWaterPh] = useState<number>(7.2);
  const [dissolvedOxygen, setDissolvedOxygen] = useState<number>(4.2);
  const [daysSteeping, setDaysSteeping] = useState<number>(8);
  const [rettingMethod, setRettingMethod] = useState<RettingMethod>('RIBBON_RETTING_ENZYMATIC');
  const [pondResult, setPondResult] = useState<RettingPondEvaluationResult | null>(null);

  // Filters
  const [selectedVarietyFilter, setSelectedVarietyFilter] = useState<string>('ALL');

  const stats = statsData?.data;
  const batches = rettingData?.data || [];
  const lots = lotsData?.data || [];
  const contracts = contractsData?.data || [];

  const handleMoistureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await calculateMoisture({
        grossWeightKg: Number(grossWeight),
        tareWeightKg: Number(tareWeight),
        moisturePercentage: Number(moisturePct),
        basePricePerMaund: Number(pricePerMaund),
        variety: calcVariety,
        grade: calcGrade,
      }).unwrap();
      if (res.success) {
        setMoistureResult(res.data);
      }
    } catch (err) {
      console.error('Failed to calculate moisture deduction', err);
    }
  };

  const handlePondSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await evaluatePond({
        waterTempCelsius: Number(waterTemp),
        waterPh: Number(waterPh),
        dissolvedOxygenMgL: Number(dissolvedOxygen),
        daysSteeping: Number(daysSteeping),
        rettingMethod,
      }).unwrap();
      if (res.success) {
        setPondResult(res.data);
      }
    } catch (err) {
      console.error('Failed to evaluate retting pond', err);
    }
  };

  const filteredLots = lots.filter((lot) => {
    if (selectedVarietyFilter === 'ALL') return true;
    return lot.variety === selectedVarietyFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-emerald-950 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30 text-xs sm:text-sm font-medium">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {isBn
                    ? 'পাট অধিদপ্তর ও বিজেআরআই বায়োটেক অনুমোদিত সোনালী আঁশ প্ল্যাটফর্ম'
                    : 'Directorate of Jute & BJRI Certified Golden Fiber Supply Chain'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                {isBn
                  ? 'পাট পচন জৈব-প্রযুক্তি ও সোনালী আঁশ সাপ্লাই চেইন প্ল্যাটফর্ম'
                  : 'Jute Retting Bio-Tech, Golden Fiber Traceability & Eco-Packaging Engine'}
              </h1>
              <p className="text-amber-100/90 text-sm sm:text-base max-w-2xl leading-relaxed">
                {isBn
                  ? 'বিজেআরআই এনজাইম মাইক্রোবায়াল রিবন রেটিংয়ের মাধ্যমে ১০ দিনে উজ্জ্বল সোনালী আঁশ তৈরি, ডিজিটাল ওয়েইব্রিজ ময়েশ্চার পেনাল্টি অ্যালগরিদম এবং পাট মোড়কীকরণ আইন ২০১০ বাস্তবায়নে মিল-টু-ফার্মার এসক্রো ট্রেডিং।'
                  : 'Accelerate retting from 21 to 10 days using BJRI biotechnical inoculants, automate weighbridge moisture deduction algorithms (14% safe warehousing baseline), and fulfill Mandatory Jute Packaging Act 2010 mill contracts.'}
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href={`/${lang}/seller/jute-biotech`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <ScrollText className="w-4 h-4" />
                  <span>{isBn ? 'কৃষক ও বেলিং হাব ড্যাশবোর্ড' : 'Farmer & Baling Hub'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={`/${lang}/admin/jute-biotech`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-white font-medium border border-emerald-600/40 transition-all"
                >
                  <Building2 className="w-4 h-4" />
                  <span>{isBn ? 'পাট অধিদপ্তর ও মিল অডিট' : 'Directorate of Jute Audit'}</span>
                </Link>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="lg:col-span-4 bg-slate-900/60 backdrop-blur-md border border-amber-400/20 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-sm font-semibold text-amber-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>{isBn ? 'সোনালী আঁশ লাইভ স্ট্যাটাস' : 'Golden Fiber Telemetry'}</span>
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-amber-400/10">
                  <span className="text-xs text-slate-300">{isBn ? 'মোট বেলিং ওজন' : 'Total Baled Output'}</span>
                  <span className="text-base font-bold text-amber-400">
                    {statsLoading ? '...' : `${stats?.totalMaunds?.toLocaleString() || 120.2} মন / Maunds`}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-amber-400/10">
                  <span className="text-xs text-slate-300">{isBn ? 'সক্রিয় পচন ব্যাচ' : 'Active Retting Tanks'}</span>
                  <span className="text-base font-bold text-emerald-400">
                    {statsLoading ? '...' : `${stats?.activeRettingBatches || 2} টি`}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-amber-400/10">
                  <span className="text-xs text-slate-300">{isBn ? 'কৃষক এসক্রো পরিশোধ' : 'Farmer Escrow Payout'}</span>
                  <span className="text-base font-bold text-amber-300">
                    {statsLoading ? '...' : `৳${stats?.totalFarmerPayoutBdt?.toLocaleString() || '4,91,146'}`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-300">{isBn ? 'মোড়কীকরণ আইন চুক্তি' : 'Packaging Act Value'}</span>
                  <span className="text-base font-bold text-emerald-300">
                    {statsLoading ? '...' : `৳${stats?.totalContractValueBdt?.toLocaleString() || '2,10,80,000'}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* SECTION 1: INTERACTIVE CALCULATORS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CALCULATOR 1: WEIGHBRIDGE & MOISTURE PENALTY */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isBn ? 'ডিজিটাল ওয়েইব্রিজ ও আর্দ্রতা মূল্যায়ন' : 'Weighbridge & Moisture Deduction Calculator'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isBn
                    ? 'আদর্শ আর্দ্রতা ১৪% (BJRI standard); অতিরিক্ত পানির জন্য ওজন কর্তন ও শুষ্কতায় বোনাস'
                    : 'Standard 14% safe moisture content; pro-rata water deduction & dryness bonuses'}
                </p>
              </div>
            </div>

            <form onSubmit={handleMoistureSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'পাটের জাত (Variety)' : 'Jute Variety'}
                  </label>
                  <select
                    value={calcVariety}
                    onChange={(e) => setCalcVariety(e.target.value as JuteVariety)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="TOSSA_JUTE">তোষা পাট (Tossa Jute)</option>
                    <option value="WHITE_JUTE">সাদা দেশি পাট (White Jute)</option>
                    <option value="MESTA_KENAF">মেস্তা কেনাফ (Mesta Kenaf)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'বিজেআরআই গ্রেড' : 'BJRI Quality Grade'}
                  </label>
                  <select
                    value={calcGrade}
                    onChange={(e) => setCalcGrade(e.target.value as JuteFiberGrade)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="BJC_SPECIAL_TOP">BJC Special Top (Grade 1)</option>
                    <option value="BJD_GRADE_2">BJD Grade 2 (Very High Lustre)</option>
                    <option value="BJD_GRADE_3">BJD Grade 3 (Commercial Spinning)</option>
                    <option value="BJD_GRADE_4">BJD Grade 4 (Sack Grade)</option>
                    <option value="BWC_SPECIAL_TOP">BWC White Special Top</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'গ্রস ওজন (কেজি)' : 'Gross (kg)'}
                  </label>
                  <input
                    type="number"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'ট্রাক/ট্যার (কেজি)' : 'Tare (kg)'}
                  </label>
                  <input
                    type="number"
                    value={tareWeight}
                    onChange={(e) => setTareWeight(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'আর্দ্রতা % (Moisture)' : 'Moisture %'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={moisturePct}
                    onChange={(e) => setMoisturePct(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'দর (টাকা/মন)' : 'Price/Maund'}
                  </label>
                  <input
                    type="number"
                    value={pricePerMaund}
                    onChange={(e) => setPricePerMaund(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCalculatingMoisture}
                className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Scale className="w-4 h-4" />
                <span>
                  {isCalculatingMoisture
                    ? (isBn ? 'হিসাব করা হচ্ছে...' : 'Calculating...')
                    : (isBn ? 'ওয়েইব্রিজ বিলিং ও এসক্রো হিসাব করুন' : 'Calculate Net Billable Maunds')}
                </span>
              </button>
            </form>

            {moistureResult && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                    {isBn ? 'ওয়েইব্রিজ বিলিং ফলাফল' : 'Weighbridge Settlement Summary'}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      moistureResult.status === 'ACCEPTED_SAFE_MOISTURE'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : moistureResult.status === 'ACCEPTED_WITH_MOISTURE_DEDUCTION'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : moistureResult.status === 'HIGH_MOISTURE_PENALTY_APPLIED'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {moistureResult.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-white p-2 rounded-lg border border-amber-100">
                    <span className="text-[10px] text-slate-500 block">{isBn ? 'নেট কাঁচা ওজন' : 'Net Raw'}</span>
                    <span className="text-sm font-bold text-slate-800">{moistureResult.netRawWeightKg} kg</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-100">
                    <span className="text-[10px] text-slate-500 block">{isBn ? 'আর্দ্রতা কর্তন' : 'Adjustment'}</span>
                    <span className="text-sm font-bold text-rose-600">
                      {moistureResult.moistureAdjustmentKg > 0 ? `-${moistureResult.moistureAdjustmentKg} kg` : '0 kg'}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-100">
                    <span className="text-[10px] text-slate-500 block">{isBn ? 'বিলযোগ্য মন' : 'Billable Maunds'}</span>
                    <span className="text-sm font-bold text-amber-700">{moistureResult.billableMaunds} মন</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-100">
                    <span className="text-[10px] text-slate-500 block">{isBn ? 'মোট এসক্রো প্রদেয়' : 'Total Payout'}</span>
                    <span className="text-sm font-bold text-emerald-700">৳{moistureResult.totalPayoutBdt.toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-xs text-amber-950 font-medium bg-amber-100/60 p-2.5 rounded-lg border border-amber-200/60">
                  {moistureResult.recommendation}
                </p>
              </div>
            )}
          </div>

          {/* CALCULATOR 2: BJRI RETTING POND ADVISORY */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isBn ? 'বিজেআরআই পচন মান ও পানি গুণমান মূল্যায়ন' : 'BJRI Retting Pond Quality Evaluator'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isBn
                    ? 'পানি তাপমাত্রা, পিএইচ ও ডিও মাত্রা যাচাই করে শ্যামলা পাটের ঝুঁকি হ্রাস'
                    : 'Evaluate temp, pH & dissolved oxygen to prevent dark Shyamla fiber staining'}
                </p>
              </div>
            </div>

            <form onSubmit={handlePondSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'পচন পদ্ধতি (Retting Method)' : 'Retting Method'}
                </label>
                <select
                  value={rettingMethod}
                  onChange={(e) => setRettingMethod(e.target.value as RettingMethod)}
                  className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="RIBBON_RETTING_ENZYMATIC">
                    রিবন রেটিং বিজেআরআই ব্যাকটেরিয়াল কনসোর্টিয়াম (8-10 Days)
                  </option>
                  <option value="CONVENTIONAL_WHOLE_PLANT_STEEP">
                    সনাতন গোটা গাছ জাগ দেওয়া (18-21 Days)
                  </option>
                  <option value="TANK_MICROBIAL_RETTING">
                    জিও-মেমব্রেন কৃত্রিম পচন ট্যাংক (10-12 Days)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'পানি তাপমাত্রা (°C)' : 'Temp (°C)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={waterTemp}
                    onChange={(e) => setWaterTemp(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'পিএইচ মান (pH)' : 'Water pH'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={waterPh}
                    onChange={(e) => setWaterPh(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'অক্সিজেন (DO mg/L)' : 'DO (mg/L)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={dissolvedOxygen}
                    onChange={(e) => setDissolvedOxygen(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'পচনের দিন (Days)' : 'Days Elapsed'}
                  </label>
                  <input
                    type="number"
                    value={daysSteeping}
                    onChange={(e) => setDaysSteeping(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isEvaluatingPond}
                className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Droplets className="w-4 h-4" />
                <span>
                  {isEvaluatingPond
                    ? (isBn ? 'বিশ্লেষণ চলছে...' : 'Evaluating...')
                    : (isBn ? 'পচন মান ও রঙ পূর্বাভাস দেখুন' : 'Evaluate Retting Quality')}
                </span>
              </button>
            </form>

            {pondResult && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                    {isBn ? 'পচন মান বিশ্লেষণ ফলাফল' : 'Retting Biochemical Analysis'}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {pondResult.status} ({pondResult.readinessScore}% Ready)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-slate-500 block mb-0.5">{isBn ? 'প্রত্যাশিত আঁশের রঙ' : 'Fiber Lustre Forecast'}</span>
                    <span className="font-bold text-amber-700">{pondResult.fiberColorPrediction}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-slate-500 block mb-0.5">{isBn ? 'টেনসাইল শক্তি পূর্বাভাস' : 'Tensile Strength'}</span>
                    <span className="font-bold text-emerald-700">{pondResult.tensileStrengthForecast}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  {pondResult.alerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className={`text-xs p-2 rounded flex items-start gap-2 ${
                        alert.includes('OVER-RETTING') || alert.includes('Hypoxic')
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100/70 text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{alert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2: CERTIFIED GOLDEN FIBER LOTS CATALOG */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {isBn ? 'প্রত্যয়িত সোনালী আঁশ লট ক্যাটালগ' : 'Certified Golden Fiber Bale Lots'}
              </h2>
              <p className="text-sm text-slate-500">
                {isBn
                  ? 'বিজেআরআই গুণমান প্রত্যয়নপ্রাপ্ত তোষা ও সাদা পাটের যাচাইকৃত বেল ও মোড়া লট'
                  : 'BJRI quality tested and weighbridge-verified Tossa & White jute raw fiber lots'}
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              {['ALL', 'TOSSA_JUTE', 'WHITE_JUTE'].map((varKey) => (
                <button
                  key={varKey}
                  onClick={() => setSelectedVarietyFilter(varKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedVarietyFilter === varKey
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {varKey === 'ALL'
                    ? (isBn ? 'সকল জাত' : 'All Varieties')
                    : varKey === 'TOSSA_JUTE'
                    ? (isBn ? 'তোষা পাট' : 'Tossa Jute')
                    : (isBn ? 'সাদা দেশি' : 'White Jute')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lotsLoading ? (
              <div className="col-span-4 py-12 text-center text-slate-400">
                {isBn ? 'পাট লট লোড হচ্ছে...' : 'Loading fiber lots...'}
              </div>
            ) : filteredLots.length === 0 ? (
              <div className="col-span-4 py-12 text-center text-slate-400">
                {isBn ? 'কোনো পাট লট পাওয়া যায়নি' : 'No fiber lots found'}
              </div>
            ) : (
              filteredLots.map((lot) => (
                <div
                  key={lot.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        {lot.grade}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{lot.lotNumber}</span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 line-clamp-1">{lot.balingCenterName}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lot.district} • {lot.farmerName}</span>
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">{isBn ? 'বেল সংখ্যা' : 'Bale Count'}</span>
                        <span className="font-bold text-slate-800">{lot.baleCount} টি ({lot.baleType})</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">{isBn ? 'বিলযোগ্য ওজন' : 'Billable'}</span>
                        <span className="font-bold text-amber-700">{lot.billableMaunds} মন / Maunds</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">{isBn ? 'আর্দ্রতা %' : 'Moisture %'}</span>
                        <span className={`font-bold ${lot.moisturePercentage <= 14 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {lot.moisturePercentage}%
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">{isBn ? 'টেনসাইল শক্তি' : 'Strength'}</span>
                        <span className="font-bold text-indigo-700">{lot.tensileStrengthGPerTex} g/tex</span>
                      </div>
                    </div>

                    <div className="mt-3 p-2 rounded-lg bg-amber-50/50 border border-amber-200/50 text-xs">
                      <span className="text-[11px] font-semibold text-amber-900 block">{lot.lustreScore}</span>
                      <span className="text-[10px] text-slate-500">
                        {isBn ? 'রুট-কাট:' : 'Root-cut:'} {lot.rootCutPercentage}% • {lot.bjriGradeCertNumber}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{isBn ? 'দর প্রতি মন' : 'Rate / Maund'}</span>
                      <span className="text-base font-extrabold text-slate-900">৳{lot.pricePerMaund.toLocaleString()}</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {lot.escrowStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* SECTION 3: MANDATORY JUTE PACKAGING ACT 2010 B2B DESK */}
        <section className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-3xl p-8 border border-slate-800 shadow-xl space-y-6">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>{isBn ? 'আইনগত বাধ্যবাধকতা' : 'Statutory Compliance'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              {isBn
                ? 'পণ্যে পাটজাত মোড়কের বাধ্যতামূলক ব্যবহার আইন ২০১০'
                : 'Mandatory Jute Packaging Act 2010 B2B Mill Desk'}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {isBn
                ? 'ধান, চাল, গম, ভুট্টা, চিনি, সার ও ফিডসহ ১৯টি খাদ্যশস্য ও রাসায়নিক পণ্যে শতভাগ পাটের বস্তা ব্যবহার নিশ্চিতকরণে শিল্প জুট মিল ও কৃষক সমবায়ের সমন্বিত সরবরাহ চুক্তি।'
                : 'Direct supply agreements for 50kg food-grade B.Twill grain sacks, 75kg Hessian bags, and CBC fabrics supplying national food silos, BADC/BCIC fertilizer plants, and export mills.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contractsLoading ? (
              <div className="col-span-3 text-center text-slate-400 py-8">
                {isBn ? 'চুক্তিপত্র লোড হচ্ছে...' : 'Loading contracts...'}
              </div>
            ) : contracts.length === 0 ? (
              <div className="col-span-3 text-center text-slate-400 py-8">
                {isBn ? 'কোনো সক্রিয় চুক্তি নেই' : 'No active contracts'}
              </div>
            ) : (
              contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-amber-400">{contract.contractCode}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                        {contract.escrowStatus}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-white">{contract.buyerMillName}</h3>
                    <p className="text-xs text-slate-300">{contract.sellerCooperativeName}</p>

                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-xs text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span>{isBn ? 'পণ্য:' : 'Product:'}</span>
                        <span className="font-medium text-amber-200">{contract.mandatoryPackagingCategory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{isBn ? 'পরিমাণ:' : 'Quantity:'}</span>
                        <span className="font-medium text-white">{contract.quantityMetricTonsOrBales} MT</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{isBn ? 'ডিপো:' : 'Depot:'}</span>
                        <span className="font-medium text-slate-400 truncate max-w-[150px]">{contract.destinationDepot}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{isBn ? 'মোট মূল্য' : 'Total Value'}</span>
                      <span className="text-base font-bold text-emerald-400">
                        ৳{contract.totalContractValueBdt.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-300 font-medium">
                      {isBn ? 'ডেডলাইন:' : 'Deadline:'} {contract.deliveryDeadline}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* SECTION 4: LIVE RETTING CANAL & POND TELEMETRY */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isBn ? 'মাঠপর্যায়ের পচন ক্যানাল ও ট্যাংক আইওটি ট্র্যাকিং' : 'Field Retting Canal & Tank Telemetry'}
              </h2>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'ফরিদপুর, রংপুর, যশোর ও জামালপুরের পচন জলাশয়ের তাপমাত্রা ও দ্রবীভূত অক্সিজেন মনিটরিং'
                  : 'Real-time telemetry of river tributaries and retting ponds across core jute districts'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {batches.map((batch) => (
              <div key={batch.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">{batch.batchCode}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      batch.status === 'FIBER_SEPARATION_READY'
                        ? 'bg-emerald-100 text-emerald-800'
                        : batch.status === 'OVER_RETTED_RISK'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {batch.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-slate-800">{batch.waterSourceType}</h4>
                  <p className="text-xs text-slate-500">{batch.upazila}, {batch.district}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-1.5 rounded">
                    <span className="text-[10px] text-slate-400 block">Temp</span>
                    <span className="font-bold text-slate-700">{batch.waterTempCelsius}°C</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded">
                    <span className="text-[10px] text-slate-400 block">pH</span>
                    <span className="font-bold text-slate-700">{batch.waterPh}</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded">
                    <span className="text-[10px] text-slate-400 block">DO</span>
                    <span className="font-bold text-emerald-700">{batch.dissolvedOxygenMgL} mg/L</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
                  <span>{isBn ? 'দিন অতিবাহিত:' : 'Elapsed:'} {batch.daysElapsed} দিন</span>
                  <span>{isBn ? 'লক্ষ্যমাত্রা:' : 'Yield:'} {batch.targetFiberYieldMaunds} মন</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
