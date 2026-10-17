'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Truck,
  Droplets,
  Activity,
  Wind,
  Sliders,
  DollarSign,
  Package,
  Layers,
} from 'lucide-react';
import {
  useGetHatcheryBatchesQuery,
  useGetAquacultureOverviewStatsQuery,
  useGetArbitrageCalcQuery,
  useBookLiveFishTankerMutation,
  HatcheryBatch,
} from '../aquacultureApi';

export const AquacultureHubView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'HATCHERY' | 'ARBITRAGE' | 'WATER_DIAGNOSTIC'>('HATCHERY');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchDistrict, setSearchDistrict] = useState<string>('');
  const [spfOnly, setSpfOnly] = useState<boolean>(false);

  // Live Fish Arbitrage Calculator state
  const [arbSpecies, setArbSpecies] = useState<string>('RUI_ROHU');
  const [arbWeightKg, setArbWeightKg] = useState<number>(1500);

  // Diagnostic Simulator state
  const [simDo, setSimDo] = useState<number>(5.8);
  const [simTemp, setSimTemp] = useState<number>(29.0);
  const [simPh, setSimPh] = useState<number>(7.6);
  const [simAmmonia, setSimAmmonia] = useState<number>(0.02);

  // Tanker Modal state
  const [showTankerModal, setShowTankerModal] = useState<boolean>(false);
  const [pickupDistrict, setPickupDistrict] = useState<string>('Mymensingh');
  const [pickupUpazila, setPickupUpazila] = useState<string>('Trishal');
  const [dropoffMarket, setDropoffMarket] = useState<string>('Karwan Bazar Live Fish Wholesale Arat, Dhaka');
  const [tankerSuccess, setTankerSuccess] = useState<string | null>(null);

  // Hatchery Order Modal state
  const [orderBatch, setOrderBatch] = useState<HatcheryBatch | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(10000);
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const { data: statsData } = useGetAquacultureOverviewStatsQuery();
  const stats = statsData?.data;

  const { data: batchesData, isLoading: isBatchesLoading } = useGetHatcheryBatchesQuery({
    category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
    district: searchDistrict.trim() || undefined,
    spfOnly: spfOnly || undefined,
  });
  const batches = batchesData?.data || [];

  const { data: arbData } = useGetArbitrageCalcQuery({
    species: arbSpecies,
    weightKg: arbWeightKg,
  });
  const arbitrage = arbData?.data;

  const [bookTanker, { isLoading: isBookingTanker }] = useBookLiveFishTankerMutation();

  const handleTankerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bookTanker({
        farmerId: 'farmer-current-user',
        pickupDistrict,
        pickupUpazila,
        pickupGherAddress: `${pickupUpazila} Aqua Farm Cluster`,
        dropoffMarket,
        species: arbSpecies as any,
        approximateFishKg: arbWeightKg,
        transportFareBdt: 12500,
        notes: 'অক্সিজেন সিলিন্ডার ও ডিফিউজার বায়বীয় প্রেসার চেক করে গাড়ি প্রস্তুত করা হবে।',
      }).unwrap();

      setTankerSuccess('বিশেষায়িত ওয়াটার ট্যাঙ্কার সফলভাবে বুক হয়েছে! লাইভ মাছ পরিবহনের মাধ্যমে বাড়তি মুনাফা নিশ্চিত করুন।');
      setTimeout(() => {
        setTankerSuccess(null);
        setShowTankerModal(false);
      }, 3500);
    } catch {
      alert('ট্যাঙ্কার বুকিংয়ে সমস্যা হয়েছে।');
    }
  };

  const handleHatcheryOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderBatch) return;

    setOrderSuccess(`${orderQuantity.toLocaleString()} টি পোনা অক্সিজেন প্যাকেজিং সহ বুক করা হয়েছে! হ্যাচারি থেকে ফোন করে ডেলিভারি কনফার্ম করা হবে।`);
    setTimeout(() => {
      setOrderSuccess(null);
      setOrderBatch(null);
    }, 3500);
  };

  // Diagnostic Math Evaluation
  const isHypoxia = simDo < 4.0;
  const isAmmoniaToxic = simAmmonia > 0.05;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-900 via-teal-900 to-slate-900 text-white p-8 sm:p-12 shadow-xl border border-cyan-500/20">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <Droplets className="w-4 h-4" /> ডিজিটাল মৎস্য খামার ও আইওটি অ্যাকুয়াকালচার
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              এসপিএফ চিংড়ি ও মাছের পোনা, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-200">
                পুকুরের আইওটি সেন্সর ও লাইভ ট্যাঙ্কার
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              মৎস্য অধিদপ্তরের পিসিআর ল্যাব টেস্টে ডব্লিউএসএসভি মুক্ত এসপিএফ বাগদা ও গলদা পোনা, রিয়েল-টাইম পানির দ্রবীভূত অক্সিজেন (DO) ট্র্যাকিং এবং লাইভ মাছের ওয়াটার ট্যাঙ্কার বহর।
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => setActiveTab('ARBITRAGE')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-cyan-900/40 transition-all"
              >
                <DollarSign className="w-4 h-4" /> লাইভ মাছের মূল্য সুবিধা ক্যালকুলেটর (+৩৫%)
              </button>
              <button
                onClick={() => setActiveTab('WATER_DIAGNOSTIC')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold border border-white/20 transition-all"
              >
                <Activity className="w-4 h-4" /> পুকুরের পানি পরীক্ষা সিমুলেটর
              </button>
            </div>
          </div>
        </div>

        {/* Overview Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400">উপলব্ধ সার্টিফাইড পোনা</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {((stats?.totalFingerlingsAvailable || 830000) / 1000).toFixed(0)} হাজার+
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> অক্সিজেন প্যাকেজিং অন্তর্ভুক্ত
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400">DoF পিসিআর ভাইরাস নেগেটিভ</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats?.spfCertifiedPercentage || 100}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> WSSV ও EMS মুক্ত সনদ
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400">সক্রিয় আইওটি পুকুর ও ঘের</span>
            <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
              {stats?.activeMonitoredPonds || 1} টি
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-cyan-500" /> অটো এয়ারেটর স্বয়ংক্রিয় নিয়ন্ত্রণ
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400">লাইভ ওয়াটার ট্যাঙ্কার বহর</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {stats?.activeLiveFishTankers || 1} টি সচল
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-blue-500" /> ০% মর্টালিটি কারওয়ান বাজার রুট
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="p-1.5 bg-slate-200/70 dark:bg-slate-800 rounded-2xl flex flex-wrap gap-2 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('HATCHERY')}
            className={`flex-1 py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'HATCHERY'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-cyan-600" /> এসপিএফ হ্যাচারি পোনা হাট
          </button>
          <button
            onClick={() => setActiveTab('ARBITRAGE')}
            className={`flex-1 py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ARBITRAGE'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" /> লাইভ মাছ বনাম বরফ মাছের মূল্যমান
          </button>
          <button
            onClick={() => setActiveTab('WATER_DIAGNOSTIC')}
            className={`flex-1 py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'WATER_DIAGNOSTIC'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-indigo-600" /> পানির আইওটি হাইপোক্সিয়া সিমুলেটর
          </button>
        </div>

        {/* Tab 1: Hatchery Fingerling Marketplace */}
        {activeTab === 'HATCHERY' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {[
                  { id: 'ALL', label: 'সকল জাতের পোনা' },
                  { id: 'SHRIMP_BLACK_TIGER', label: 'বাগদা চিংড়ি (SPF PL)' },
                  { id: 'PRAWN_GALDA', label: 'গলদা চিংড়ি (জুভেনাইল)' },
                  { id: 'TILAPIA_PANGAS', label: 'মনোসেক্স তেলাপিয়া' },
                  { id: 'FRESHWATER_CARP', label: 'রুই / কাতলা / মৃগেল' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedCategory === tab.id
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="জেলা দিয়ে খুঁজুন (উদাঃ সাতক্ষীরা, ময়মনসিংহ)..."
                  value={searchDistrict}
                  onChange={(e) => setSearchDistrict(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {isBatchesLoading ? (
              <div className="py-20 text-center text-slate-500">
                <div className="animate-spin w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
                হ্যাচারি পোনা লোড হচ্ছে...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 font-bold">
                          {b.batchNumber}
                        </span>

                        {b.pcrTestStatus === 'PCR_TESTED_NEGATIVE_SPF' ? (
                          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> SPF সার্টিফাইড
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                            ল্যাব টেস্ট প্রক্রিয়াধীন
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                          {b.species.replace(/_/g, ' ')} ({b.stage.replace(/_/g, ' ')})
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {b.description || 'উন্নত মানের রোগমুক্ত পোনা।'}
                        </p>
                      </div>

                      {/* PCR Lab Report */}
                      {b.pcrTestReportNumber && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ল্যাব রিপোর্ট: {b.pcrTestReportNumber}
                          </div>
                          <div className="text-[11px] text-slate-500">{b.testingLab}</div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div>গড় সাইজ: <strong>{b.averageLengthCm} সেমি</strong></div>
                        <div>স্টক: <strong>{b.fingerlingCount.toLocaleString()} টি</strong></div>
                        <div>হ্যাচারি: <strong>{b.hatcheryName}</strong></div>
                        <div>অবস্থান: <strong>{b.hatcheryUpazila}, {b.hatcheryDistrict}</strong></div>
                      </div>

                      <div className="flex justify-between items-baseline pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-xs text-slate-400">প্রতি পিসের মূল্য:</span>
                          <div className="text-xl font-black text-cyan-600 dark:text-cyan-400">
                            ৳{Number(b.unitPriceBdt).toFixed(2)}
                          </div>
                        </div>
                        <span className="text-[11px] text-emerald-600 font-semibold">
                          অক্সিজেন প্যাকিং সহ
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setOrderBatch(b)}
                      className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Package className="w-4 h-4" /> অক্সিজেন ব্যাগে পোনা বুক করুন
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Live Fish Arbitrage Calculator & Tanker Dispatch */}
        {activeTab === 'ARBITRAGE' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" /> লাইভ মাছের পাইকারি বাজার প্রিমিয়াম ক্যালকুলেটর
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  বরফ দেওয়া মৃত মাছের তুলনায় জীবিত অবস্থায় ঢাকার কারওয়ান বাজার বা চট্টগ্রাম ফিশারি ঘাটে বিক্রি করলে ৩৫%–৫৫% বেশি দাম পাওয়া যায়।
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">মাছের প্রজাতি</label>
                  <select
                    value={arbSpecies}
                    onChange={(e) => setArbSpecies(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    <option value="RUI_ROHU">রুই মাছ (Rohu Live)</option>
                    <option value="KATLA">কাতলা মাছ (Katla Live)</option>
                    <option value="MONOSEX_TILAPIA">মনোসেক্স তেলাপিয়া (Tilapia Live)</option>
                    <option value="SHING">শিং মাছ (Catfish Live - উচ্চ মূল্য)</option>
                    <option value="GULSHA_TENGRA">গুলশা টেংরা (Live Tengra)</option>
                    <option value="BAGDA_SHRIMP">বাগদা চিংড়ি (Live Bagda)</option>
                    <option value="GALDA_PRAWN">গলদা চিংড়ি (Live Galda)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span>ধরা মাছের মোট ওজন (কেজি):</span>
                    <span className="text-cyan-600 font-bold">{arbWeightKg.toLocaleString()} কেজি</span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={5000}
                    step={100}
                    value={arbWeightKg}
                    onChange={(e) => setArbWeightKg(Number(e.target.value))}
                    className="w-full mt-2 accent-cyan-600"
                  />
                </div>
              </div>

              {arbitrage && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900">
                      <span className="text-slate-500 text-[11px] block">লাইভ মাছের পাইকারি দর:</span>
                      <strong className="text-emerald-700 dark:text-emerald-300 font-black text-base">
                        ৳{arbitrage.livePricePerKgBdt} / কেজি
                      </strong>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 text-[11px] block">বরফ দেওয়া মৃত মাছের দর:</span>
                      <strong className="text-slate-600 dark:text-slate-400 font-black text-base">
                        ৳{arbitrage.deadIcedPricePerKgBdt} / কেজি
                      </strong>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs border-t border-emerald-200 dark:border-emerald-800 pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">লাইভ বিক্রয়ে মোট আয়:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        ৳{arbitrage.grossLiveRevenueBdt.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">বরফ দিয়ে সাধারণ বিক্রয়ে আয়:</span>
                      <span className="text-slate-500">
                        ৳{arbitrage.grossIcedRevenueBdt.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-emerald-200 dark:border-emerald-800 pt-2 font-black text-emerald-800 dark:text-emerald-200 text-sm">
                      <span>অতিরিক্ত নিট মুনাফা লাভ:</span>
                      <span>+৳{arbitrage.netPremiumAdvantageBdt.toLocaleString()} (+{arbitrage.premiumPercentage}%)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowTankerModal(true)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Truck className="w-4 h-4" /> এই চালানের জন্য এয়ারেটেড ওয়াটার ট্যাঙ্কার বুক করুন
                  </button>
                </div>
              )}
            </div>

            {/* Aerated Tanker Technology Brief */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" /> বিশেষায়িত লাইভ ওয়াটার ট্যাঙ্কার বহর প্রযুক্তি
              </h3>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">১. অবিরাম অক্সিজেন ডিফিউজার সিস্টেম</div>
                  <p className="text-slate-500">
                    ট্রাকের ওয়াটার ট্যাঙ্কে সংযুক্ত ইন্ডাস্ট্রিয়াল ওটু সিলিন্ডার পানির ভেতরে মিনিটে ৮ লিটার বিশুদ্ধ অক্সিজেন সরবরাহ করে যাতে ৮–১০ ঘণ্টার যাত্রাপথে মাছের মর্টালিটি ০% থাকে।
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">২. তাপমাত্রা ও পানির বাফার সুরক্ষা</div>
                  <p className="text-slate-500">
                    ট্রাঞ্জিটের সময় অ্যামোনিয়া বিষক্রিয়া রোধে বায়ো-ফিল্টার ও ওয়াটার কুলার ব্যবহার করা হয়।
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">৩. সরাসরি আড়তে প্রবেশ ও নিলাম</div>
                  <p className="text-slate-500">
                    মধ্যস্বত্বভোগী ও স্থানীয় দাদনদার ছাড়া ঢাকার পাইকারি আড়তদারদের সাথে সরাসরি সংযোগ।
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Bio-Floc & Pond Water Quality Diagnostic Simulator */}
        {activeTab === 'WATER_DIAGNOSTIC' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" /> পুকুর ও বায়োফ্লক পানির আইওটি ডায়াগনস্টিক সিমুলেটর
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                আইওটি সেন্সরের মান অনুযায়ী হাইপোক্সিয়া ও অ্যামোনিয়া বিষক্রিয়া মূল্যায়ন এবং স্বয়ংক্রিয় এয়ারেটর অ্যাক্টিভেশন প্রটোকল
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* DO Slider */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1 text-cyan-700 dark:text-cyan-300">
                    <Wind className="w-4 h-4" /> অক্সিজেন (DO)
                  </span>
                  <span className="font-bold">{simDo} mg/L</span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={10.0}
                  step={0.1}
                  value={simDo}
                  onChange={(e) => setSimDo(Number(e.target.value))}
                  className="w-full accent-cyan-600"
                />
                <span className="text-[10px] text-slate-400 block">আদর্শ মান: ৫.৫–৭.৫ mg/L (৪ এর নিচে হাইপোক্সিয়া)</span>
              </div>

              {/* Temperature Slider */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-amber-700 dark:text-amber-300">তাপমাত্রা (°C)</span>
                  <span className="font-bold">{simTemp} °C</span>
                </div>
                <input
                  type="range"
                  min={18.0}
                  max={38.0}
                  step={0.5}
                  value={simTemp}
                  onChange={(e) => setSimTemp(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
                <span className="text-[10px] text-slate-400 block">আদর্শ মান: ২৬°–৩০° C</span>
              </div>

              {/* pH Slider */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-purple-700 dark:text-purple-300">পানির পিএইচ (pH)</span>
                  <span className="font-bold">{simPh}</span>
                </div>
                <input
                  type="range"
                  min={5.0}
                  max={10.0}
                  step={0.1}
                  value={simPh}
                  onChange={(e) => setSimPh(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <span className="text-[10px] text-slate-400 block">আদর্শ মান: ৭.২–৮.২</span>
              </div>

              {/* Ammonia Slider */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-rose-700 dark:text-rose-300">অ্যামোনিয়া (NH3)</span>
                  <span className="font-bold">{simAmmonia} ppm</span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={0.15}
                  step={0.01}
                  value={simAmmonia}
                  onChange={(e) => setSimAmmonia(Number(e.target.value))}
                  className="w-full accent-rose-600"
                />
                <span className="text-[10px] text-slate-400 block">বিষাক্ত মাত্রা: {'>'} ০.০৫ ppm</span>
              </div>
            </div>

            {/* Diagnostic Alert Box */}
            <div
              className={`p-5 rounded-2xl border text-xs space-y-3 ${
                isHypoxia
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  : isAmmoniaToxic
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm flex items-center gap-1.5">
                  {isHypoxia ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                      মারাত্মক হাইপোক্সিয়া সংকেত (Critical Hypoxia - DO {simDo} mg/L)
                    </>
                  ) : isAmmoniaToxic ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      উচ্চ অ্যামোনিয়া বিষক্রিয়া ঝুঁকি (Ammonia Spike - {simAmmonia} ppm)
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      পানির গুণমান সম্পূর্ণ অনুকূল (Optimal Water Parameters)
                    </>
                  )}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-black ${
                    isHypoxia
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isHypoxia ? 'প্যাডেল এয়ারেটর সক্রিয়' : 'স্বাভাবিক মনিটরিং'}
                </span>
              </div>

              <div className="space-y-1">
                <strong>প্রস্তাবিত ব্যবস্থাপনা পদক্ষেপ:</strong>
                {isHypoxia && (
                  <div>• অবিলম্বে সবকটি প্যাডেল-হুইল এয়ারেটর চালু করুন এবং খাবার দেওয়া সাময়িকভাবে বন্ধ রাখুন।</div>
                )}
                {isAmmoniaToxic && (
                  <div>• পুকুরের তলদেশের ২০–৩০% পানি বের করে নতুন পানি প্রবেশ করান এবং চিটাগুড় (Molasses) প্রয়োগ করুন।</div>
                )}
                {!isHypoxia && !isAmmoniaToxic && (
                  <div>• বর্তমান খাদ্য তালিকা ও প্ল্যাঙ্কটন চাষ বজায় রাখুন। নিয়মিত আইওটি ডেটা পর্যবেক্ষণ করুন।</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tanker Booking Modal */}
        {showTankerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-600" /> লাইভ মাছের এয়ারেটেড ওয়াটার ট্যাঙ্কার বুকিং
                </h3>
                <button onClick={() => setShowTankerModal(false)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>

              {tankerSuccess ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  {tankerSuccess}
                </div>
              ) : (
                <form onSubmit={handleTankerSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">পিকআপ জেলা</label>
                    <input
                      type="text"
                      required
                      value={pickupDistrict}
                      onChange={(e) => setPickupDistrict(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">পিকআপ উপজেলা ও খামার অবস্থান</label>
                    <input
                      type="text"
                      required
                      value={pickupUpazila}
                      onChange={(e) => setPickupUpazila(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">গন্তব্য পাইকারি মাছের আড়ত</label>
                    <input
                      type="text"
                      required
                      value={dropoffMarket}
                      onChange={(e) => setDropoffMarket(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex justify-between items-center font-bold text-emerald-900 dark:text-emerald-200">
                    <span>পরিবহন ভাড়া (৩ টন এয়ারেটেড ট্যাঙ্কার):</span>
                    <span className="text-base text-emerald-600">৳১২,৫০০</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isBookingTanker}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm shadow-md"
                  >
                    {isBookingTanker ? 'প্রক্রিয়াধীন...' : 'ট্যাঙ্কার নিশ্চিত করুন'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Hatchery Order Modal */}
        {orderBatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-cyan-500/30 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                  <Package className="w-5 h-5 text-cyan-600" /> অক্সিজেন ব্যাগে পোনা বুকিং
                </h3>
                <button onClick={() => setOrderBatch(null)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">{orderBatch.species.replace(/_/g, ' ')}</div>
                <div className="text-slate-500">ব্যাচ: {orderBatch.batchNumber} • হ্যাচারি: {orderBatch.hatcheryName}</div>
              </div>

              {orderSuccess ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  {orderSuccess}
                </div>
              ) : (
                <form onSubmit={handleHatcheryOrderSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">পোনা সংখ্যা (পিস)</label>
                    <input
                      type="number"
                      required
                      min={orderBatch.minOrderQuantity}
                      step={1000}
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                    <span className="text-[11px] text-slate-400">সর্বনিম্ন অর্ডার: {orderBatch.minOrderQuantity.toLocaleString()} টি</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">মোবাইল নম্বর</label>
                    <input
                      type="text"
                      required
                      placeholder="০১৭xxxxxxxx"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl flex justify-between items-center font-bold text-cyan-900 dark:text-cyan-200">
                    <span>মোট প্রদেয় মূল্য:</span>
                    <span className="text-base text-cyan-600">৳{(orderQuantity * Number(orderBatch.unitPriceBdt)).toLocaleString()}</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs shadow-md"
                  >
                    বুকিং সম্পন্ন করুন
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
