'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Activity,
  MapPin,
  Thermometer,
  Scale,
  ArrowRight,
  Gavel,
  Droplets,
  Award,
  Layers,
  Flame,
  Building2,
  ScrollText,
} from 'lucide-react';
import {
  useGetTeaOverviewStatsQuery,
  useGetAllAuctionLotsQuery,
  useGetAllFactoryBatchesQuery,
  useCalculateGreenLeafIntakeMutation,
  useEvaluateLiquorQualityMutation,
  usePlaceAuctionBidMutation,
  TeaGardenRegion,
  TeaProcessingType,
  TeaLeafGrade,
  GreenLeafIntakeResult,
  LiquorQualityResult,
} from '../teaEstateApi';

interface TeaEstateMarketplaceViewProps {
  lang: string;
}

export const TeaEstateMarketplaceView: React.FC<TeaEstateMarketplaceViewProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  // API Queries
  const { data: statsData, isLoading: statsLoading } = useGetTeaOverviewStatsQuery();
  const { data: auctionData, isLoading: auctionLoading } = useGetAllAuctionLotsQuery();
  const { data: factoryData, isLoading: factoryLoading } = useGetAllFactoryBatchesQuery();

  // Mutations
  const [calculateIntake, { isLoading: isCalculatingIntake }] = useCalculateGreenLeafIntakeMutation();
  const [evaluateLiquor, { isLoading: isEvaluatingLiquor }] = useEvaluateLiquorQualityMutation();
  const [placeBid, { isLoading: isPlacingBid }] = usePlaceAuctionBidMutation();

  // Green Leaf Calculator State
  const [grossWeight, setGrossWeight] = useState<number>(185);
  const [tareBagWeight, setTareBagWeight] = useState<number>(5);
  const [finePluckPct, setFinePluckPct] = useState<number>(88);
  const [surfaceWater, setSurfaceWater] = useState<number>(3.5);
  const [ratePerKg, setRatePerKg] = useState<number>(34);
  const [intakeResult, setIntakeResult] = useState<GreenLeafIntakeResult | null>(null);

  // Liquor Quality Evaluator State
  const [calcProcess, setCalcProcess] = useState<TeaProcessingType>('ARTISANAL_ORTHODOX_BLACK');
  const [calcGrade, setCalcGrade] = useState<TeaLeafGrade>('FTGFOP1');
  const [brightness, setBrightness] = useState<number>(9.2);
  const [briskness, setBriskness] = useState<number>(9.4);
  const [liquorBody, setLiquorBody] = useState<number>(9.0);
  const [colorScore, setColorScore] = useState<number>(8.8);
  const [liquorResult, setLiquorResult] = useState<LiquorQualityResult | null>(null);

  // Bid Modal State
  const [selectedLotForBid, setSelectedLotForBid] = useState<{ id: string; lotNumber: string; currentPrice: number } | null>(null);
  const [bidBrokerName, setBidBrokerName] = useState('National Brokers Ltd');
  const [bidAmountPerKg, setBidAmountPerKg] = useState<number>(0);
  const [bidSuccessMessage, setBidSuccessMessage] = useState<string | null>(null);
  const [bidErrorMessage, setBidErrorMessage] = useState<string | null>(null);

  // Filters
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('ALL');

  const stats = statsData?.data;
  const auctionLots = auctionData?.data || [];
  const factoryBatches = factoryData?.data || [];

  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await calculateIntake({
        grossWeightKg: Number(grossWeight),
        tareBagWeightKg: Number(tareBagWeight),
        finePluckingPercentage: Number(finePluckPct),
        surfaceWaterDeductionKg: Number(surfaceWater),
        ratePerKgBdt: Number(ratePerKg),
      }).unwrap();
      if (res.success) {
        setIntakeResult(res.data);
      }
    } catch (err) {
      console.error('Failed to calculate intake', err);
    }
  };

  const handleLiquorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await evaluateLiquor({
        brightnessScore: Number(brightness),
        brisknessScore: Number(briskness),
        liquorBodyScore: Number(liquorBody),
        colorScore: Number(colorScore),
        processingType: calcProcess,
        grade: calcGrade,
      }).unwrap();
      if (res.success) {
        setLiquorResult(res.data);
      }
    } catch (err) {
      console.error('Failed to evaluate liquor', err);
    }
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLotForBid) return;
    setBidSuccessMessage(null);
    setBidErrorMessage(null);

    try {
      const res = await placeBid({
        id: selectedLotForBid.id,
        dto: {
          brokerName: bidBrokerName,
          bidPerKgBdt: Number(bidAmountPerKg),
        },
      }).unwrap();

      if (res.success) {
        setBidSuccessMessage(
          isBn
            ? `লট ${selectedLotForBid.lotNumber}-এ প্রতি কেজি ৳${bidAmountPerKg} সফলভাবে বিড করা হয়েছে!`
            : `Bid of ৳${bidAmountPerKg}/kg placed successfully on Lot ${selectedLotForBid.lotNumber}!`
        );
        setTimeout(() => {
          setSelectedLotForBid(null);
          setBidSuccessMessage(null);
        }, 3000);
      }
    } catch (err: any) {
      setBidErrorMessage(err?.data?.message || 'Failed to place bid. Ensure bid is higher than current price.');
    }
  };

  const filteredLots = auctionLots.filter((lot) => {
    if (selectedRegionFilter === 'ALL') return true;
    return lot.auctionCenter.includes(selectedRegionFilter);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-900 to-amber-950 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-xs sm:text-sm font-medium">
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>
                  {isBn
                    ? 'বাংলাদেশ চা বোর্ড ও আন্তর্জাতিক নিলাম সমন্বিত প্ল্যাটফর্ম'
                    : 'Bangladesh Tea Board & Digital Tea Auction Platform'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                {isBn
                  ? 'চা বাগান নিলাম, স্পেশালিটি অর্থোডক্স ও ক্ষুদ্র চা চাষি প্ল্যাটফর্ম'
                  : 'Tea Estate Auction, Specialty Orthodox & Smallholder Sourcing Engine'}
              </h1>
              <p className="text-emerald-100/90 text-sm sm:text-base max-w-2xl leading-relaxed">
                {isBn
                  ? 'সিলেট ও পঞ্চগড়ের ক্ষুদ্র চা চাষিদের "দুটি পাতা একটি কুঁড়ি" ডিজিটাল ইন্টেক ভাউচার, অর্থোডক্স ও সিটিসি কারখানার আইওটি উইদারিং/ফার্মেন্টেশন এবং চট্টগ্রাম ও শ্রীমঙ্গল চা নিলাম লাইভ বিডিং।'
                  : 'Empowering Sylhet, Sreemangal and Panchagarh smallholders with "two leaves and a bud" digital intake tickets, IoT factory withering/fermentation tracking, and live broker auction bidding.'}
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href={`/${lang}/seller/tea-estate`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <Scale className="w-4 h-4" />
                  <span>{isBn ? 'ক্ষুদ্র চা চাষি ইন্টেক হাব' : 'Smallholder Grower Hub'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={`/${lang}/admin/tea-estate`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-white font-medium border border-emerald-600/40 transition-all"
                >
                  <Gavel className="w-4 h-4" />
                  <span>{isBn ? 'চা বোর্ড ও নিলাম ডেস্ক' : 'Tea Board & Auction Desk'}</span>
                </Link>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="lg:col-span-4 bg-slate-900/60 backdrop-blur-md border border-emerald-400/20 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>{isBn ? 'জাতীয় চা খাত লাইভ পরিসংখ্যান' : 'National Tea Sector Telemetry'}</span>
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-emerald-400/10">
                  <span className="text-xs text-slate-300">{isBn ? 'কাঁচা পাতা সংগ্রহ' : 'Green Leaf Intake'}</span>
                  <span className="text-base font-bold text-emerald-400">
                    {statsLoading ? '...' : `${stats?.totalGreenLeafKg?.toLocaleString() || '406.5'} kg`}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-emerald-400/10">
                  <span className="text-xs text-slate-300">{isBn ? 'চাষি এমএফএস পরিশোধ' : 'Grower MFS Payout'}</span>
                  <span className="text-base font-bold text-amber-300">
                    {statsLoading ? '...' : `৳${stats?.totalSmallholderPayoutBdt?.toLocaleString() || '13,891'}`}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-emerald-400/10">
                  <span className="text-xs text-slate-300">{isBn ? 'তৈরি চা উৎপাদন' : 'Finished Tea Produced'}</span>
                  <span className="text-base font-bold text-teal-300">
                    {statsLoading ? '...' : `${stats?.totalProcessedTeaKg?.toLocaleString() || '965'} kg`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-300">{isBn ? 'নিলাম ভ্যালুয়েশন' : 'Auction Valuation'}</span>
                  <span className="text-base font-bold text-amber-400">
                    {statsLoading ? '...' : `৳${stats?.totalAuctionValuationBdt?.toLocaleString() || '8,20,000'}`}
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
          {/* CALCULATOR 1: SMALLHOLDER GREEN LEAF INTAKE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isBn ? 'ক্ষুদ্র চা চাষি কাঁচা পাতা ইন্টেক ক্যালকুলেটর' : 'Smallholder Green Leaf Intake & Plucking Quality'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isBn
                    ? '"দুটি পাতা একটি কুঁড়ি" (Two Leaves & A Bud) মান যাচাই ও বৃষ্টি পানির ওজন কর্তন'
                    : 'Fine plucking ratio assessment, surface rain deduction & 5% superfine plucking bonus'}
                </p>
              </div>
            </div>

            <form onSubmit={handleIntakeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'গ্রস ওজন (কেজি)' : 'Gross (kg)'}
                  </label>
                  <input
                    type="number"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'ব্যাগ ট্যার (কেজি)' : 'Tare Bag (kg)'}
                  </label>
                  <input
                    type="number"
                    value={tareBagWeight}
                    onChange={(e) => setTareBagWeight(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'দুটি পাতা একটি কুঁড়ি %' : 'Fine Pluck %'}
                  </label>
                  <input
                    type="number"
                    value={finePluckPct}
                    onChange={(e) => setFinePluckPct(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'বৃষ্টি/শিশির পানি কর্তন (কেজি)' : 'Surface Rain Water (kg)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={surfaceWater}
                    onChange={(e) => setSurfaceWater(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'চা বোর্ড নির্ধারিত দর (টাকা/কেজি)' : 'BTB Rate (BDT/kg)'}
                  </label>
                  <input
                    type="number"
                    value={ratePerKg}
                    onChange={(e) => setRatePerKg(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCalculatingIntake}
                className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Scale className="w-4 h-4" />
                <span>
                  {isCalculatingIntake
                    ? (isBn ? 'হিসাব করা হচ্ছে...' : 'Calculating...')
                    : (isBn ? 'ইন্টেক ওজন ও পরিশোধ হিসাব করুন' : 'Calculate Net Billable Weight')}
                </span>
              </button>
            </form>

            {intakeResult && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                    {isBn ? 'ইন্টেক স্লিপ ফলাফল' : 'Intake Ticket Summary'}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      intakeResult.pluckingStandard === 'SUPERFINE_TWO_LEAVES_AND_BUD'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : intakeResult.pluckingStandard === 'STANDARD_FINE_PLUCK'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {intakeResult.pluckingStandard}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-white p-2 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-slate-500 block">{isBn ? 'নেট কাঁচা পাতা' : 'Net Raw'}</span>
                    <span className="text-sm font-bold text-slate-800">{intakeResult.netRawWeightKg} kg</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-slate-500 block">{isBn ? 'মোট কর্তন' : 'Deductions'}</span>
                    <span className="text-sm font-bold text-rose-600">
                      -{intakeResult.surfaceWaterMoistureDeductionKg + intakeResult.coarseLeafDeductionKg} kg
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-slate-500 block">{isBn ? 'বিলযোগ্য পাতা' : 'Billable Leaf'}</span>
                    <span className="text-sm font-bold text-emerald-700">{intakeResult.netBillableLeafWeightKg} kg</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-slate-500 block">{isBn ? 'মোট প্রদেয়' : 'Total Payout'}</span>
                    <span className="text-sm font-bold text-amber-700">৳{intakeResult.totalPayoutBdt.toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-xs text-emerald-950 font-medium bg-emerald-100/60 p-2.5 rounded-lg border border-emerald-200/60">
                  {intakeResult.recommendation}
                </p>
              </div>
            )}
          </div>

          {/* CALCULATOR 2: TEA LIQUOR SENSORY EVALUATOR */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isBn ? 'চা টেস্টার লিকার সেন্সরি ও এক্সপোর্ট ভ্যালুয়েশন' : 'Tea Taster Organoleptic Sensory & Valuation'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isBn
                    ? 'উজ্জ্বলতা (Brightness), ব্রিস্কনেস (Briskness) ও কাপ স্কোর (১-১০) মূল্যায়ন'
                    : 'Evaluate liquor brightness, briskness, body & color index (1-10) for export pricing'}
                </p>
              </div>
            </div>

            <form onSubmit={handleLiquorSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'চা প্রক্রিয়াজাতকরণ' : 'Processing Type'}
                  </label>
                  <select
                    value={calcProcess}
                    onChange={(e) => setCalcProcess(e.target.value as TeaProcessingType)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="ARTISANAL_ORTHODOX_BLACK">আর্টিসানাল অর্থোডক্স ব্ল্যাক (Orthodox)</option>
                    <option value="CTC_BLACK_TEA">সিটিসি ব্ল্যাক টি (CTC Granular)</option>
                    <option value="GREEN_TEA_STEAMED_PANFIRED">গ্রিন টি (Steamed Green Tea)</option>
                    <option value="SILVER_NEEDLE_WHITE_TEA">সিলভার নিডল হোয়াইট টি (Silver Needle)</option>
                    <option value="OOLONG_SEMI_FERMENTED">উলং টি (Oolong)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'আঁশের গ্রেড' : 'Leaf Grade'}
                  </label>
                  <select
                    value={calcGrade}
                    onChange={(e) => setCalcGrade(e.target.value as TeaLeafGrade)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="FTGFOP1">FTGFOP1 (Finest Tippy Golden Flowery)</option>
                    <option value="TGFOP">TGFOP (Tippy Golden Flowery)</option>
                    <option value="BOP">BOP (Broken Orange Pekoe)</option>
                    <option value="OF">OF (Orange Fannings)</option>
                    <option value="SPECIALTY_SILVER_TIPS">Specialty Silver Tips</option>
                    <option value="ORGANIC_SENCHA_GREEN">Organic Sencha Green</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'উজ্জ্বলতা (1-10)' : 'Brightness (1-10)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'ব্রিস্কনেস (1-10)' : 'Briskness (1-10)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={briskness}
                    onChange={(e) => setBriskness(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'লিকার বডি (1-10)' : 'Liquor Body'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={liquorBody}
                    onChange={(e) => setLiquorBody(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'রঙ মান (1-10)' : 'Color (1-10)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={colorScore}
                    onChange={(e) => setColorScore(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isEvaluatingLiquor}
                className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>
                  {isEvaluatingLiquor
                    ? (isBn ? 'মূল্যায়ন চলছে...' : 'Evaluating...')
                    : (isBn ? 'লিকার স্কোর ও এক্সপোর্ট ভ্যালুয়েশন দেখুন' : 'Evaluate Cup Score')}
                </span>
              </button>
            </form>

            {liquorResult && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                    {isBn ? 'সেন্সরি টেস্টার স্কোরকার্ড' : 'Sensory Taster Scorecard'}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    Cup Score: {liquorResult.overallCupQualityScore}/100 ({liquorResult.valuationMultiplier}x Premium)
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-amber-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    {isBn ? 'আন্তর্জাতিক এক্সপোর্ট উপযুক্ততা' : 'Export Suitability'}
                  </span>
                  <p className="text-xs font-bold text-emerald-800">{liquorResult.exportSuitability}</p>
                </div>

                <p className="text-xs text-amber-950 font-medium bg-amber-100/60 p-2.5 rounded-lg border border-amber-200/60">
                  {liquorResult.tasterNotes}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2: DIGITAL AUCTION CATALOG & LIVE BIDDING */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {isBn ? 'চট্টগ্রাম ও শ্রীমঙ্গল লাইভ চা নিলাম ক্যাটালগ' : 'Chittagong & Sreemangal Live Tea Auction Catalog'}
              </h2>
              <p className="text-sm text-slate-500">
                {isBn
                  ? 'বাংলাদেশ চা বোর্ড অনুমোদিত ব্রোকার ও এক্সপোর্টারদের জন্য লাইভ বিডিং বোর্ড'
                  : 'Live bidding floor for licensed tea brokers, blenders, and specialty exporters'}
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              {['ALL', 'CHITTAGONG', 'SREEMANGAL', 'PANCHAGARH'].map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setSelectedRegionFilter(filterKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedRegionFilter === filterKey
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {filterKey === 'ALL'
                    ? (isBn ? 'সকল নিলাম কেন্দ্র' : 'All Auction Centers')
                    : filterKey === 'CHITTAGONG'
                    ? (isBn ? 'চট্টগ্রাম' : 'Chittagong')
                    : filterKey === 'SREEMANGAL'
                    ? (isBn ? 'শ্রীমঙ্গল' : 'Sreemangal')
                    : (isBn ? 'পঞ্চগড়' : 'Panchagarh')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctionLoading ? (
              <div className="col-span-3 py-12 text-center text-slate-400">
                {isBn ? 'নিলাম লট লোড হচ্ছে...' : 'Loading auction lots...'}
              </div>
            ) : filteredLots.length === 0 ? (
              <div className="col-span-3 py-12 text-center text-slate-400">
                {isBn ? 'কোনো নিলাম লট পাওয়া যায়নি' : 'No auction lots found'}
              </div>
            ) : (
              filteredLots.map((lot) => (
                <div
                  key={lot.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {lot.grade}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{lot.lotNumber}</span>
                    </div>

                    <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{lot.gardenMark}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lot.auctionCenter} • Sale No. {lot.saleNumber}</span>
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">{isBn ? 'প্যাকেজ সংখ্যা' : 'Packages'}</span>
                        <span className="font-bold text-slate-800">{lot.packageCountBagsOrChests} chests/bags</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">{isBn ? 'নেট ওজন' : 'Net Weight'}</span>
                        <span className="font-bold text-emerald-700">{lot.netWeightKg} kg</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">{isBn ? 'রিজার্ভ দর' : 'Reserve'}</span>
                        <span className="font-bold text-slate-600">৳{lot.reservePricePerKgBdt}/kg</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">{isBn ? 'সর্বোচ্চ বিড' : 'High Bid'}</span>
                        <span className="font-bold text-amber-700">৳{lot.currentHighBidBdt}/kg</span>
                      </div>
                    </div>

                    <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/50 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-emerald-900">
                          {isBn ? 'টেস্টার রেটিং:' : 'Taster Scores:'}
                        </span>
                        <span className="font-semibold text-emerald-800 text-[11px]">
                          Briskness {lot.tasterScoreBriskness} • Brightness {lot.tasterScoreBrightness}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 italic line-clamp-2">"{lot.tasterFlavorNotes}"</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{isBn ? 'শীর্ষ ব্রোকার' : 'High Bidder'}</span>
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[130px] block">
                        {lot.winningBrokerName}
                      </span>
                    </div>

                    {lot.auctionStatus === 'ACTIVE_BIDDING' ? (
                      <button
                        onClick={() => {
                          setSelectedLotForBid({
                            id: lot.id,
                            lotNumber: lot.lotNumber,
                            currentPrice: Number(lot.currentHighBidBdt) || Number(lot.reservePricePerKgBdt),
                          });
                          setBidAmountPerKg((Number(lot.currentHighBidBdt) || Number(lot.reservePricePerKgBdt)) + 5);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Gavel className="w-3.5 h-3.5" />
                        <span>{isBn ? 'বিড করুন' : 'Place Bid'}</span>
                      </button>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {lot.auctionStatus}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* SECTION 3: TEA FACTORY PROCESSING TELEMETRY */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isBn ? 'চা প্রক্রিয়াজাতকরণ কারখানা আইওটি টেলিমেট্রি' : 'Tea Factory Processing Line IoT Telemetry'}
              </h2>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'উইদারিং ট্রফ আর্দ্রতা হ্রাস, রোলিং ঘর্ষণ তাপমাত্রা ও ড্রায়ার ডিসচার্জ মান'
                  : 'Real-time monitoring of withering moisture depletion, CTC rolling friction heat and dryer discharge moisture'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {factoryBatches.map((batch) => (
              <div key={batch.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-slate-800">{batch.batchNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                    {batch.processingType}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900">{batch.factoryName}</h3>
                  <p className="text-xs text-slate-500">{batch.region}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">{isBn ? 'উইদারিং সময়' : 'Withering'}</span>
                    <span className="font-bold text-slate-800">{batch.witheringTroughHours}h</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">{isBn ? 'রোলিং হিট' : 'Rolling Heat'}</span>
                    <span className="font-bold text-amber-700">{batch.rollingFrictionTempCelsius}°C</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">{isBn ? 'ড্রায়ার আর্দ্রতা' : 'Discharge'}</span>
                    <span className="font-bold text-emerald-700">{batch.dryerDischargeMoisturePercentage}%</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between text-xs">
                  <span className="text-slate-500">
                    {isBn ? 'কাঁচা পাতা:' : 'Green Leaf:'} {batch.greenLeafIntakeKg} kg
                  </span>
                  <span className="font-bold text-slate-900">
                    {isBn ? 'তৈরি চা ফলন:' : 'Yield:'} {batch.finishedTeaYieldKg} kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* BID PLACEMENT MODAL */}
      {selectedLotForBid && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  {isBn ? 'লাইভ চা নিলামে বিড করুন' : 'Place Live Auction Bid'}
                </h3>
                <span className="text-xs font-mono text-slate-400">{selectedLotForBid.lotNumber}</span>
              </div>
              <button
                onClick={() => setSelectedLotForBid(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {bidSuccessMessage && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                {bidSuccessMessage}
              </div>
            )}
            {bidErrorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {bidErrorMessage}
              </div>
            )}

            <form onSubmit={handleBidSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'লাইসেন্সপ্রাপ্ত ব্রোকারের নাম' : 'Licensed Broker Name'}
                </label>
                <input
                  type="text"
                  value={bidBrokerName}
                  onChange={(e) => setBidBrokerName(e.target.value)}
                  className="w-full text-sm rounded-lg border-slate-300 border p-2"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">{isBn ? 'বিড রেট (টাকা/কেজি)' : 'Bid Rate (BDT/kg)'}</span>
                  <span className="text-slate-500">Current: ৳{selectedLotForBid.currentPrice}/kg</span>
                </div>
                <input
                  type="number"
                  min={selectedLotForBid.currentPrice + 1}
                  value={bidAmountPerKg}
                  onChange={(e) => setBidAmountPerKg(Number(e.target.value))}
                  className="w-full text-sm rounded-lg border-slate-300 border p-2 font-bold text-amber-700"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedLotForBid(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isPlacingBid}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Gavel className="w-3.5 h-3.5" />
                  <span>
                    {isPlacingBid
                      ? (isBn ? 'বিড জমা হচ্ছে...' : 'Submitting...')
                      : (isBn ? 'বিড নিশ্চিত করুন' : 'Confirm Bid')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
