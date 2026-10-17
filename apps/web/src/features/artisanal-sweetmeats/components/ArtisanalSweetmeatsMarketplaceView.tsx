'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
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
  Droplets,
  Snowflake,
  Heart,
} from 'lucide-react';
import {
  useGetArtisanalLotsQuery,
  useGetProductionBatchesQuery,
  useGetSweetmeatLabTestsQuery,
  useCalculateSweetmeatYieldMutation,
  useEvaluateSweetmeatPurityMutation,
  usePurchaseSweetmeatLotMutation,
  SweetmeatType,
  SweetmeatRegion,
  MilkSourceType,
  StarchAdulterationTest,
  ArtisanalSweetmeatLot,
  SweetmeatYieldCalculationResult,
  SweetmeatPurityEvaluationResult,
} from '../artisanalSweetmeatsApi';

export const ArtisanalSweetmeatsMarketplaceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'catalog' | 'calculator' | 'purity_tester' | 'moira_telemetry'
  >('catalog');

  const [selectedSweetmeatType, setSelectedSweetmeatType] = useState<SweetmeatType | 'ALL'>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<SweetmeatRegion | 'ALL'>('ALL');

  // Queries
  const { data: lots = [], isLoading: lotsLoading } = useGetArtisanalLotsQuery(
    selectedSweetmeatType !== 'ALL' || selectedRegion !== 'ALL'
      ? {
          sweetmeatType: selectedSweetmeatType !== 'ALL' ? selectedSweetmeatType : undefined,
          region: selectedRegion !== 'ALL' ? selectedRegion : undefined,
        }
      : undefined,
  );

  const { data: batches = [], isLoading: batchesLoading } = useGetProductionBatchesQuery();
  const { data: labTests = [], isLoading: testsLoading } = useGetSweetmeatLabTestsQuery();

  // Purchase Modal State
  const [selectedLotForBuy, setSelectedLotForBuy] = useState<ArtisanalSweetmeatLot | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderQuantityKg, setOrderQuantityKg] = useState<number>(2);
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState('');
  const [purchaseErrorMessage, setPurchaseErrorMessage] = useState('');

  const [purchaseLotMutation, { isLoading: isPurchasing }] = usePurchaseSweetmeatLotMutation();

  // Yield Calculator State
  const [calcSweetmeatType, setCalcSweetmeatType] = useState<SweetmeatType>('BOGURA_SPECIAL_CURD_DOI');
  const [calcMilkVolume, setCalcMilkVolume] = useState<number>(300);
  const [calcMilkFat, setCalcMilkFat] = useState<number>(5.2);
  const [calcMilkSource, setCalcMilkSource] = useState<MilkSourceType>('INDIGENOUS_COW_DESHI');
  const [calcResult, setCalcResult] = useState<SweetmeatYieldCalculationResult | null>(null);

  const [calculateYield, { isLoading: isCalculatingYield }] =
    useCalculateSweetmeatYieldMutation();

  // Purity Tester State
  const [simSweetmeatType, setSimSweetmeatType] = useState<SweetmeatType>('NATORE_AUTHENTIC_KACHAGOLLA');
  const [simFatDryMatter, setSimFatDryMatter] = useState<number>(31.0);
  const [simMoisture, setSimMoisture] = useState<number>(52.0);
  const [simStarchStatus, setSimStarchStatus] =
    useState<StarchAdulterationTest>('NEGATIVE_ZERO_TOLERANCE_PASS');
  const [simUreaDetergent, setSimUreaDetergent] = useState(false);
  const [simVanaspati, setSimVanaspati] = useState(false);
  const [simColoring, setSimColoring] = useState(false);
  const [simCoagulationTemp, setSimCoagulationTemp] = useState<number>(83.5);
  const [simResult, setSimResult] = useState<SweetmeatPurityEvaluationResult | null>(null);

  const [evaluatePurity, { isLoading: isEvaluatingPurity }] =
    useEvaluateSweetmeatPurityMutation();

  const handleRunCalculator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await calculateYield({
        sweetmeatType: calcSweetmeatType,
        inputMilkVolumeLiters: calcMilkVolume,
        milkFatPct: calcMilkFat,
        milkSource: calcMilkSource,
      }).unwrap();
      setCalcResult(res);
    } catch (err) {
      console.error('Yield calculation failed', err);
    }
  };

  const handleRunPuritySimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await evaluatePurity({
        sweetmeatType: simSweetmeatType,
        milkFatDryMatterPct: simFatDryMatter,
        moisturePct: simMoisture,
        starchAdulterationStatus: simStarchStatus,
        isDetergentOrUreaDetected: simUreaDetergent,
        isHydrogenatedFatVanaspatiDetected: simVanaspati,
        isArtificialColoringDetected: simColoring,
        coagulationTempCelsius: simCoagulationTemp,
      }).unwrap();
      setSimResult(res);
    } catch (err) {
      console.error('Purity evaluation failed', err);
    }
  };

  const handleOpenPurchaseModal = (lot: ArtisanalSweetmeatLot) => {
    setSelectedLotForBuy(lot);
    setOrderQuantityKg(lot.minimumOrderKg || 1);
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
        `Order confirmed! ${orderQuantityKg} kg allocated from lot ${selectedLotForBuy.lotCode}. Dispatched via temperature-controlled cold chain.`,
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

  const formatSweetmeatName = (type: SweetmeatType): string => {
    switch (type) {
      case 'BOGURA_SPECIAL_CURD_DOI':
        return 'Bogura Shahi Curd (বগুড়ার লাল দই)';
      case 'NATORE_AUTHENTIC_KACHAGOLLA':
        return 'Natore Kachagolla (নাটোরের কাঁচাগোল্লা)';
      case 'PORABARI_CHAMCHAM':
        return 'Tangail Porabari Chamcham (পোড়াবাড়ীর চমচম)';
      case 'COMILLA_RASMALAI_MATRI_BHANDAR':
        return 'Comilla Matri Bhandar Rasmalai (কুমিল্লার রসমালাই)';
      case 'NETROKONA_BALISH_MISTI':
        return 'Netrokona Balish Misti (বালিশ মিষ্টি)';
      case 'PURE_COW_MILK_CHHANA':
        return 'Pure Cow Milk Chhana (খাঁটি মিষ্টির ছানা)';
      case 'TRADITIONAL_GAWA_GHEE':
        return 'Traditional Gawa Ghee (খাঁটি গাওয়া ঘি)';
      default:
        return type;
    }
  };

  const formatPackagingName = (pkg: string): string => {
    switch (pkg) {
      case 'POROUS_CLAY_SRA_500G':
        return 'Porous Clay Sra (মাটির সরা - 500g)';
      case 'POROUS_CLAY_SRA_1KG':
        return 'Porous Clay Sra (মাটির সরা - 1kg)';
      case 'HERMETIC_SWEET_BOX_1KG':
        return 'Hermetic Sweet Box (1kg)';
      case 'FOOD_GRADE_TIN_CAN_2KG':
        return 'Food-Grade Tin Can (2kg)';
      case 'GLASS_JAR_GAWA_GHEE_500G':
        return 'Glass Jar (500g)';
      case 'INSULATED_COLD_BOX_5KG':
        return 'Insulated Ice-Pack Cold Box (5kg)';
      default:
        return pkg;
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/30 text-stone-900 pb-16">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-amber-950 to-stone-900 text-rose-50 py-12 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-500 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  National GI Sweetmeats Registry
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  100% Starch & Flour Free (Iodine Tested)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  <Snowflake className="w-3.5 h-3.5 text-blue-400" />
                  Refrigerated Cold-Chain Dispatch
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-serif text-white">
                Traditional Artisanal Sweetmeats & Chhana
              </h1>
              <p className="mt-2 text-lg text-amber-200 font-medium">
                বগুড়ার ক্ষীরসা লাল দই, নাটোরের খাঁটি কাঁচাগোল্লা, পোড়াবাড়ীর চমচম ও কুমিল্লার রসমালাই
              </p>
              <p className="mt-1 text-sm text-amber-300/80 max-w-3xl">
                Curdled at strictly 82°C–85°C with natural sour whey. Zero tolerance for cheap maida/starch fillers, urea in synthetic milk, or hydrogenated vanaspati trans-fats.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/seller/artisanal-sweetmeats"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition-colors shadow-sm"
              >
                <Droplets className="w-4 h-4" />
                Moira Production Hub
              </Link>
              <Link
                href="/admin/artisanal-sweetmeats"
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
              <div className="text-xs text-amber-300 font-medium uppercase tracking-wider">Certified Forward Lots</div>
              <div className="text-2xl font-bold text-white mt-1">{lots.length} GI Batches</div>
              <div className="text-xs text-amber-400/80 mt-1">Earthen Sra & Hermetic Boxes</div>
            </div>
            <div className="bg-amber-950/60 backdrop-blur-sm p-4 rounded-xl border border-amber-700/40">
              <div className="text-xs text-amber-300 font-medium uppercase tracking-wider">Artisan Moira Guilds</div>
              <div className="text-2xl font-bold text-white mt-1">{batches.length} Live Batches</div>
              <div className="text-xs text-amber-400/80 mt-1">Bogura, Natore, Tangail, Comilla</div>
            </div>
            <div className="bg-amber-950/60 backdrop-blur-sm p-4 rounded-xl border border-amber-700/40">
              <div className="text-xs text-amber-300 font-medium uppercase tracking-wider">Chemical Purity Pass</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {labTests.filter((t) => t.isBstiApproved).length} / {labTests.length} Passed
              </div>
              <div className="text-xs text-emerald-300/80 mt-1">Zero Starch & Vanaspati</div>
            </div>
            <div className="bg-amber-950/60 backdrop-blur-sm p-4 rounded-xl border border-amber-700/40">
              <div className="text-xs text-amber-300 font-medium uppercase tracking-wider">Protected Origin GI</div>
              <div className="text-2xl font-bold text-amber-300 mt-1">Grade AAA Heritage</div>
              <div className="text-xs text-amber-400/80 mt-1">Cryptographic QR Seals Issued</div>
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
                ? 'bg-amber-800 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-rose-100/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Certified Artisanal Catalog ({lots.length})
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-t-lg font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'bg-amber-800 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-rose-100/60'
            }`}
          >
            <Scale className="w-4 h-4" />
            Chhana & Curd Yield Simulator
          </button>
          <button
            onClick={() => setActiveTab('purity_tester')}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-t-lg font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'purity_tester'
                ? 'bg-amber-800 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-rose-100/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Starch & Chemical Adulteration Verifier
          </button>
          <button
            onClick={() => setActiveTab('moira_telemetry')}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-t-lg font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'moira_telemetry'
                ? 'bg-amber-800 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-rose-100/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            Live Moira Curdling Telemetry ({batches.length})
          </button>
        </div>

        {/* Tab 1: Marketplace Catalog */}
        {activeTab === 'catalog' && (
          <div>
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-stone-700 flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-amber-700" /> Filter Sweetmeats:
                </span>
                <select
                  value={selectedSweetmeatType}
                  onChange={(e) => setSelectedSweetmeatType(e.target.value as any)}
                  className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ALL">All Sweetmeat Delicacies</option>
                  <option value="BOGURA_SPECIAL_CURD_DOI">Bogura Curd (বগুড়ার ক্ষীরসা লাল দই)</option>
                  <option value="NATORE_AUTHENTIC_KACHAGOLLA">Natore Kachagolla (নাটোরের কাঁচাগোল্লা)</option>
                  <option value="PORABARI_CHAMCHAM">Tangail Porabari Chamcham (পোড়াবাড়ীর চমচম)</option>
                  <option value="COMILLA_RASMALAI_MATRI_BHANDAR">Comilla Rasmalai (কুমিল্লার রসমালাই)</option>
                  <option value="NETROKONA_BALISH_MISTI">Netrokona Balish Misti (বালিশ মিষ্টি)</option>
                  <option value="PURE_COW_MILK_CHHANA">Pure Cow Milk Chhana (খাঁটি ছানা)</option>
                  <option value="TRADITIONAL_GAWA_GHEE">Traditional Gawa Ghee (খাঁটি গাওয়া ঘি)</option>
                </select>

                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value as any)}
                  className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ALL">All Geographical Regions</option>
                  <option value="BOGURA_SADAR">Bogura (বগুড়া শেরপুর ও সদর)</option>
                  <option value="NATORE_SADAR">Natore (নাটোর লালবাজার)</option>
                  <option value="TANGAIL_PORABARI">Tangail Porabari (টাঙ্গাইল পোড়াবাড়ী)</option>
                  <option value="COMILLA_MANOHARPUR">Comilla Manoharpur (কুমিল্লা মনোহরপুর)</option>
                  <option value="NETROKONA_SADAR">Netrokona Sadar (নেত্রকোণা সদর)</option>
                  <option value="PABNA_SANTHIA">Pabna Santhia (পাবনা সাঁথিয়া)</option>
                  <option value="SIRAJGANJ_BELKUCHI">Sirajganj Belkuchi (সিরাজগঞ্জ বেলকুচি)</option>
                </select>
              </div>

              <div className="text-xs text-stone-500 font-medium">
                Showing {lots.length} certified forward batches
              </div>
            </div>

            {/* Lots Grid */}
            {lotsLoading ? (
              <div className="py-20 text-center text-stone-500">Loading artisanal sweetmeat lots...</div>
            ) : lots.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-stone-200">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-stone-800">No Sweetmeat Lots Found</h3>
                <p className="text-stone-500 text-sm mt-1">Try adjusting the filter criteria or check back after morning curdling.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lots.map((lot) => (
                  <div
                    key={lot.id}
                    className="bg-white rounded-2xl border border-rose-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                          {lot.lotCode}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {lot.isGiTagged && (
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300 flex items-center gap-1">
                              <Award className="w-3 h-3 text-yellow-600" />
                              GI Tag
                            </span>
                          )}
                          {lot.isRefrigeratedColdChain && (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                              <Snowflake className="w-3 h-3 text-blue-600" />
                              Cold Chain
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="font-bold text-lg text-stone-900 mb-1 leading-snug">
                        {lot.lotTitle}
                      </h3>
                      <p className="text-xs text-stone-500 mb-3 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-700" />
                        {lot.moiraProducerName}
                      </p>

                      <div className="space-y-2 py-3 border-y border-stone-100 text-xs text-stone-600">
                        <div className="flex justify-between">
                          <span className="text-stone-500">Delicacy:</span>
                          <span className="font-medium text-stone-800">{formatSweetmeatName(lot.sweetmeatType)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Packaging:</span>
                          <span className="font-medium text-stone-800">{formatPackagingName(lot.packagingType)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Softness / Texture:</span>
                          <span className="font-semibold text-rose-700 flex items-center gap-1">
                            {'★'.repeat(lot.textureSoftnessRating)}{'☆'.repeat(5 - lot.textureSoftnessRating)} ({lot.textureSoftnessRating}/5)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Chemical Verification:</span>
                          <span className="font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Starch Free (Iodine Negative)
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-baseline justify-between">
                        <div>
                          <div className="text-xs text-stone-500">Artisanal Price</div>
                          <div className="text-2xl font-black text-rose-950">
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
                        className="px-4 py-2 bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 text-white rounded-lg font-medium text-xs transition-colors flex items-center gap-1.5 shadow-sm"
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

        {/* Tab 2: Chhana & Curd Yield Simulator */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-rose-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-lg text-stone-900">
                  Chhana & Curd Yield & Whey Balance Calculator
                </h3>
              </div>
              <p className="text-xs text-stone-500 mb-6">
                Calculate expected artisanal chhana and curd yield based on milk fat content, indigenous cow vs. buffalo milk source, and temperature-controlled coagulation.
              </p>

              <form onSubmit={handleRunCalculator} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Sweetmeat Delicacy
                  </label>
                  <select
                    value={calcSweetmeatType}
                    onChange={(e) => setCalcSweetmeatType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="BOGURA_SPECIAL_CURD_DOI">Bogura Shahi Curd (বগুড়ার লাল দই)</option>
                    <option value="NATORE_AUTHENTIC_KACHAGOLLA">Natore Kachagolla (নাটোরের কাঁচাগোল্লা)</option>
                    <option value="PORABARI_CHAMCHAM">Tangail Porabari Chamcham (পোড়াবাড়ীর চমচম)</option>
                    <option value="COMILLA_RASMALAI_MATRI_BHANDAR">Comilla Rasmalai (কুমিল্লার রসমালাই)</option>
                    <option value="PURE_COW_MILK_CHHANA">Pure Cow Milk Chhana (খাঁটি ছানা)</option>
                    <option value="TRADITIONAL_GAWA_GHEE">Traditional Gawa Ghee (খাঁটি গাওয়া ঘি)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Raw Milk Volume (Liters)
                    </label>
                    <input
                      type="number"
                      min="10"
                      step="10"
                      value={calcMilkVolume}
                      onChange={(e) => setCalcMilkVolume(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Milk Source
                    </label>
                    <select
                      value={calcMilkSource}
                      onChange={(e) => {
                        const src = e.target.value as MilkSourceType;
                        setCalcMilkSource(src);
                        if (src === 'RIVERINE_BUFFALO_MILK') setCalcMilkFat(7.5);
                        else setCalcMilkFat(4.8);
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="INDIGENOUS_COW_DESHI">Indigenous Cow (দেশি গাভী - High Carotene)</option>
                      <option value="CROSSBRED_DAIRY_COW">Crossbred Dairy Cow (উন্নত গাভী)</option>
                      <option value="RIVERINE_BUFFALO_MILK">Riverine Buffalo (মহিষের দুধ - High Fat &gt; 7%)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Milk Fat Percentage (%): {calcMilkFat}%
                  </label>
                  <input
                    type="range"
                    min="3.0"
                    max="9.0"
                    step="0.1"
                    value={calcMilkFat}
                    onChange={(e) => setCalcMilkFat(Number(e.target.value))}
                    className="w-full accent-amber-700"
                  />
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>3.5% (Standard)</span>
                    <span>4.8% (Deshi Cow)</span>
                    <span>7.5%+ (Buffalo)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCalculatingYield}
                  className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm mt-4 flex items-center justify-center gap-2"
                >
                  <Scale className="w-4 h-4" />
                  {isCalculatingYield ? 'Simulating...' : 'Compute Production Yield'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-6">
              {calcResult ? (
                <div className="bg-white p-6 rounded-2xl border border-rose-300 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <div>
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                        Production Projection
                      </span>
                      <h4 className="text-xl font-bold text-stone-900">
                        {formatSweetmeatName(calcResult.sweetmeatType)}
                      </h4>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      Ratio: {calcResult.milkToProductRatio} L : 1 kg
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200">
                      <div className="text-xs text-stone-500">Expected Pure Output</div>
                      <div className="text-2xl font-black text-rose-950 mt-1">
                        {calcResult.expectedOutputKg} kg
                      </div>
                      <div className="text-[11px] text-rose-700 mt-0.5">
                        From {calcResult.inputMilkVolumeLiters} L raw milk
                      </div>
                    </div>

                    <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200">
                      <div className="text-xs text-stone-500">Coagulation Temperature</div>
                      <div className="text-2xl font-black text-stone-900 mt-1 flex items-center gap-1">
                        <Thermometer className="w-5 h-5 text-red-600" />
                        {calcResult.recommendedCoagulationTempCelsius}°C
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">Optimal curdling range</div>
                    </div>

                    <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200">
                      <div className="text-xs text-stone-500">Moisture Profile</div>
                      <div className="text-2xl font-black text-stone-900 mt-1">
                        {calcResult.optimalMoisturePct}%
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        Byproduct Whey: {calcResult.byproductWheyLiters} L
                      </div>
                    </div>

                    <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200">
                      <div className="text-xs text-stone-500">Milk Fat Retention</div>
                      <div className="text-2xl font-black text-emerald-800 mt-1">
                        {calcResult.fatRetentionScore}%
                      </div>
                      <div className="text-[11px] text-emerald-700 mt-0.5">Full cream retention</div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 leading-relaxed flex gap-2">
                    <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold">Master Moira Advisory: </strong>
                      {calcResult.processingAdvice}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-stone-300 h-full flex flex-col items-center justify-center">
                  <Gauge className="w-12 h-12 text-stone-300 mb-3" />
                  <h4 className="font-bold text-stone-700">Awaiting Simulation Parameters</h4>
                  <p className="text-stone-400 text-xs max-w-sm mt-1">
                    Select your sweetmeat delicacy, milk volume, and milk fat percentage to project production yields.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Chemical Anti-Adulteration & Starch Verifier */}
        {activeTab === 'purity_tester' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-rose-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-lg text-stone-900">
                  Starch, Vanaspati & Chemical Purity Simulator
                </h3>
              </div>
              <p className="text-xs text-stone-500 mb-6">
                Laboratory verification engine enforcing zero tolerance for potato/maida starch fillers, synthetic milk chemicals (urea/detergent), and hydrogenated vegetable fats (*vanaspati/dalda*) under Bangladesh Food Safety Act 2013.
              </p>

              <form onSubmit={handleRunPuritySimulation} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Milk Fat in Dry Matter (%): {simFatDryMatter}%
                    </label>
                    <input
                      type="range"
                      min="15"
                      max="45"
                      step="0.5"
                      value={simFatDryMatter}
                      onChange={(e) => setSimFatDryMatter(Number(e.target.value))}
                      className="w-full accent-amber-700"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400">
                      <span>&lt;25% (Deficient)</span>
                      <span>&ge;25% (BSTI Pass)</span>
                      <span>30%+ (Rich)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Moisture (%): {simMoisture}%
                    </label>
                    <input
                      type="range"
                      min="40"
                      max="70"
                      step="0.5"
                      value={simMoisture}
                      onChange={(e) => setSimMoisture(Number(e.target.value))}
                      className="w-full accent-amber-700"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400">
                      <span>48% (Firm Chamcham)</span>
                      <span>53% (Soft Curd)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Starch & Flour Adulteration Screening (Iodine Reaction)
                  </label>
                  <select
                    value={simStarchStatus}
                    onChange={(e) => setSimStarchStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  >
                    <option value="NEGATIVE_ZERO_TOLERANCE_PASS">Negative: 100% Starch Free (Pure Milk Solids Pass)</option>
                    <option value="POSITIVE_STARCH_DETECTED_SEIZED">Positive: Starch/Arrowroot Detected (SEIZURE ORDER)</option>
                  </select>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      checked={simUreaDetergent}
                      onChange={(e) => setSimUreaDetergent(e.target.checked)}
                      className="rounded border-stone-300 text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span className="text-red-900 font-bold">Synthetic Milk Chemicals (Urea / Detergent) Detected</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      checked={simVanaspati}
                      onChange={(e) => setSimVanaspati(e.target.checked)}
                      className="rounded border-stone-300 text-amber-700 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>Hydrogenated Fat (Dalda / Vanaspati - Baudouin Test Positive)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      checked={simColoring}
                      onChange={(e) => setSimColoring(e.target.checked)}
                      className="rounded border-stone-300 text-amber-700 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>Synthetic Industrial Dyes (Metanil Yellow / Auramine) Detected</span>
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
                    simResult.isSyntheticMilkChemicalsDetected || simResult.isStarchAdulterated || simResult.isVanaspatiDetected
                      ? 'bg-red-50/70 border-red-300'
                      : 'bg-emerald-50/70 border-emerald-300'
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
                      <div className="text-stone-500">Starch Screen (Iodine)</div>
                      <div
                        className={`font-bold mt-1 ${
                          simResult.isStarchAdulterated ? 'text-red-700' : 'text-emerald-700'
                        }`}
                      >
                        {simResult.isStarchAdulterated ? 'Positive (Adulterated)' : 'Negative (100% Pure)'}
                      </div>
                    </div>

                    <div className="p-3 bg-white/80 rounded-xl border border-stone-200">
                      <div className="text-stone-500">Synthetic Milk Chemicals</div>
                      <div
                        className={`font-bold mt-1 ${
                          simResult.isSyntheticMilkChemicalsDetected ? 'text-red-700' : 'text-emerald-700'
                        }`}
                      >
                        {simResult.isSyntheticMilkChemicalsDetected ? 'Toxic Chemical Found' : 'Clean (Natural Milk)'}
                      </div>
                    </div>

                    <div className="p-3 bg-white/80 rounded-xl border border-stone-200">
                      <div className="text-stone-500">Vanaspati Trans-Fat</div>
                      <div
                        className={`font-bold mt-1 ${
                          simResult.isVanaspatiDetected ? 'text-red-700' : 'text-emerald-700'
                        }`}
                      >
                        {simResult.isVanaspatiDetected ? 'Dalda Detected' : 'Pure Milk Fat'}
                      </div>
                    </div>

                    <div className="p-3 bg-white/80 rounded-xl border border-stone-200">
                      <div className="text-stone-500">BSTI Compliance</div>
                      <div
                        className={`font-bold mt-1 ${
                          simResult.bstiComplianceApproved ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {simResult.bstiComplianceApproved ? 'Approved (BDS 527/961)' : 'Rejected'}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-xl border text-xs leading-relaxed flex gap-2.5 ${
                      simResult.bstiComplianceApproved
                        ? 'bg-white text-stone-800 border-stone-200'
                        : 'bg-red-100 text-red-950 border-red-300'
                    }`}
                  >
                    <AlertTriangle
                      className={`w-5 h-5 shrink-0 mt-0.5 ${
                        simResult.bstiComplianceApproved ? 'text-amber-600' : 'text-red-700'
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
                    Select adulteration indicators on the left and run the verification to test against BSTI BDS 527 and BFSA standards.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Live Moira Curdling Telemetry */}
        {activeTab === 'moira_telemetry' && (
          <div className="bg-white rounded-2xl border border-rose-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg text-stone-900">
                  Live Moira Guild Curdling & Incubation Telemetry
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Real-time morning milk intake, whey draining, and earthen sra incubation across Bogura, Natore, Tangail, and Comilla.
                </p>
              </div>
              <Link
                href="/seller/artisanal-sweetmeats"
                className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Droplets className="w-4 h-4" />
                Open Moira Logger
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3">Batch Code</th>
                    <th className="px-5 py-3">Guild / Moira</th>
                    <th className="px-5 py-3">Delicacy</th>
                    <th className="px-5 py-3">Milk Source</th>
                    <th className="px-5 py-3">Milk (L)</th>
                    <th className="px-5 py-3">Fat %</th>
                    <th className="px-5 py-3">Curdle Temp</th>
                    <th className="px-5 py-3">Chhana Output (Kg)</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-rose-950">
                        {batch.batchNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-stone-900">{batch.moiraGuildName}</div>
                        <div className="text-[11px] text-stone-400">{batch.contactPhone}</div>
                      </td>
                      <td className="px-5 py-3.5 font-medium">{formatSweetmeatName(batch.sweetmeatType)}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900">
                          {batch.milkSource.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold">{batch.inputMilkVolumeLiters} L</td>
                      <td className="px-5 py-3.5">{batch.milkFatPct}% Fat</td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-red-700 flex items-center gap-1">
                          <Thermometer className="w-3.5 h-3.5" />
                          {batch.coagulationTempCelsius}°C
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-stone-900">
                        {batch.producedChhanaKg} kg
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-rose-100 text-rose-900">
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-rose-300 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedLotForBuy(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="w-5 h-5 text-amber-700" />
              <h3 className="font-bold text-lg text-stone-900">Procure Artisanal Sweetmeat Lot</h3>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Direct allocation from certified moira guilds. Includes digital GI seal authentication and insulated cold-chain logistics.
            </p>

            <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200 mb-4 text-xs space-y-1">
              <div className="font-bold text-rose-950 text-sm">{selectedLotForBuy.lotTitle}</div>
              <div className="text-stone-600">Lot Code: {selectedLotForBuy.lotCode}</div>
              <div className="text-stone-600">Guild: {selectedLotForBuy.moiraProducerName}</div>
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
                  Order Quantity (kg) - Min {selectedLotForBuy.minimumOrderKg} kg
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
                  placeholder="e.g. Traditional Sweets Lounge or Customer Name"
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
                  Delivery Address (Refrigerated Logistics)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Uttara Sector 4, Dhaka"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-stone-200">
                <div className="text-xs text-stone-500">
                  Total Payable:{' '}
                  <span className="font-bold text-rose-950 text-sm">
                    ৳{orderQuantityKg * selectedLotForBuy.pricePerKgBdt}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isPurchasing}
                  className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {isPurchasing ? 'Processing Order...' : 'Confirm Order & Lock Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
