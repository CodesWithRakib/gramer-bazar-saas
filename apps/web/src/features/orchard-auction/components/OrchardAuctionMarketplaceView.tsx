'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Trees,
  Apple,
  Sparkles,
  ShieldCheck,
  Thermometer,
  Clock,
  Truck,
  Scale,
  Coins,
  AlertTriangle,
  CheckCircle2,
  Award,
  MapPin,
  Calendar,
  Filter,
  ArrowUpRight,
  Activity,
  Layers,
} from 'lucide-react';
import {
  useGetOrchardAuctionLotsQuery,
  useGetPhytosanitaryHwtBatchesQuery,
  useGetOrchardDispatchesQuery,
  useCalculateOrchardValuationMutation,
  useEvaluateHwtQuarantineMutation,
  usePlaceOrchardBidMutation,
  FruitType,
  OrchardRegion,
  FruitCultivar,
  FruitBaggingStatus,
  OrchardTreeAuctionLot,
  OrchardValuationResult,
  HwtEvaluationResult,
} from '../orchardAuctionApi';

export const OrchardAuctionMarketplaceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'auctions' | 'calculator' | 'hwt_simulator' | 'cold_chain'
  >('auctions');

  const [selectedFruitType, setSelectedFruitType] = useState<FruitType | 'ALL'>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<OrchardRegion | 'ALL'>('ALL');

  // Queries
  const { data: lots = [], isLoading: lotsLoading } = useGetOrchardAuctionLotsQuery(
    selectedRegion !== 'ALL' || selectedFruitType !== 'ALL'
      ? {
          region: selectedRegion !== 'ALL' ? selectedRegion : undefined,
          fruitType: selectedFruitType !== 'ALL' ? selectedFruitType : undefined,
        }
      : undefined,
  );

  const { data: hwtBatches = [], isLoading: hwtLoading } =
    useGetPhytosanitaryHwtBatchesQuery();
  const { data: dispatches = [], isLoading: dispLoading } =
    useGetOrchardDispatchesQuery();

  // Bidding Modal State
  const [selectedLotForBid, setSelectedLotForBid] =
    useState<OrchardTreeAuctionLot | null>(null);
  const [bidderName, setBidderName] = useState('');
  const [bidderPhone, setBidderPhone] = useState('');
  const [bidAmountBdt, setBidAmountBdt] = useState<number>(0);
  const [bidSuccessMessage, setBidSuccessMessage] = useState('');
  const [bidErrorMessage, setBidErrorMessage] = useState('');

  const [placeBidMutation, { isLoading: isBidding }] = usePlaceOrchardBidMutation();

  // Valuation Calculator State
  const [calcFruitType, setCalcFruitType] = useState<FruitType>('MANGO');
  const [calcCultivar, setCalcCultivar] =
    useState<FruitCultivar>('KHIRSAPAT_HIMSAGAR');
  const [calcTreeCount, setCalcTreeCount] = useState<number>(100);
  const [calcAvgYieldPerTree, setCalcAvgYieldPerTree] = useState<number>(120);
  const [calcFruitSetPct, setCalcFruitSetPct] = useState<number>(85);
  const [calcBaggingStatus, setCalcBaggingStatus] =
    useState<FruitBaggingStatus>('BAG_PROTECTED');
  const [calcIsGi, setCalcIsGi] = useState<boolean>(true);
  const [calcResult, setCalcResult] = useState<OrchardValuationResult | null>(null);

  const [calculateValuation, { isLoading: isCalculatingValuation }] =
    useCalculateOrchardValuationMutation();

  // HWT Simulator State
  const [simFruitType, setSimFruitType] = useState<FruitType>('MANGO');
  const [simWaterTemp, setSimWaterTemp] = useState<number>(48.0);
  const [simDuration, setSimDuration] = useState<number>(60);
  const [simCoreTemp, setSimCoreTemp] = useState<number>(46.8);
  const [simMrl, setSimMrl] = useState<number>(0.02);
  const [simTransitTemp, setSimTransitTemp] = useState<number>(11.0);
  const [simTransitHumidity, setSimTransitHumidity] = useState<number>(88.0);
  const [hwtResult, setHwtResult] = useState<HwtEvaluationResult | null>(null);

  const [evaluateHwt, { isLoading: isEvaluatingHwt }] =
    useEvaluateHwtQuarantineMutation();

  const handleOpenBidModal = (lot: OrchardTreeAuctionLot) => {
    setSelectedLotForBid(lot);
    setBidAmountBdt(lot.currentHighestBidBdt + 10000);
    setBidSuccessMessage('');
    setBidErrorMessage('');
  };

  const handleConfirmBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLotForBid) return;
    try {
      setBidErrorMessage('');
      await placeBidMutation({
        id: selectedLotForBid.id,
        body: {
          bidderName,
          bidderPhone,
          bidAmountBdt,
        },
      }).unwrap();
      setBidSuccessMessage(
        `Successfully placed bid of ৳${bidAmountBdt.toLocaleString()} for Lot ${selectedLotForBid.lotNumber}!`,
      );
      setTimeout(() => {
        setSelectedLotForBid(null);
        setBidSuccessMessage('');
      }, 2000);
    } catch (err: any) {
      setBidErrorMessage(
        err?.data?.message || 'Failed to place bid. Please ensure the amount meets the minimum increment.',
      );
    }
  };

  const handleRunValuation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await calculateValuation({
        fruitType: calcFruitType,
        cultivar: calcCultivar,
        treeCount: Number(calcTreeCount),
        averageYieldKgPerTree: Number(calcAvgYieldPerTree),
        floweringFruitSetPct: Number(calcFruitSetPct),
        fruitBaggingStatus: calcBaggingStatus,
        isGiCertified: calcIsGi,
      }).unwrap();
      setCalcResult(res);
    } catch (err) {
      console.error('Valuation calculation failed', err);
    }
  };

  const handleRunHwtEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await evaluateHwt({
        fruitType: simFruitType,
        waterTempCelsius: Number(simWaterTemp),
        immersionDurationMinutes: Number(simDuration),
        fruitCoreTempCelsius: Number(simCoreTemp),
        chemicalMrlPpm: Number(simMrl),
        transitTempCelsius: Number(simTransitTemp),
        transitHumidityPct: Number(simTransitHumidity),
      }).unwrap();
      setHwtResult(res);
    } catch (err) {
      console.error('HWT evaluation failed', err);
    }
  };

  const formatCultivarName = (cultivar: string) => {
    return cultivar.replace(/_/g, ' ');
  };

  const formatRegionName = (region: string) => {
    return region.replace(/_/g, ' ');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-amber-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold mb-3">
                <Trees className="w-3.5 h-3.5 text-emerald-300" />
                Bangladeshi GI Mango & Litchi Orchard Forward Auction Engine
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                আম ও লিচু বাগান প্রি-হার্ভেস্ট নিলাম ও জিআই ট্রেসেবিলিটি
              </h1>
              <p className="mt-2 text-base sm:text-lg text-emerald-100/90 max-w-3xl">
                Pre-harvest tree forward contract auctions, Hot Water Treatment (HWT: 48°C / 60 min) fruit fly phytosanitary clearance, and refrigerated reefer cold-chain logistics across Chapainawabganj, Rajshahi, Dinajpur, and Rangpur.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/seller/orchard-auction"
                className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition shadow-sm inline-flex items-center gap-2"
              >
                <Trees className="w-4 h-4" />
                Grower Orchard Hub
              </Link>
              <Link
                href="/admin/orchard-auction"
                className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition border border-white/20 inline-flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                DAE Quarantine Desk
              </Link>
            </div>
          </div>

          {/* Quick Metrics KPI Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold">
                <Trees className="w-4 h-4 text-emerald-300" /> Active Orchard Lots
              </div>
              <div className="text-2xl font-black text-white mt-1">
                {lots.length} <span className="text-xs font-normal text-emerald-200">blocks</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold">
                <Layers className="w-4 h-4 text-amber-300" /> Bag-Protected Fruits
              </div>
              <div className="text-2xl font-black text-amber-200 mt-1">
                110,000+ <span className="text-xs font-normal text-emerald-200">bagged</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold">
                <Thermometer className="w-4 h-4 text-teal-300" /> HWT Quarantine Passes
              </div>
              <div className="text-2xl font-black text-teal-200 mt-1">
                {hwtBatches.filter((b) => b.quarantinePassIssued).length} <span className="text-xs font-normal text-emerald-200">certified</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold">
                <Truck className="w-4 h-4 text-sky-300" /> Cold-Chain Reefer Vans
              </div>
              <div className="text-2xl font-black text-sky-200 mt-1">
                {dispatches.length} <span className="text-xs font-normal text-emerald-200">in transit</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('auctions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'auctions'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Trees className="w-4 h-4" />
            Pre-Harvest Tree Auctions (গাছ চুক্তি নিলাম)
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'calculator'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            Yield & Escrow Calculator (ফলন ও অগ্রিম হিসাব)
          </button>
          <button
            onClick={() => setActiveTab('hwt_simulator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'hwt_simulator'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Thermometer className="w-4 h-4" />
            DAE Hot Water Treatment (HWT কোয়ারেন্টাইন সিমুলেটর)
          </button>
          <button
            onClick={() => setActiveTab('cold_chain')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'cold_chain'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            Reefer Cold-Chain Dispatches (শীতলীকরণ পরিবহন)
          </button>
        </div>

        {/* Tab 1: Auctions */}
        {activeTab === 'auctions' && (
          <div className="mt-6 space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" /> Filters:
                </span>
                <select
                  value={selectedFruitType}
                  onChange={(e) => setSelectedFruitType(e.target.value as any)}
                  className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-emerald-500"
                >
                  <option value="ALL">All Fruits (আম ও লিচু)</option>
                  <option value="MANGO">Mango (আম)</option>
                  <option value="LITCHI">Litchi (লিচু)</option>
                </select>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value as any)}
                  className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-emerald-500"
                >
                  <option value="ALL">All Regions (সব জেলা)</option>
                  <option value="CHAPAINAWABGANJ_SHIBGANJ">Chapainawabganj (Shibganj)</option>
                  <option value="RAJSHAHI_BAGHA_CHARGHAT">Rajshahi (Bagha/Charghat)</option>
                  <option value="DINAJPUR_BIROL_SADAR">Dinajpur (Birol/Sadar)</option>
                  <option value="RANGPUR_MITHAPUKUR">Rangpur (Mithapukur)</option>
                  <option value="MEHERPUR_MUJIBNAGAR">Meherpur (Mujibnagar)</option>
                  <option value="CHUADANGA_DAMURHUDA">Chuadanga (Damurhuda)</option>
                  <option value="PABNA_ISHWARDI">Pabna (Ishwardi)</option>
                </select>
              </div>
              <div className="text-xs text-slate-500">
                Showing <strong className="text-slate-800">{lots.length}</strong> active orchard lots
              </div>
            </div>

            {/* Lots Grid */}
            {lotsLoading ? (
              <div className="text-center py-12 text-slate-500 text-sm">Loading active orchard tree auctions...</div>
            ) : lots.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                No orchard auction lots found for selected criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lots.map((lot) => (
                  <div
                    key={lot.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {lot.lotNumber}
                            </span>
                            {lot.isGiCertified && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                <Award className="w-3 h-3 text-amber-600" />
                                GI Authenticated
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mt-2">
                            {lot.orchardName}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {formatRegionName(lot.region)} • {lot.mouzaPlotNumber || 'Mouza Plot'}
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            lot.status === 'AUCTION_OPEN'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : lot.status === 'BID_ACCEPTED'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {lot.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Cultivar & Bagging Badges */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200">
                          {formatCultivarName(lot.cultivar)} ({lot.fruitType})
                        </span>
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${
                            lot.fruitBaggingStatus === 'BAG_PROTECTED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {lot.fruitBaggingStatus === 'BAG_PROTECTED'
                            ? 'Double-Layer Paper Bagged'
                            : 'Conventional Unbagged'}
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200">
                          {lot.totalTrees} trees ({lot.treeAgeYears} yrs old)
                        </span>
                      </div>

                      {/* Key Metrics Grid */}
                      <div className="grid grid-cols-3 gap-3 bg-slate-50 rounded-xl p-3 mt-4 border border-slate-100 text-center">
                        <div>
                          <div className="text-[11px] text-slate-500">Est. Yield</div>
                          <div className="text-sm font-bold text-slate-800 mt-0.5">
                            {lot.estimatedYieldKg.toLocaleString()} kg
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-500">Fruit-Set</div>
                          <div className="text-sm font-bold text-emerald-700 mt-0.5">
                            {lot.floweringFruitSetPct}%
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-500">Bagged Count</div>
                          <div className="text-sm font-bold text-slate-800 mt-0.5">
                            {lot.baggedFruitsCount?.toLocaleString() || '0'}
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Highest Bid */}
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-500 block">Current Highest Bid</span>
                          <span className="text-xl font-extrabold text-emerald-700">
                            ৳{lot.currentHighestBidBdt.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            Base Reserve: ৳{lot.baseReservePriceBdt.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-500 block">30% Escrow Advance</span>
                          <span className="text-sm font-bold text-slate-700">
                            ৳{Math.round(lot.currentHighestBidBdt * 0.3).toLocaleString()}
                          </span>
                          <span className="text-[11px] text-emerald-600 block">
                            {lot.bids.length} bid(s) placed
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Harvest: {new Date(lot.expectedHarvestStartDate).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => handleOpenBidModal(lot)}
                        disabled={lot.status !== 'AUCTION_OPEN'}
                        className={`text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
                          lot.status === 'AUCTION_OPEN'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Coins className="w-3.5 h-3.5" />
                        Place Forward Bid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Valuation Calculator */}
        {activeTab === 'calculator' && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Orchard Pre-Harvest Yield & Escrow Calculator
                  </h2>
                  <p className="text-xs text-slate-500">
                    Calculates tree canopy yield, fruit bagging protection multipliers, GI brand premiums, and milestone escrow tranches.
                  </p>
                </div>
              </div>

              <form onSubmit={handleRunValuation} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fruit Type (ফল)
                    </label>
                    <select
                      value={calcFruitType}
                      onChange={(e) => {
                        const ft = e.target.value as FruitType;
                        setCalcFruitType(ft);
                        if (ft === 'LITCHI') {
                          setCalcCultivar('DINAJPUR_BEDANA_LITCHI');
                        } else {
                          setCalcCultivar('KHIRSAPAT_HIMSAGAR');
                        }
                      }}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
                    >
                      <option value="MANGO">Mango (আম)</option>
                      <option value="LITCHI">Litchi (লিচু)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cultivar / Variety (জাত)
                    </label>
                    <select
                      value={calcCultivar}
                      onChange={(e) => setCalcCultivar(e.target.value as FruitCultivar)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
                    >
                      {calcFruitType === 'MANGO' ? (
                        <>
                          <option value="KHIRSAPAT_HIMSAGAR">Khirsapat / Himsagar (ক্ষীরশাপাত/হিমসাগর)</option>
                          <option value="LANGRA">Langra (ল্যাংড়া)</option>
                          <option value="AMRAPALI">Amrapali (আম্রপালি)</option>
                          <option value="FAZLI">Fazli (ফজলি)</option>
                          <option value="HARIBHANGA">Haribhanga (হাড়িভাঙা)</option>
                          <option value="GOURMATI">Gourmati (গৌড়মতি - Ultra Late)</option>
                          <option value="ASHWINA">Ashwina (আশ্বিনা)</option>
                        </>
                      ) : (
                        <>
                          <option value="DINAJPUR_BEDANA_LITCHI">Dinajpur Bedana (দিনাজপুর বেদানা লিচু)</option>
                          <option value="CHINA_3_LITCHI">China-3 (চায়না-৩)</option>
                          <option value="BOMBAY_LITCHI">Bombay (বোম্বাই লিচু)</option>
                          <option value="MADRAJI_LITCHI">Madraji (মাদ্রাজি)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Total Trees in Block (গাছের সংখ্যা)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={calcTreeCount}
                      onChange={(e) => setCalcTreeCount(Number(e.target.value))}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Avg. Yield per Tree (কেজি/গাছ)
                    </label>
                    <input
                      type="number"
                      min="5"
                      value={calcAvgYieldPerTree}
                      onChange={(e) => setCalcAvgYieldPerTree(Number(e.target.value))}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Blossom Fruit-Set % (গুটি বাঁধার হার)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={calcFruitSetPct}
                      onChange={(e) => setCalcFruitSetPct(Number(e.target.value))}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fruit Bagging Method (ফ্রুট ব্যাগিং)
                    </label>
                    <select
                      value={calcBaggingStatus}
                      onChange={(e) => setCalcBaggingStatus(e.target.value as FruitBaggingStatus)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
                    >
                      <option value="BAG_PROTECTED">Double-Layer Paper Bagged (+15% Packout)</option>
                      <option value="PARTIALLY_BAGGED">Partially Bagged (+5%)</option>
                      <option value="CONVENTIONAL_UNBAGGED">Conventional Unbagged (0%)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="giCheck"
                    checked={calcIsGi}
                    onChange={(e) => setCalcIsGi(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="giCheck" className="text-xs font-semibold text-slate-700">
                    Geographical Indication (GI) Authenticated (+20% Price Premium)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isCalculatingValuation}
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 rounded-lg transition shadow-sm flex items-center justify-center gap-2"
                >
                  <Scale className="w-4 h-4" />
                  {isCalculatingValuation ? 'Calculating...' : 'Calculate Yield & Escrow Schedule'}
                </button>
              </form>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  Valuation Breakdown & Escrow Milestones
                </h3>

                {calcResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100">
                        <span className="text-[11px] text-emerald-700 font-medium">Effective Packout Yield</span>
                        <div className="text-2xl font-black text-emerald-900 mt-1">
                          {calcResult.effectiveYieldKg.toLocaleString()} <span className="text-xs font-normal">kg</span>
                        </div>
                        <span className="text-[10px] text-emerald-600">
                          Fruit-set: {calcResult.fruitSetFactor}x • Bagging: +{calcResult.baggingProtectionBonusPct}%
                        </span>
                      </div>
                      <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-100">
                        <span className="text-[11px] text-amber-700 font-medium">Recommended Reserve Price</span>
                        <div className="text-2xl font-black text-amber-900 mt-1">
                          ৳{calcResult.recommendedReservePriceBdt.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-amber-600">
                          ৳{calcResult.effectivePricePerKg}/kg (GI Premium: +{calcResult.giPremiumBonusPct}%)
                        </span>
                      </div>
                    </div>

                    {/* Escrow Tranches Schedule */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        Forward Escrow Disbursement Tranches (৩ কিস্তি অর্থ ছাড়)
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
                          <div>
                            <strong className="text-slate-800">Tranche 1: Signing & Blossom Care (30%)</strong>
                            <div className="text-[11px] text-slate-500">Upfront working capital for irrigation & bagging</div>
                          </div>
                          <span className="font-extrabold text-emerald-700">
                            ৳{calcResult.escrowPaymentSchedule.tranche1SigningBdt.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
                          <div>
                            <strong className="text-slate-800">Tranche 2: Bagging & Canopy Milestone (40%)</strong>
                            <div className="text-[11px] text-slate-500">Disbursed upon fruit bagging inspection verification</div>
                          </div>
                          <span className="font-extrabold text-emerald-700">
                            ৳{calcResult.escrowPaymentSchedule.tranche2BaggingBdt.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
                          <div>
                            <strong className="text-slate-800">Tranche 3: Harvest Weighbridge Clearance (30%)</strong>
                            <div className="text-[11px] text-slate-500">Final settlement upon weighbridge intake completion</div>
                          </div>
                          <span className="font-extrabold text-emerald-700">
                            ৳{calcResult.escrowPaymentSchedule.tranche3HarvestBdt.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Export Phytosanitary Compliance:</strong> {calcResult.exportReadinessNote}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                    Configure orchard parameters on the left and click "Calculate Yield & Escrow Schedule" to see instant valuation tranches.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: HWT Simulator */}
        {activeTab === 'hwt_simulator' && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-teal-100 rounded-lg text-teal-700">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    DAE Hot Water Treatment (HWT) & MRL Compliance Simulator
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tests water bath temperature (48°C), 60-min immersion duration, core pulp temperature, and chemical MRL ppm for export certification.
                  </p>
                </div>
              </div>

              <form onSubmit={handleRunHwtEvaluation} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fruit Type
                    </label>
                    <select
                      value={simFruitType}
                      onChange={(e) => setSimFruitType(e.target.value as FruitType)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
                    >
                      <option value="MANGO">Mango (আম - 48°C immersion)</option>
                      <option value="LITCHI">Litchi (লিচু - Pericarp check)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Water Bath Temp (°C) [Std: 48.0°C]
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={simWaterTemp}
                      onChange={(e) => setSimWaterTemp(Number(e.target.value))}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Immersion Duration (Minutes) [Std: 60 min]
                    </label>
                    <input
                      type="number"
                      value={simDuration}
                      onChange={(e) => setSimDuration(Number(e.target.value))}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fruit Core Pulp Temp (°C) [Std: 46.5°C - 47.0°C]
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={simCoreTemp}
                      onChange={(e) => setSimCoreTemp(Number(e.target.value))}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pesticide MRL (ppm) [Max 0.05]
                    </label>
                    <input
                      type="number"
                      step="0.005"
                      value={simMrl}
                      onChange={(e) => setSimMrl(Number(e.target.value))}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Transit Temp (°C)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={simTransitTemp}
                      onChange={(e) => setSimTransitTemp(Number(e.target.value))}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Transit RH (%)
                    </label>
                    <input
                      type="number"
                      value={simTransitHumidity}
                      onChange={(e) => setSimTransitHumidity(Number(e.target.value))}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isEvaluatingHwt}
                  className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-3 rounded-lg transition shadow-sm flex items-center justify-center gap-2"
                >
                  <Thermometer className="w-4 h-4" />
                  {isEvaluatingHwt ? 'Simulating...' : 'Run Phytosanitary Quarantine Audit'}
                </button>
              </form>
            </div>

            {/* HWT Results */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  Phytosanitary Quarantine Clearance Status
                </h3>

                {hwtResult ? (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-xl border flex items-start gap-3 ${
                        hwtResult.exportApproved
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}
                    >
                      {hwtResult.exportApproved ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-sm font-bold">
                          {hwtResult.exportApproved
                            ? 'PASSED: DAE Phytosanitary Quarantine Pass Approved'
                            : 'REJECTED: Phytosanitary Parameter Non-Compliant'}
                        </div>
                        <div className="text-xs mt-1 leading-relaxed">{hwtResult.hwtNotes}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block">HWT Verdict</span>
                        <strong className="text-slate-800">{hwtResult.hwtVerdict}</strong>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block">Chemical MRL Status</span>
                        <strong
                          className={hwtResult.isMrlSafe ? 'text-emerald-700' : 'text-rose-700'}
                        >
                          {hwtResult.mrlVerdict} ({hwtResult.chemicalMrlPpm} ppm vs max {hwtResult.mrlThresholdPpm} ppm)
                        </strong>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                      <span className="text-slate-500 block font-semibold">Cold Chain Status</span>
                      <div className="font-bold text-slate-800 mt-0.5">{hwtResult.coldChainStatus}</div>
                      <div className="text-slate-600 text-[11px] mt-1">{hwtResult.coldChainNotes}</div>
                    </div>

                    <div className="bg-teal-50 p-3.5 rounded-xl border border-teal-200 text-xs text-teal-900">
                      <strong>Inspector Recommendation:</strong> {hwtResult.recommendation}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                    Run the simulation to inspect water bath temperature, immersion duration, and MRL residue limits against EPPO/DAE export protocols.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Cold Chain Reefer Dispatches */}
        {activeTab === 'cold_chain' && (
          <div className="mt-6 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-sky-100 rounded-lg text-sky-700">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Refrigerated Reefer Fleet & Cold-Chain Transit Telemetry
                    </h2>
                    <p className="text-xs text-slate-500">
                      Real-time temperature and humidity tracking for mango (10°C - 12°C) and litchi (2°C - 4°C) dispatches.
                    </p>
                  </div>
                </div>
              </div>

              {dispLoading ? (
                <div className="text-center py-12 text-slate-500 text-sm">Loading reefer telemetry...</div>
              ) : dispatches.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">No active reefer dispatches found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dispatches.map((disp) => (
                    <div
                      key={disp.id}
                      className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            {disp.dispatchCode}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              disp.coldChainStatus === 'OPTIMAL_CHILLED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {disp.coldChainStatus.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="mt-3">
                          <h4 className="text-base font-bold text-slate-900">
                            {formatCultivarName(disp.cultivar)} ({disp.fruitType})
                          </h4>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                            Van Plate: <strong>{disp.reeferVanPlateNumber}</strong>
                          </div>
                        </div>

                        {/* Telemetry Dials */}
                        <div className="grid grid-cols-3 gap-2 mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                          <div>
                            <span className="text-[11px] text-slate-500 block">Transit Temp</span>
                            <strong className="text-sm font-extrabold text-sky-900">
                              {disp.currentTransitTempCelsius}°C
                            </strong>
                            <span className="text-[10px] text-slate-400 block">
                              Set: {disp.reeferSetpointCelsius}°C
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Humidity</span>
                            <strong className="text-sm font-extrabold text-sky-900">
                              {disp.currentTransitHumidityPct}% RH
                            </strong>
                            <span className="text-[10px] text-slate-400 block">Moisture Guard</span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Brix Index</span>
                            <strong className="text-sm font-extrabold text-amber-700">
                              {disp.brixSugarDegree}° Brix
                            </strong>
                            <span className="text-[10px] text-slate-400 block">
                              {disp.gradingQuality.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-slate-600 space-y-1">
                          <div>
                            <span className="text-slate-400">Origin:</span> {disp.originHub}
                          </div>
                          <div>
                            <span className="text-slate-400">Destination:</span> {disp.destinationMarket}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          Weight: <strong>{disp.dispatchWeightKg} kg</strong> ({disp.cratesCount} crates)
                        </span>
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {disp.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Place Bid Modal */}
      {selectedLotForBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              Place Forward Bid (প্রি-হার্ভেস্ট অগ্রিম নিলাম)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Lot: <strong className="text-slate-700">{selectedLotForBid.lotNumber}</strong> • {selectedLotForBid.orchardName}
            </p>

            {bidSuccessMessage ? (
              <div className="my-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center">
                {bidSuccessMessage}
              </div>
            ) : (
              <form onSubmit={handleConfirmBid} className="space-y-4 mt-4">
                {bidErrorMessage && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {bidErrorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Broker / Exporter Name (বিডার নাম)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengal Fresh Fruits Exporters Ltd."
                    value={bidderName}
                    onChange={(e) => setBidderName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone Number (মোবাইল নম্বর)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+8801XXXXXXXXX"
                    value={bidderPhone}
                    onChange={(e) => setBidderPhone(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bid Amount (৳ টাকা) [Minimum Next Bid: ৳
                    {(selectedLotForBid.currentHighestBidBdt + 5000).toLocaleString()}]
                  </label>
                  <input
                    type="number"
                    min={selectedLotForBid.currentHighestBidBdt + 5000}
                    step="5000"
                    required
                    value={bidAmountBdt}
                    onChange={(e) => setBidAmountBdt(Number(e.target.value))}
                    className="w-full text-sm font-bold border border-slate-300 rounded-lg p-2.5 bg-white text-emerald-800"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>30% Advance Escrow Commitment:</span>
                    <strong className="text-emerald-700">
                      ৳{Math.round(bidAmountBdt * 0.3).toLocaleString()}
                    </strong>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Funds will be locked in escrow and disbursed to grower Haji Shamsul Alam upon signing and blossom verification.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLotForBid(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isBidding}
                    className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-sm"
                  >
                    {isBidding ? 'Placing Bid...' : 'Confirm & Place Bid'}
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
