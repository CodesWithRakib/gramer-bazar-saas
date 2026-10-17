'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Droplets,
  Sparkles,
  ShieldCheck,
  Scale,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Award,
  ShoppingBag,
  Filter,
  Calendar,
  MapPin,
  Activity,
  Layers,
  Flame,
  X,
  Gauge,
  Info,
} from 'lucide-react';
import {
  useGetArtisanalOilLotsQuery,
  useGetGhaniBatchesQuery,
  useGetOilLabTestsQuery,
  useCalculateOilExtractionMutation,
  useEvaluateOilPurityMutation,
  usePurchaseOilLotMutation,
  OilSeedType,
  OilRegion,
  OilExtractionMethod,
  ArgemoneTestResult,
  AdulterationScreeningStatus,
  ArtisanalOilLot,
  OilExtractionCalculationResult,
  OilPurityEvaluationResult,
} from '../edibleOilApi';

export const EdibleOilMarketplaceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'catalog' | 'calculator' | 'purity_tester' | 'ghani_telemetry'
  >('catalog');

  const [selectedSeedType, setSelectedSeedType] = useState<OilSeedType | 'ALL'>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<OilRegion | 'ALL'>('ALL');

  // Queries
  const { data: lots = [], isLoading: lotsLoading } = useGetArtisanalOilLotsQuery(
    selectedSeedType !== 'ALL' || selectedRegion !== 'ALL'
      ? {
          seedType: selectedSeedType !== 'ALL' ? selectedSeedType : undefined,
          region: selectedRegion !== 'ALL' ? selectedRegion : undefined,
        }
      : undefined,
  );

  const { data: batches = [], isLoading: batchesLoading } = useGetGhaniBatchesQuery();
  const { data: labTests = [], isLoading: testsLoading } = useGetOilLabTestsQuery();

  // Purchase Modal State
  const [selectedLotForBuy, setSelectedLotForBuy] = useState<ArtisanalOilLot | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [orderQuantityLiters, setOrderQuantityLiters] = useState<number>(5);
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState('');
  const [purchaseErrorMessage, setPurchaseErrorMessage] = useState('');

  const [purchaseLotMutation, { isLoading: isPurchasing }] = usePurchaseOilLotMutation();

  // Extraction Calculator State
  const [calcSeedType, setCalcSeedType] = useState<OilSeedType>('MUSTARD_MAGHI_DESHI');
  const [calcSeedWeight, setCalcSeedWeight] = useState<number>(500);
  const [calcExtractionMethod, setCalcExtractionMethod] =
    useState<OilExtractionMethod>('WOOD_GHANI_COLD_PRESS');
  const [calcMoisture, setCalcMoisture] = useState<number>(8.5);
  const [calcResult, setCalcResult] = useState<OilExtractionCalculationResult | null>(null);

  const [calculateExtraction, { isLoading: isCalculatingExtraction }] =
    useCalculateOilExtractionMutation();

  // Purity Tester State
  const [simSeedType, setSimSeedType] = useState<OilSeedType>('MUSTARD_MAGHI_DESHI');
  const [simFfa, setSimFfa] = useState<number>(0.85);
  const [simPeroxide, setSimPeroxide] = useState<number>(3.2);
  const [simAllyl, setSimAllyl] = useState<number>(0.38);
  const [simArgemone, setSimArgemone] =
    useState<ArgemoneTestResult>('NEGATIVE_PASS_SAFE');
  const [simAdulteration, setSimAdulteration] =
    useState<AdulterationScreeningStatus>('PURE_UNADULTERATED');
  const [simMaxTemp, setSimMaxTemp] = useState<number>(36.5);
  const [simResult, setSimResult] = useState<OilPurityEvaluationResult | null>(null);

  const [evaluatePurity, { isLoading: isEvaluatingPurity }] =
    useEvaluateOilPurityMutation();

  const handleRunCalculator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await calculateExtraction({
        seedType: calcSeedType,
        seedWeightKg: Number(calcSeedWeight),
        extractionMethod: calcExtractionMethod,
        seedMoisturePct: Number(calcMoisture),
      }).unwrap();
      setCalcResult(res);
    } catch (err: any) {
      console.error('Calculation error:', err);
    }
  };

  const handleRunPurityAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await evaluatePurity({
        seedType: simSeedType,
        freeFattyAcidPct: Number(simFfa),
        peroxideValueMeq: Number(simPeroxide),
        allylIsothiocyanatePct: Number(simAllyl),
        argemoneOilStatus: simArgemone,
        adulterationStatus: simAdulteration,
        maxExtractionTempCelsius: Number(simMaxTemp),
      }).unwrap();
      setSimResult(res);
    } catch (err: any) {
      console.error('Purity evaluation error:', err);
    }
  };

  const handleOpenBuyModal = (lot: ArtisanalOilLot) => {
    setSelectedLotForBuy(lot);
    setOrderQuantityLiters(lot.minimumOrderLiters || 5);
    setPurchaseSuccessMessage('');
    setPurchaseErrorMessage('');
  };

  const handleExecutePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLotForBuy) return;

    if (!buyerName.trim() || !buyerPhone.trim()) {
      setPurchaseErrorMessage('Please enter both name and contact mobile number.');
      return;
    }

    if (orderQuantityLiters > selectedLotForBuy.availableVolumeLiters) {
      setPurchaseErrorMessage(
        `Requested liters exceed available quantity (${selectedLotForBuy.availableVolumeLiters} L).`,
      );
      return;
    }

    try {
      await purchaseLotMutation({
        id: selectedLotForBuy.id,
        body: {
          buyerName,
          buyerPhone,
          orderQuantityLiters: Number(orderQuantityLiters),
        },
      }).unwrap();

      setPurchaseSuccessMessage(
        `Order successful! Reserved ${orderQuantityLiters} L from Lot #${selectedLotForBuy.lotCode}. Miller dispatch and BSTI verified delivery initiated.`,
      );
      setTimeout(() => {
        setSelectedLotForBuy(null);
        setPurchaseSuccessMessage('');
      }, 3500);
    } catch (err: any) {
      setPurchaseErrorMessage(
        err?.data?.message || 'Failed to place order. Please try again.',
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Top Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-emerald-950 border border-amber-500/30 p-6 sm:p-10 mb-8 shadow-2xl shadow-amber-950/40">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Droplets className="w-7 h-7" />
              </span>
              <span className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300 bg-amber-950/80 rounded-full border border-amber-600/40">
                Phase 29: Wood-Ghani Cold-Press & Edible Oil Traceability
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-100 tracking-tight">
              Artisanal Wood-Ghani Cold-Pressed Oil Marketplace
            </h1>
            <p className="text-base sm:text-lg text-amber-200/80 font-medium mt-1">
              খাঁটি কাঠের ঘানি ভাঙা সরিষা ও তিল তেলের বাজার ও রাসায়নিক বিশুদ্ধতা সার্টিফিকেশন প্ল্যাটফর্ম
            </p>
            <p className="mt-3 text-sm text-slate-300 max-w-2xl leading-relaxed">
              Direct-from-ghani traceability for indigenous Maghi & BARI mustard, black sesame, and artisanal edible oils. Crushed in heritage Tamarind and Neem wood mortars strictly below 40°C to preserve allyl isothiocyanate pungency (ঝাঁঝ), verified with BSTI Acid Value (FFA ≤ 1.5%) and zero-tolerance Argemone oil screening.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Link
              href="/seller/edible-oil"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold transition shadow-lg shadow-amber-900/40 text-sm"
            >
              <Activity className="w-4 h-4" />
              Miller Ghani Hub
            </Link>
            <Link
              href="/admin/edible-oil"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-semibold transition text-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              BSTI Regulatory Desk
            </Link>
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-amber-500/20 text-xs sm:text-sm">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-amber-500/10">
            <Thermometer className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-amber-200 font-bold">&lt; 40°C Cold Press</div>
              <div className="text-slate-400 text-xs">Pungency & Tocopherols Preserved</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-amber-500/10">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-emerald-200 font-bold">Argemone Negative</div>
              <div className="text-slate-400 text-xs">Zero Dropsy Alkaloid Guarantee</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-amber-500/10">
            <Scale className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-amber-200 font-bold">FFA ≤ 1.50% BSTI</div>
              <div className="text-slate-400 text-xs">Ultra-Low Free Fatty Acid</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-amber-500/10">
            <Award className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <div className="text-purple-200 font-bold">Grade-AAA Extra Virgin</div>
              <div className="text-slate-400 text-xs">Dark Amber Glass Sealed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition ${
            activeTab === 'catalog'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Certified Forward Lots ({lots.length})
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition ${
            activeTab === 'calculator'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Scale className="w-4 h-4" />
          Ghani Extraction & Oilcake Calculator
        </button>

        <button
          onClick={() => setActiveTab('purity_tester')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition ${
            activeTab === 'purity_tester'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          BSTI Acid Value & Purity Simulator
        </button>

        <button
          onClick={() => setActiveTab('ghani_telemetry')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition ${
            activeTab === 'ghani_telemetry'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Gauge className="w-4 h-4" />
          Live Ghani Batches ({batches.length})
        </button>
      </div>

      {/* TAB 1: PUBLIC CATALOG */}
      {activeTab === 'catalog' && (
        <div>
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Filter by:
              </span>

              {/* Seed Filter */}
              <select
                value={selectedSeedType}
                onChange={(e) => setSelectedSeedType(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Seeds & Til</option>
                <option value="MUSTARD_MAGHI_DESHI">Deshi Maghi Mustard (মাঘী সরিষা)</option>
                <option value="MUSTARD_BARI_14">BARI Sarisha-14 (বারি সরিষা-১৪)</option>
                <option value="SESAME_BLACK">Black Sesame (কালো তিল)</option>
                <option value="SESAME_WHITE">White Sesame (সাদা তিল)</option>
                <option value="SUNFLOWER_SEED">Sunflower Seed (সূর্যমুখী বীজ)</option>
              </select>

              {/* Region Filter */}
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Hubs & Districts</option>
                <option value="TANGAIL_DELDUAR">Tangail Delduar (দেলদুয়ার কাঠের ঘানি)</option>
                <option value="MANIKGANJ_SINGAIR">Manikganj Singair (সিঙ্গাইর নিম ঘানি)</option>
                <option value="JASHORE_JHIKARGACHA">Jashore Jhikargacha (ঝিকরগাছা কালো তিল)</option>
                <option value="SIRAJGANJ_ULLAPARA">Sirajganj Ullapara (উল্লাপাড়া সরিষা)</option>
              </select>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Showing <span className="text-amber-400 font-bold">{lots.length}</span> certified forward lots
            </div>
          </div>

          {/* Lots Grid */}
          {lotsLoading ? (
            <div className="p-12 text-center text-slate-400 bg-slate-800/40 rounded-2xl border border-slate-800 animate-pulse">
              Loading verified cold-pressed artisanal lots...
            </div>
          ) : lots.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-800/30 rounded-2xl border border-slate-800">
              No artisanal edible oil lots found matching the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lots.map((lot) => (
                <div
                  key={lot.id}
                  className="group relative rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/60 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-amber-950/30"
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {lot.seedType.replace(/_/g, ' ')}
                      </span>
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {lot.purityGrade.replace(/GRADE_AAA_EXTRA_VIRGIN_COLD_PRESSED/, 'AAA Extra Virgin')}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-300 transition">
                      {lot.lotTitle}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 mb-4">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lot.originRegion.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span className="text-slate-300 font-medium">{lot.millProducerName}</span>
                    </div>

                    {/* Technical Specs */}
                    <div className="space-y-2 py-3 border-y border-slate-700/60 text-xs mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Packaging Type:</span>
                        <span className="text-slate-200 font-semibold">{lot.packagingType.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pungency Index (ঝাঁঝ):</span>
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Flame
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < lot.pungencyRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-xs">({lot.pungencyRating}/5)</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Available Volume:</span>
                        <span className="text-emerald-400 font-bold">{lot.availableVolumeLiters} Liters</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Min Order:</span>
                        <span className="text-slate-300">{lot.minimumOrderLiters} Liters</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lot Code:</span>
                        <span className="font-mono text-slate-300">{lot.lotCode}</span>
                      </div>
                    </div>

                    {/* Certifications badges */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {lot.isBstiCertified && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          BSTI BDS-211 Certified
                        </span>
                      )}
                      {lot.isColdPressedCertified && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Tamarind/Neem Wood Ghani &lt;40°C
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-2">
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <span className="text-xs text-slate-400">Price per Liter:</span>
                        <div className="text-2xl font-black text-amber-400">
                          ৳{lot.pricePerLiterBdt}
                          <span className="text-xs text-slate-400 font-normal"> / L</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400">Total Lot Value:</span>
                        <div className="text-sm font-semibold text-slate-200">
                          ৳{lot.totalValueBdt.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenBuyModal(lot)}
                      disabled={lot.availableVolumeLiters <= 0}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-md ${
                        lot.availableVolumeLiters > 0
                          ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {lot.availableVolumeLiters > 0 ? 'Reserve & Purchase Lot' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXTRACTION & MASS BALANCE CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-4 text-amber-400">
              <Scale className="w-6 h-6" />
              <h2 className="text-xl font-bold text-slate-100">Wood-Ghani Mass Balance Calculator</h2>
            </div>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Calculates expected cold-pressed oil volume, byproduct oilcake (*khol* / খৈল) yield for organic cattle feed and natural fertilizer, and thermal pungency preservation index.
            </p>

            <form onSubmit={handleRunCalculator} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Seed / Til Cultivar (তেলবীজের জাত)
                </label>
                <select
                  value={calcSeedType}
                  onChange={(e) => setCalcSeedType(e.target.value as OilSeedType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="MUSTARD_MAGHI_DESHI">Deshi Maghi Mustard (ছোট দেশি মাঘী সরিষা - 35% Yield)</option>
                  <option value="MUSTARD_BARI_14">BARI Sarisha-14 (বারি সরিষা-১৪ - 36.5% Yield)</option>
                  <option value="MUSTARD_TORI_7">Tori-7 Local Mustard (টোরি-৭ লাল সরিষা - 34% Yield)</option>
                  <option value="SESAME_BLACK">Indigenous Black Til (দেশি কালো তিল - 44% Yield)</option>
                  <option value="SESAME_WHITE">White Til (সাদা তিল - 46% Yield)</option>
                  <option value="SUNFLOWER_SEED">Sunflower Seed (সূর্যমুখী বীজ - 40% Yield)</option>
                  <option value="PEANUT_GROUNDNUT">Groundnut Peanut (চিনাবাদাম - 42% Yield)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Input Seed Batch Weight (kg)
                </label>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={calcSeedWeight}
                  onChange={(e) => setCalcSeedWeight(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Extraction Mechanism
                </label>
                <select
                  value={calcExtractionMethod}
                  onChange={(e) => setCalcExtractionMethod(e.target.value as OilExtractionMethod)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="WOOD_GHANI_COLD_PRESS">Traditional Wooden Ghani (তেঁতুল/নিম কাঠের ঘানি &lt;40°C)</option>
                  <option value="HYDRAULIC_COLD_PRESS">Hydraulic Cold Press (&lt;45°C)</option>
                  <option value="STEEL_EXPELLER_MECHANICAL">Commercial Steel Expeller (&gt;85°C High Friction)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Seed Moisture Content (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="4"
                  max="15"
                  value={calcMoisture}
                  onChange={(e) => setCalcMoisture(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Recommended moisture for wooden ghani: 7.5% - 9.0%.
                </span>
              </div>

              <button
                type="submit"
                disabled={isCalculatingExtraction}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 mt-4"
              >
                <Scale className="w-4 h-4" />
                {isCalculatingExtraction ? 'Calculating...' : 'Compute Mass Balance & Value'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7">
            {calcResult ? (
              <div className="bg-slate-800/80 border border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      Calculated Yield Analysis
                    </span>
                    <h3 className="text-xl font-bold text-amber-300">
                      {calcResult.seedType.replace(/_/g, ' ')}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      calcResult.isColdPressSafe
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {calcResult.isColdPressSafe ? 'True Cold Press Certified' : 'Thermal Degradation Warning'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
                    <span className="text-xs text-slate-400">Oil Yield Rate</span>
                    <div className="text-2xl font-black text-amber-400">{calcResult.yieldPct}%</div>
                    <span className="text-[10px] text-slate-500">By seed weight</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
                    <span className="text-xs text-slate-400">Expected Pure Oil</span>
                    <div className="text-2xl font-black text-emerald-400">{calcResult.expectedOilLiters} L</div>
                    <span className="text-[10px] text-slate-500">({calcResult.expectedOilKg} kg)</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
                    <span className="text-xs text-slate-400">Oilcake (খৈল)</span>
                    <div className="text-2xl font-black text-amber-300">{calcResult.oilcakeWeightKg} kg</div>
                    <span className="text-[10px] text-slate-500">Byproduct recovery</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
                    <span className="text-xs text-slate-400">Oilcake Value</span>
                    <div className="text-2xl font-black text-purple-400">৳{calcResult.oilcakeMarketValueBdt}</div>
                    <span className="text-[10px] text-slate-500">@ ৳50/kg fertilizer</span>
                  </div>
                </div>

                {/* Preservation telemetry */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-400" />
                      Allyl Isothiocyanate Pungency Retention (ঝাঁঝ সূচক)
                    </span>
                    <span className="font-bold text-amber-400 text-sm">
                      {calcResult.pungencyPreservationPct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full ${
                        calcResult.pungencyPreservationPct > 80
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${calcResult.pungencyPreservationPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Max Operating Temperature:</span>
                    <span className="text-slate-200 font-bold">{calcResult.maxRecommendedTempCelsius}°C</span>
                  </div>
                </div>

                {/* Advisory notice */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>{calcResult.processingAdvice}</div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-800/40 border border-slate-800 rounded-2xl text-slate-400">
                <Scale className="w-12 h-12 text-slate-600 mb-3" />
                <h4 className="text-base font-semibold text-slate-300">Awaiting Input Parameters</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Select your seed variety, pressing weight, and ghani mechanism to project mass balance recovery and by-product value.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BSTI PURITY & ACID VALUE SIMULATOR */}
      {activeTab === 'purity_tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-4 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
              <h2 className="text-xl font-bold text-slate-100">BSTI BDS-211 Purity Simulator</h2>
            </div>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Screen laboratory indicators against BSTI mandatory thresholds: Free Fatty Acid (FFA ≤ 1.50%), Peroxide Value (POV ≤ 10 meq/kg), and zero-tolerance Argemone oil adulteration.
            </p>

            <form onSubmit={handleRunPurityAudit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sample Seed Cultivar
                </label>
                <select
                  value={simSeedType}
                  onChange={(e) => setSimSeedType(e.target.value as OilSeedType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="MUSTARD_MAGHI_DESHI">Deshi Maghi Mustard Oil</option>
                  <option value="MUSTARD_BARI_14">BARI Sarisha-14 Oil</option>
                  <option value="SESAME_BLACK">Black Sesame Oil</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Free Fatty Acid (FFA % as Oleic)</span>
                  <span className="text-amber-400">Limit: ≤ 1.50%</span>
                </div>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="10"
                  value={simFfa}
                  onChange={(e) => setSimFfa(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Peroxide Value (POV meq O2/kg)</span>
                  <span className="text-amber-400">Limit: ≤ 10.0</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="40"
                  value={simPeroxide}
                  onChange={(e) => setSimPeroxide(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Allyl Isothiocyanate Pungency (%)</span>
                  <span className="text-emerald-400">Standard: ≥ 0.25%</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1.5"
                  value={simAllyl}
                  onChange={(e) => setSimAllyl(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Toxic Argemone Oil Screening (Ferric Chloride / TLC)
                </label>
                <select
                  value={simArgemone}
                  onChange={(e) => setSimArgemone(e.target.value as ArgemoneTestResult)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="NEGATIVE_PASS_SAFE">Negative (100% Free of Sanguinarine Alkaloids - PASS)</option>
                  <option value="POSITIVE_CONTAMINATED_SEIZED">Positive (Contaminated with Argemone - SEIZURE MANDATE)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Diluent Adulteration Status
                </label>
                <select
                  value={simAdulteration}
                  onChange={(e) => setSimAdulteration(e.target.value as AdulterationScreeningStatus)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="PURE_UNADULTERATED">Pure & Unadulterated</option>
                  <option value="ADULTERATED_PALM_DILUTION">Refined Bleached Palm Oil Dilution</option>
                  <option value="ADULTERATED_MINERAL_OIL">Industrial Liquid Paraffin / Mineral Oil</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Peak Extraction Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="20"
                  max="120"
                  value={simMaxTemp}
                  onChange={(e) => setSimMaxTemp(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Cold press threshold: strictly ≤ 40.0°C.
                </span>
              </div>

              <button
                type="submit"
                disabled={isEvaluatingPurity}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 mt-4"
              >
                <ShieldCheck className="w-4 h-4" />
                {isEvaluatingPurity ? 'Evaluating Audit...' : 'Execute Laboratory Evaluation'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7">
            {simResult ? (
              <div
                className={`rounded-2xl p-6 sm:p-8 space-y-6 border ${
                  simResult.bstiComplianceApproved
                    ? 'bg-slate-800/80 border-emerald-500/50'
                    : 'bg-slate-800/80 border-rose-500/50'
                }`}
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      Diagnostic Laboratory Verdict
                    </span>
                    <h3
                      className={`text-xl font-bold ${
                        simResult.bstiComplianceApproved ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {simResult.verdict}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Purity Score</span>
                    <div
                      className={`text-3xl font-black ${
                        simResult.qualityScore >= 80
                          ? 'text-emerald-400'
                          : simResult.qualityScore >= 50
                          ? 'text-amber-400'
                          : 'text-rose-500'
                      }`}
                    >
                      {simResult.qualityScore}/100
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs">
                    <span className="text-slate-400">Purity Grade:</span>
                    <div className="font-bold text-slate-200 mt-1">
                      {simResult.purityGrade.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs">
                    <span className="text-slate-400">BSTI Compliance:</span>
                    <div
                      className={`font-bold mt-1 ${
                        simResult.bstiComplianceApproved ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {simResult.bstiComplianceApproved ? 'PASSED & APPROVED' : 'NON-COMPLIANT'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs">
                    <span className="text-slate-400">Argemone Alkaloid:</span>
                    <div
                      className={`font-bold mt-1 ${
                        simResult.isArgemoneContaminated ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {simResult.isArgemoneContaminated ? 'CONTAMINATED' : 'SAFE NEGATIVE'}
                    </div>
                  </div>
                </div>

                {/* Specific flags */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60">
                    <span className="text-slate-300">Acid Value Limit (FFA ≤ 1.50%):</span>
                    <span
                      className={`font-bold ${
                        simResult.isAcidValueExceeded ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {simResult.isAcidValueExceeded ? 'Exceeded Limit' : 'Within Standard'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60">
                    <span className="text-slate-300">Peroxide Value Limit (POV ≤ 10 meq/kg):</span>
                    <span
                      className={`font-bold ${
                        simResult.isPeroxideExceeded ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {simResult.isPeroxideExceeded ? 'Elevated Rancidity' : 'Fresh & Pure'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60">
                    <span className="text-slate-300">Cold Press Extraction Thermal Limit (&le; 40°C):</span>
                    <span
                      className={`font-bold ${
                        simResult.isOverheated ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {simResult.isOverheated ? 'Thermally Degraded' : 'Preserved (<40°C)'}
                    </span>
                  </div>
                </div>

                {/* Safety notes callout */}
                <div
                  className={`p-4 rounded-xl text-xs leading-relaxed flex items-start gap-3 border ${
                    simResult.isArgemoneContaminated
                      ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                      : simResult.bstiComplianceApproved
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      simResult.isArgemoneContaminated ? 'text-rose-400' : 'text-amber-400'
                    }`}
                  />
                  <div>
                    <strong className="block font-bold mb-1">Analytical Notes:</strong>
                    {simResult.safetyNotes}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-800/40 border border-slate-800 rounded-2xl text-slate-400">
                <ShieldCheck className="w-12 h-12 text-slate-600 mb-3" />
                <h4 className="text-base font-semibold text-slate-300">Awaiting Lab Test Metrics</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Enter Free Fatty Acid percentage, Peroxide value, and Argemone screening status to evaluate BSTI compliance and certificate eligibility.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: LIVE WOOD-GHANI BATCHES */}
      {activeTab === 'ghani_telemetry' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Live Wood-Ghani Crushing & Settling Batches</h2>
              <p className="text-xs text-slate-400">
                Real-time temperature telemetry (&lt;40°C) across regional artisanal mills.
              </p>
            </div>
            <Link
              href="/seller/edible-oil"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              Manage Batches &rarr;
            </Link>
          </div>

          {batchesLoading ? (
            <div className="p-8 text-center text-slate-400 bg-slate-800/40 rounded-2xl animate-pulse">
              Loading ghani batch telemetry...
            </div>
          ) : batches.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-800/30 rounded-2xl">
              No active ghani pressing batches recorded.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="rounded-2xl bg-slate-800/80 border border-slate-700/80 p-5 space-y-4 hover:border-amber-500/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-amber-400 font-bold">{batch.batchNumber}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {batch.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{batch.millName}</h4>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {batch.region.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/70 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mortar Wood:</span>
                      <span className="text-slate-200 font-semibold">{batch.ghaniWoodType.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Seed Variety:</span>
                      <span className="text-slate-200">{batch.seedVariety}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Seed Input:</span>
                      <span className="text-slate-200 font-bold">{batch.inputSeedWeightKg} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Peak Crushing Temp:</span>
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          batch.maxExtractionTempCelsius <= 40 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        <Thermometer className="w-3.5 h-3.5" />
                        {batch.maxExtractionTempCelsius}°C
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Operating Speed:</span>
                      <span className="text-amber-400 font-bold">{batch.operatingRpm} RPM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Extracted Pure Oil:</span>
                      <span className="text-emerald-400 font-bold">{batch.extractedOilLiters} Liters</span>
                    </div>
                  </div>

                  {batch.notes && (
                    <p className="text-xs text-slate-400 italic bg-slate-900/50 p-2.5 rounded-lg">
                      "{batch.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PURCHASE MODAL */}
      {selectedLotForBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-amber-500/40 p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setSelectedLotForBuy(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <ShoppingBag className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Reserve & Purchase Certified Lot</h3>
                <span className="font-mono text-xs text-amber-400">#{selectedLotForBuy.lotCode}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs space-y-1.5 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-400">Lot Title:</span>
                <span className="text-slate-200 font-semibold">{selectedLotForBuy.lotTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Miller / Producer:</span>
                <span className="text-slate-200">{selectedLotForBuy.millProducerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Available Liters:</span>
                <span className="text-emerald-400 font-bold">{selectedLotForBuy.availableVolumeLiters} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Price per Liter:</span>
                <span className="text-amber-400 font-bold">৳{selectedLotForBuy.pricePerLiterBdt}</span>
              </div>
            </div>

            {purchaseSuccessMessage ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{purchaseSuccessMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleExecutePurchase} className="space-y-4">
                {purchaseErrorMessage && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{purchaseErrorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Buyer Name / Commercial Entity (ক্রেতা বা প্রতিষ্ঠানের নাম)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Traditional Mustard House / Tanvir Hasan"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Phone Number (মোবাইল নম্বর)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+88017XXXXXXXX"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Order Quantity (Liters)
                  </label>
                  <input
                    type="number"
                    min={selectedLotForBuy.minimumOrderLiters}
                    max={selectedLotForBuy.availableVolumeLiters}
                    value={orderQuantityLiters}
                    onChange={(e) => setOrderQuantityLiters(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Minimum order: {selectedLotForBuy.minimumOrderLiters} Liters.
                  </span>
                </div>

                {/* Total Cost Calculation */}
                <div className="p-3.5 rounded-xl bg-slate-800/90 border border-amber-500/30 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-semibold">Total Order Payable:</span>
                  <span className="text-xl font-black text-amber-400">
                    ৳{(orderQuantityLiters * selectedLotForBuy.pricePerLiterBdt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLotForBuy(null)}
                    className="w-1/2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPurchasing}
                    className="w-1/2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {isPurchasing ? 'Processing...' : 'Confirm Order'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
