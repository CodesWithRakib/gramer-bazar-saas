'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
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
  X,
  Gauge,
  Info,
} from 'lucide-react';
import {
  useGetArtisanalLotsQuery,
  useGetTappingBatchesQuery,
  useGetGurLabTestsQuery,
  useCalculateGurExtractionMutation,
  useEvaluateGurPurityMutation,
  usePurchaseGurLotMutation,
  GurType,
  GurRegion,
  SapCollectionShift,
  HydrosulfiteTestResult,
  SugarSyrupAdulterationStatus,
  ArtisanalGurLot,
  GurExtractionCalculationResult,
  GurPurityEvaluationResult,
} from '../artisanalGurApi';

export const ArtisanalGurMarketplaceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'catalog' | 'calculator' | 'purity_tester' | 'boiling_telemetry'
  >('catalog');

  const [selectedGurType, setSelectedGurType] = useState<GurType | 'ALL'>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<GurRegion | 'ALL'>('ALL');

  // Queries
  const { data: lots = [], isLoading: lotsLoading } = useGetArtisanalLotsQuery(
    selectedGurType !== 'ALL' || selectedRegion !== 'ALL'
      ? {
          gurType: selectedGurType !== 'ALL' ? selectedGurType : undefined,
          region: selectedRegion !== 'ALL' ? selectedRegion : undefined,
        }
      : undefined,
  );

  const { data: batches = [], isLoading: batchesLoading } = useGetTappingBatchesQuery();
  const { data: labTests = [], isLoading: testsLoading } = useGetGurLabTestsQuery();

  // Purchase Modal State
  const [selectedLotForBuy, setSelectedLotForBuy] = useState<ArtisanalGurLot | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderQuantityKg, setOrderQuantityKg] = useState<number>(5);
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState('');
  const [purchaseErrorMessage, setPurchaseErrorMessage] = useState('');

  const [purchaseLotMutation, { isLoading: isPurchasing }] = usePurchaseGurLotMutation();

  // Extraction Calculator State
  const [calcGurType, setCalcGurType] = useState<GurType>('DATE_PALM_NOLEN_JHOLA');
  const [calcSapVolume, setCalcSapVolume] = useState<number>(500);
  const [calcBrix, setCalcBrix] = useState<number>(13.5);
  const [calcShift, setCalcShift] = useState<SapCollectionShift>('DAWN_JIRAN_PREMIUM');
  const [calcResult, setCalcResult] = useState<GurExtractionCalculationResult | null>(null);

  const [calculateExtraction, { isLoading: isCalculatingExtraction }] =
    useCalculateGurExtractionMutation();

  // Purity Tester State
  const [simGurType, setSimGurType] = useState<GurType>('DATE_PALM_NOLEN_JHOLA');
  const [simSucrose, setSimSucrose] = useState<number>(68.5);
  const [simReducingSugar, setSimReducingSugar] = useState<number>(12.2);
  const [simHydrosulfitePpm, setSimHydrosulfitePpm] = useState<number>(0.0);
  const [simHydrosulfiteStatus, setSimHydrosulfiteStatus] =
    useState<HydrosulfiteTestResult>('NEGATIVE_ZERO_TOLERANCE_PASS');
  const [simSugarAdulteration, setSimSugarAdulteration] =
    useState<SugarSyrupAdulterationStatus>('GENUINE_PURE_SAP');
  const [simColoring, setSimColoring] = useState<boolean>(false);
  const [simStrikeTemp, setSimStrikeTemp] = useState<number>(115.5);
  const [simResult, setSimResult] = useState<GurPurityEvaluationResult | null>(null);

  const [evaluatePurity, { isLoading: isEvaluatingPurity }] =
    useEvaluateGurPurityMutation();

  const handleRunCalculator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await calculateExtraction({
        gurType: calcGurType,
        rawSapVolumeLiters: calcSapVolume,
        sapBrixDegrees: calcBrix,
        sapCollectionShift: calcShift,
      }).unwrap();
      setCalcResult(res);
    } catch (err) {
      console.error('Calculation failed', err);
    }
  };

  const handleRunPuritySimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await evaluatePurity({
        gurType: simGurType,
        sucrosePct: simSucrose,
        reducingSugarPct: simReducingSugar,
        hydrosulfitePpm: simHydrosulfitePpm,
        hydrosulfiteStatus: simHydrosulfiteStatus,
        sugarAdulterationStatus: simSugarAdulteration,
        isArtificialColoringDetected: simColoring,
        strikeBoilingTempCelsius: simStrikeTemp,
      }).unwrap();
      setSimResult(res);
    } catch (err) {
      console.error('Purity evaluation failed', err);
    }
  };

  const handleOpenPurchaseModal = (lot: ArtisanalGurLot) => {
    setSelectedLotForBuy(lot);
    setOrderQuantityKg(lot.minimumOrderKg || 2);
    setPurchaseSuccessMessage('');
    setPurchaseErrorMessage('');
  };

  const handleExecutePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLotForBuy) return;

    setPurchaseSuccessMessage('');
    setPurchaseErrorMessage('');

    try {
      await purchaseLotMutation({
        id: selectedLotForBuy.id,
        body: {
          buyerName,
          buyerPhone,
          deliveryAddress,
          orderQuantityKg,
        },
      }).unwrap();

      setPurchaseSuccessMessage(
        `Purchase contract secured! ${orderQuantityKg} kg allocated from lot ${selectedLotForBuy.lotCode}. Authenticity seal verified.`,
      );
      setTimeout(() => {
        setSelectedLotForBuy(null);
        setPurchaseSuccessMessage('');
      }, 2500);
    } catch (err: any) {
      setPurchaseErrorMessage(
        err?.data?.message || 'Transaction could not be completed. Check stock availability.',
      );
    }
  };

  const formatGurTypeName = (type: GurType): string => {
    switch (type) {
      case 'DATE_PALM_NOLEN_JHOLA':
        return 'Nolen Jhola Gur (নলেন ঝোল গুড়)';
      case 'DATE_PALM_PATALI_SOLID':
        return 'Date Palm Patali Gur (পাটালি গুড়)';
      case 'DATE_PALM_DANADAR':
        return 'Date Palm Danadar (দানাদার গুড়)';
      case 'SUGARCANE_ORGANIC_SOLID':
        return 'Organic Sugarcane Gur (আখের লাল গুড়)';
      case 'SUGARCANE_CRUMBLED_POWDER':
        return 'Sugarcane Crumbled Gur (আখের গুঁড়া গুড়)';
      case 'MOLASSES_CHITA_ORGANIC':
        return 'Organic Chita Molasses (চিটা গুড়)';
      default:
        return type;
    }
  };

  const formatPackagingName = (pkg: string): string => {
    switch (pkg) {
      case 'TRADITIONAL_EARTHEN_POT_1KG':
        return 'Traditional Earthen Pot (মাটির হাঁড়ি - 1kg)';
      case 'FOOD_GRADE_GLASS_JAR_500G':
        return 'Glass Jar (500g)';
      case 'FOOD_GRADE_GLASS_JAR_1KG':
        return 'Glass Jar (1kg)';
      case 'BAMBOO_LEAF_PATALI_BLOCK_2KG':
        return 'Bamboo Leaf Mat (চাটাই - 2kg)';
      case 'BULK_FOOD_TIN_10KG':
        return 'Bulk Food Tin (10kg)';
      default:
        return pkg;
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/40 text-stone-900 pb-16">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-yellow-900 to-amber-950 text-amber-50 py-12 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-600 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Jashore Registered GI Product
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  100% Hydrosulfite Free (০.০ ppm)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  BSTI BDS 1660 & BDS 139
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-serif">
                Artisanal Date Palm & Sugarcane Gur
              </h1>
              <p className="mt-2 text-lg text-amber-200 font-medium">
                ঐতিহ্যবাহী যশোরের খাঁটি নলেন খেজুর গুড়, পাটালির স্ফটিক দানা ও কেমিক্যালমুক্ত আখের গুড়
              </p>
              <p className="mt-1 text-sm text-amber-300/80 max-w-3xl">
                Authentic dawn-harvested Jiran sap, slow-boiled in artisanal open iron karais (115°C–120°C). 
                Zero tolerance for hazardous bleaching sodium hydrosulfite (হাইড্রোজ) or white sugar syrup dilution.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/seller/artisanal-gur"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition-colors shadow-sm"
              >
                <Flame className="w-4 h-4" />
                Gachhi Boiling Hub
              </Link>
              <Link
                href="/admin/artisanal-gur"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-100 font-medium text-sm transition-colors border border-amber-500/40"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                BSTI Lab & Seizure Desk
              </Link>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-amber-800/60">
            <div className="bg-amber-950/60 backdrop-blur-sm p-4 rounded-xl border border-amber-700/40">
              <div className="text-xs text-amber-300 font-medium uppercase tracking-wider">Active Lots</div>
              <div className="text-2xl font-bold text-white mt-1">{lots.length} Certified Lots</div>
              <div className="text-xs text-amber-400/80 mt-1">Earthen Pots & Glass Jars</div>
            </div>
            <div className="bg-amber-950/60 backdrop-blur-sm p-4 rounded-xl border border-amber-700/40">
              <div className="text-xs text-amber-300 font-medium uppercase tracking-wider">Tapping Cooperatives</div>
              <div className="text-2xl font-bold text-white mt-1">{batches.length} Live Batches</div>
              <div className="text-xs text-amber-400/80 mt-1">Jashore, Chuadanga, Kushtia</div>
            </div>
            <div className="bg-amber-950/60 backdrop-blur-sm p-4 rounded-xl border border-amber-700/40">
              <div className="text-xs text-amber-300 font-medium uppercase tracking-wider">Chemical Purity Pass</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {labTests.filter((t) => t.isBstiApproved).length} / {labTests.length} Passed
              </div>
              <div className="text-xs text-emerald-300/80 mt-1">Zero Hydrosulfite (0.0 ppm)</div>
            </div>
            <div className="bg-amber-950/60 backdrop-blur-sm p-4 rounded-xl border border-amber-700/40">
              <div className="text-xs text-amber-300 font-medium uppercase tracking-wider">GI Registered</div>
              <div className="text-2xl font-bold text-amber-300 mt-1">Grade AAA Heritage</div>
              <div className="text-xs text-amber-400/80 mt-1">Digital QR Seals Issued</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-amber-200 space-x-2 overflow-x-auto pb-1 mb-8">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-t-lg font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Certified Artisanal Catalog ({lots.length})
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-t-lg font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/60'
            }`}
          >
            <Scale className="w-4 h-4" />
            Sap-to-Gur Yield Calculator
          </button>
          <button
            onClick={() => setActiveTab('purity_tester')}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-t-lg font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'purity_tester'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Anti-Adulteration & Hydrosulfite Verifier
          </button>
          <button
            onClick={() => setActiveTab('boiling_telemetry')}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-t-lg font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'boiling_telemetry'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            Live Boiling Pan Telemetry ({batches.length})
          </button>
        </div>

        {/* Tab 1: Marketplace Catalog */}
        {activeTab === 'catalog' && (
          <div>
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-stone-700 flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-amber-700" /> Filter Lots:
                </span>
                <select
                  value={selectedGurType}
                  onChange={(e) => setSelectedGurType(e.target.value as any)}
                  className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ALL">All Gur Varieties</option>
                  <option value="DATE_PALM_NOLEN_JHOLA">Date Palm Nolen Jhola (নলেন ঝোল গুড়)</option>
                  <option value="DATE_PALM_PATALI_SOLID">Date Palm Patali Solid (পাটালি গুড়)</option>
                  <option value="DATE_PALM_DANADAR">Date Palm Danadar (দানাদার গুড়)</option>
                  <option value="SUGARCANE_ORGANIC_SOLID">Sugarcane Organic Solid (আখের লাল গুড়)</option>
                  <option value="SUGARCANE_CRUMBLED_POWDER">Sugarcane Crumbled Powder (আখের গুঁড়া)</option>
                  <option value="MOLASSES_CHITA_ORGANIC">Organic Chita Molasses (চিটা গুড়)</option>
                </select>

                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value as any)}
                  className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ALL">All Geographical Regions</option>
                  <option value="JASHORE_JHIKARGACHA">Jashore Jhikargacha (যশোর ঝিকরগাছা)</option>
                  <option value="JASHORE_KOTWALI">Jashore Kotwali (যশোর সদর)</option>
                  <option value="CHUADANGA_DAMURHUDA">Chuadanga Damurhuda (চুয়াডাঙ্গা দামুড়হুদা)</option>
                  <option value="KUSHTIA_KUMARKHALI">Kushtia Kumarkhali (কুষ্টিয়া কুমারখালী)</option>
                  <option value="FARIDPUR_SADAR">Faridpur Sadar (ফরিদপুর সদর)</option>
                  <option value="NATORE_LALPUR">Natore Lalpur (নাটোর লালপুর)</option>
                  <option value="RAJSHAHI_BAGHA">Rajshahi Bagha (রাজশাহী বাঘা)</option>
                </select>
              </div>

              <div className="text-xs text-stone-500 font-medium">
                Showing {lots.length} certified forward batches
              </div>
            </div>

            {/* Lots Grid */}
            {lotsLoading ? (
              <div className="py-20 text-center text-stone-500">Loading artisanal gur lots...</div>
            ) : lots.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-stone-200">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-stone-800">No Gur Lots Found</h3>
                <p className="text-stone-500 text-sm mt-1">Try adjusting the filter criteria or check back after morning harvest boiling.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lots.map((lot) => (
                  <div
                    key={lot.id}
                    className="bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                          {lot.lotCode}
                        </span>
                        {lot.isGiTagged && (
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300 flex items-center gap-1">
                            <Award className="w-3 h-3 text-yellow-600" />
                            GI Tagged
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-lg text-stone-900 mb-1 leading-snug">
                        {lot.title}
                      </h3>
                      <p className="text-xs text-stone-500 mb-3 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-700" />
                        {lot.gachhiCoopName}
                      </p>

                      <div className="space-y-2 py-3 border-y border-stone-100 text-xs text-stone-600">
                        <div className="flex justify-between">
                          <span className="text-stone-500">Variety:</span>
                          <span className="font-medium text-stone-800">{formatGurTypeName(lot.gurType)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Packaging:</span>
                          <span className="font-medium text-stone-800">{formatPackagingName(lot.packagingType)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Aroma Rating:</span>
                          <span className="font-semibold text-amber-700 flex items-center gap-1">
                            {'★'.repeat(lot.aromaRating)}{'☆'.repeat(5 - lot.aromaRating)} ({lot.aromaRating}/5)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Chemical Verification:</span>
                          <span className="font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Hydrosulfite 0.0 ppm
                          </span>
                        </div>
                        {lot.digitalAuthenticitySeal && (
                          <div className="flex justify-between">
                            <span className="text-stone-500">Authenticity Seal:</span>
                            <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {lot.digitalAuthenticitySeal}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-baseline justify-between">
                        <div>
                          <div className="text-xs text-stone-500">Wholesale Price</div>
                          <div className="text-2xl font-black text-amber-900">
                            ৳{lot.pricePerKgBdt}{' '}
                            <span className="text-xs font-normal text-stone-500">/ kg</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-stone-500">Available Stock</div>
                          <div className="text-base font-bold text-stone-800">
                            {lot.availableWeightKg} kg{' '}
                            <span className="text-xs font-normal text-stone-500">
                              (Min {lot.minimumOrderKg} kg)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          lot.status === 'AVAILABLE_FOR_SALE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {lot.status === 'AVAILABLE_FOR_SALE' ? 'In Stock' : 'Sold Out'}
                      </span>

                      <button
                        onClick={() => handleOpenPurchaseModal(lot)}
                        disabled={lot.status !== 'AVAILABLE_FOR_SALE' || lot.availableWeightKg <= 0}
                        className="px-4 py-2 bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white rounded-lg font-medium text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Procure Lot
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Sap-to-Gur Extraction & Yield Calculator */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-amber-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-lg text-stone-900">
                  Sap-to-Gur Extraction & Yield Simulator
                </h3>
              </div>
              <p className="text-xs text-stone-500 mb-6">
                Calculate expected artisanal gur yield based on raw sap Brix refractometer density, tree tapping shift, and boiling strike temperature.
              </p>

              <form onSubmit={handleRunCalculator} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Gur Variety
                  </label>
                  <select
                    value={calcGurType}
                    onChange={(e) => setCalcGurType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="DATE_PALM_NOLEN_JHOLA">Date Palm Nolen Jhola Gur (নলেন ঝোল গুড়)</option>
                    <option value="DATE_PALM_PATALI_SOLID">Date Palm Patali Solid (পাটালি গুড়)</option>
                    <option value="DATE_PALM_DANADAR">Date Palm Danadar (দানাদার গুড়)</option>
                    <option value="SUGARCANE_ORGANIC_SOLID">Sugarcane Organic Solid (আখের লাল গুড়)</option>
                    <option value="MOLASSES_CHITA_ORGANIC">Organic Chita Molasses (চিটা গুড়)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Raw Sap / Cane Juice Volume (Liters)
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={calcSapVolume}
                    onChange={(e) => setCalcSapVolume(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Refractometer Sap Brix (degrees: 10° - 20°): {calcBrix}° Brix
                  </label>
                  <input
                    type="range"
                    min="10.0"
                    max="22.0"
                    step="0.1"
                    value={calcBrix}
                    onChange={(e) => setCalcBrix(Number(e.target.value))}
                    className="w-full accent-amber-700"
                  />
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>10° (Dilute/Rainy)</span>
                    <span>13.5° (Prime Jiran Dawn)</span>
                    <span>18.5° (Concentrated Sugarcane)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Sap Collection Shift
                  </label>
                  <select
                    value={calcShift}
                    onChange={(e) => setCalcShift(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="DAWN_JIRAN_PREMIUM">Dawn Jiran Sap (ভোরের জিরান রস - Premium Aroma)</option>
                    <option value="DAY_DAULA_STANDARD">Day Daula Sap (ডাউলা রস - Higher Reducing Sugar)</option>
                    <option value="EVENING_SWEET_INTAKE">Evening Sap (সন্ধ্যার রস - Standard Table Gur)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isCalculatingExtraction}
                  className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm mt-4 flex items-center justify-center gap-2"
                >
                  <Scale className="w-4 h-4" />
                  {isCalculatingExtraction ? 'Calculating...' : 'Compute Production Yield'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-6">
              {calcResult ? (
                <div className="bg-white p-6 rounded-2xl border border-amber-300 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <div>
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                        Yield Projection
                      </span>
                      <h4 className="text-xl font-bold text-stone-900">
                        {formatGurTypeName(calcResult.gurType)}
                      </h4>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      Ratio: {calcResult.sapToGurRatio} L : 1 kg
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
                      <div className="text-xs text-stone-500">Expected Pure Gur</div>
                      <div className="text-2xl font-black text-amber-900 mt-1">
                        {calcResult.expectedGurWeightKg} kg
                      </div>
                      <div className="text-[11px] text-amber-700/80 mt-0.5">
                        From {calcResult.rawSapVolumeLiters} L raw sap
                      </div>
                    </div>

                    <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
                      <div className="text-xs text-stone-500">Recommended Strike Temp</div>
                      <div className="text-2xl font-black text-stone-900 mt-1 flex items-center gap-1">
                        <Thermometer className="w-5 h-5 text-red-600" />
                        {calcResult.recommendedStrikeTempCelsius}°C
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">Avoid scorching above 123°C</div>
                    </div>

                    <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
                      <div className="text-xs text-stone-500">Aroma Preservation</div>
                      <div className="text-2xl font-black text-emerald-800 mt-1">
                        {calcResult.aromaPreservationScore}%
                      </div>
                      <div className="text-[11px] text-emerald-700 mt-0.5">Volatile terpene & ester score</div>
                    </div>

                    <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
                      <div className="text-xs text-stone-500">Finished Gur Brix</div>
                      <div className="text-2xl font-black text-stone-900 mt-1">
                        {calcResult.sweetnessBrixProjected}° Brix
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        Byproduct Molasses: {calcResult.byproductChitaMolassesKg} kg
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-100/50 rounded-xl border border-amber-300/70 text-xs text-amber-950 leading-relaxed flex gap-2">
                    <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold">Master Tapper Advisory: </strong>
                      {calcResult.advisoryMessage}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-stone-300 h-full flex flex-col items-center justify-center">
                  <Gauge className="w-12 h-12 text-stone-300 mb-3" />
                  <h4 className="font-bold text-stone-700">Awaiting Simulation Parameters</h4>
                  <p className="text-stone-400 text-xs max-w-sm mt-1">
                    Select your sap volume, refractometer Brix density, and collection shift on the left to project production yields.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Chemical Purity & Anti-Adulteration Simulator */}
        {activeTab === 'purity_tester' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-amber-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-lg text-stone-900">
                  Anti-Adulteration & Hydrosulfite Chemical Verifier
                </h3>
              </div>
              <p className="text-xs text-stone-500 mb-6">
                Laboratory verification engine enforcing zero tolerance for toxic bleaching agent Sodium Hydrosulfite (Na2S2O4), synthetic dyes, and white sugar syrup dilution under Bangladesh Food Safety Act 2013.
              </p>

              <form onSubmit={handleRunPuritySimulation} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Sucrose Content (%): {simSucrose}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      step="0.5"
                      value={simSucrose}
                      onChange={(e) => setSimSucrose(Number(e.target.value))}
                      className="w-full accent-amber-700"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400">
                      <span>65-75% (Pure Palm)</span>
                      <span>&gt;82% (White Sugar Added)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Reducing Sugar (%): {simReducingSugar}%
                    </label>
                    <input
                      type="range"
                      min="1.0"
                      max="20.0"
                      step="0.1"
                      value={simReducingSugar}
                      onChange={(e) => setSimReducingSugar(Number(e.target.value))}
                      className="w-full accent-amber-700"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400">
                      <span>&lt;5% (Adulterated)</span>
                      <span>10-15% (Authentic Palm)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Sodium Hydrosulfite (হাইড্রোজ) Chemical Screen: {simHydrosulfitePpm} ppm
                  </label>
                  <input
                    type="range"
                    min="0.0"
                    max="50.0"
                    step="0.5"
                    value={simHydrosulfitePpm}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSimHydrosulfitePpm(val);
                      setSimHydrosulfiteStatus(
                        val > 0
                          ? 'POSITIVE_CONTAMINATED_SEIZED'
                          : 'NEGATIVE_ZERO_TOLERANCE_PASS',
                      );
                    }}
                    className={`w-full ${simHydrosulfitePpm > 0 ? 'accent-red-600' : 'accent-emerald-600'}`}
                  />
                  <div className="flex justify-between text-[10px] font-semibold">
                    <span className="text-emerald-700">0.0 ppm (Zero-Tolerance Safe Pass)</span>
                    <span className="text-red-700">&gt;0 ppm (Toxic Bleaching Seizure)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Sugar Dilution Status
                    </label>
                    <select
                      value={simSugarAdulteration}
                      onChange={(e) => setSimSugarAdulteration(e.target.value as any)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="GENUINE_PURE_SAP">Genuine 100% Pure Sap</option>
                      <option value="SUSPECTED_SUGAR_SYRUP_DILUTED">Suspected Sugar Syrup Diluted</option>
                      <option value="HIGH_SUGAR_ADULTERATED">High Sugar Adulterated</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Strike Temperature (°C)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={simStrikeTemp}
                      onChange={(e) => setSimStrikeTemp(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      checked={simColoring}
                      onChange={(e) => setSimColoring(e.target.checked)}
                      className="rounded border-stone-300 text-amber-700 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>Synthetic Coal-Tar / Azo Dye (Metanil Yellow / Orange-II) Detected</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isEvaluatingPurity}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm mt-4 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {isEvaluatingPurity ? 'Analyzing Chemical Profile...' : 'Execute Regulatory Compliance Audit'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-6">
              {simResult ? (
                <div
                  className={`p-6 rounded-2xl border shadow-sm space-y-5 ${
                    simResult.isHydrosulfiteContaminated || simResult.isColoringDetected
                      ? 'bg-red-50/60 border-red-300'
                      : simResult.isSugarAdulterated
                      ? 'bg-amber-50/60 border-amber-300'
                      : 'bg-emerald-50/60 border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                        Regulatory Audit Outcome
                      </span>
                      <h4 className="text-xl font-bold text-stone-900">{simResult.verdict}</h4>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        simResult.bstiComplianceApproved
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-red-100 text-red-900 border-red-300'
                      }`}
                    >
                      Score: {simResult.qualityScore} / 100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white/80 rounded-xl border border-stone-200">
                      <div className="text-stone-500">Hydrosulfite Status</div>
                      <div
                        className={`font-bold mt-1 ${
                          simResult.isHydrosulfiteContaminated
                            ? 'text-red-700 flex items-center gap-1'
                            : 'text-emerald-700 flex items-center gap-1'
                        }`}
                      >
                        {simResult.isHydrosulfiteContaminated ? (
                          <>
                            <AlertTriangle className="w-4 h-4 text-red-600" /> Contaminated (Seized)
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Zero (0.0 ppm Pass)
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-white/80 rounded-xl border border-stone-200">
                      <div className="text-stone-500">Sugar Dilution</div>
                      <div
                        className={`font-bold mt-1 ${
                          simResult.isSugarAdulterated ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        {simResult.isSugarAdulterated ? 'Adulterated (Syrup Added)' : 'Genuine Pure Sap'}
                      </div>
                    </div>

                    <div className="p-3 bg-white/80 rounded-xl border border-stone-200">
                      <div className="text-stone-500">Synthetic Dyes</div>
                      <div
                        className={`font-bold mt-1 ${
                          simResult.isColoringDetected ? 'text-red-700' : 'text-emerald-700'
                        }`}
                      >
                        {simResult.isColoringDetected ? 'Prohibited Dye Found' : 'Natural Uncolored'}
                      </div>
                    </div>

                    <div className="p-3 bg-white/80 rounded-xl border border-stone-200">
                      <div className="text-stone-500">Thermal Profile</div>
                      <div
                        className={`font-bold mt-1 ${
                          simResult.isOverheated ? 'text-orange-700' : 'text-stone-800'
                        }`}
                      >
                        {simResult.isOverheated ? 'Scorched (>123°C)' : 'Optimal Crystallization'}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-xl border text-xs leading-relaxed flex gap-2.5 ${
                      simResult.isHydrosulfiteContaminated
                        ? 'bg-red-100 text-red-950 border-red-300'
                        : 'bg-white text-stone-800 border-stone-200'
                    }`}
                  >
                    <AlertTriangle
                      className={`w-5 h-5 shrink-0 mt-0.5 ${
                        simResult.isHydrosulfiteContaminated ? 'text-red-700' : 'text-amber-600'
                      }`}
                    />
                    <div>
                      <strong className="font-semibold">Safety & Regulatory Analysis: </strong>
                      {simResult.safetyNotes}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-stone-300 h-full flex flex-col items-center justify-center">
                  <ShieldCheck className="w-12 h-12 text-stone-300 mb-3" />
                  <h4 className="font-bold text-stone-700">Awaiting Chemical Screening</h4>
                  <p className="text-stone-400 text-xs max-w-sm mt-1">
                    Configure chemical parameters on the left and run the verification to test against BSTI BDS 1660 and Mobile Court food safety rules.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Live Boiling Pan Telemetry */}
        {activeTab === 'boiling_telemetry' && (
          <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg text-stone-900">
                  Live Tapping & Karai Boiling Pan Telemetry
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Real-time morning harvest tracking across traditional date palm tapper guilds in Jashore, Chuadanga, and Kushtia.
                </p>
              </div>
              <Link
                href="/seller/artisanal-gur"
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Flame className="w-4 h-4" />
                Open Gachhi Logger
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3">Batch Number</th>
                    <th className="px-5 py-3">Cooperative / Gachhi</th>
                    <th className="px-5 py-3">Variety</th>
                    <th className="px-5 py-3">Shift</th>
                    <th className="px-5 py-3">Raw Sap (L)</th>
                    <th className="px-5 py-3">Sap Brix</th>
                    <th className="px-5 py-3">Strike Temp</th>
                    <th className="px-5 py-3">Output (Kg)</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-amber-900">
                        {batch.batchNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-stone-900">{batch.gachhiCoopName}</div>
                        <div className="text-[11px] text-stone-400">{batch.contactPhone}</div>
                      </td>
                      <td className="px-5 py-3.5 font-medium">{formatGurTypeName(batch.gurType)}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                          {batch.sapCollectionShift === 'DAWN_JIRAN_PREMIUM' ? 'Dawn Jiran' : 'Day / Evening'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold">{batch.rawSapVolumeLiters} L</td>
                      <td className="px-5 py-3.5">{batch.sapBrixDegrees}° Brix</td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-red-700 flex items-center gap-1">
                          <Thermometer className="w-3.5 h-3.5" />
                          {batch.strikeBoilingTempCelsius}°C
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-amber-950">
                        {batch.producedGurWeightKg} kg
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900">
                          {batch.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Procurement / Purchasing Modal */}
      {selectedLotForBuy && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-amber-300 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedLotForBuy(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="w-5 h-5 text-amber-700" />
              <h3 className="font-bold text-lg text-stone-900">Procure Artisanal Gur Lot</h3>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Direct allocation from certified tapper cooperatives. Includes digital seal authentication and temperature-controlled logistics dispatch.
            </p>

            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 mb-4 text-xs space-y-1">
              <div className="font-bold text-amber-950 text-sm">{selectedLotForBuy.title}</div>
              <div className="text-stone-600">Lot: {selectedLotForBuy.lotCode}</div>
              <div className="text-stone-600">Origin: {selectedLotForBuy.originRegion.replace(/_/g, ' ')}</div>
              <div className="text-stone-600">Rate: ৳{selectedLotForBuy.pricePerKgBdt} / kg</div>
              <div className="text-stone-600">Available: {selectedLotForBuy.availableWeightKg} kg</div>
            </div>

            {purchaseSuccessMessage && (
              <div className="mb-4 p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{purchaseSuccessMessage}</span>
              </div>
            )}

            {purchaseErrorMessage && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-900 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{purchaseErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleExecutePurchase} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Procurement Quantity (kg) - Min {selectedLotForBuy.minimumOrderKg} kg
                </label>
                <input
                  type="number"
                  min={selectedLotForBuy.minimumOrderKg}
                  max={selectedLotForBuy.availableWeightKg}
                  step="1"
                  required
                  value={orderQuantityKg}
                  onChange={(e) => setOrderQuantityKg(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Buyer / Enterprise Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengal Heritage Sweets or Retail Customer"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+8801700000000"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Delivery Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhanmondi Road 27, Dhaka"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-stone-200">
                <div className="text-xs text-stone-500">
                  Total Payable:{' '}
                  <span className="font-bold text-amber-900 text-sm">
                    ৳{orderQuantityKg * selectedLotForBuy.pricePerKgBdt}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isPurchasing}
                  className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {isPurchasing ? 'Securing Contract...' : 'Confirm Order & Lock Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
