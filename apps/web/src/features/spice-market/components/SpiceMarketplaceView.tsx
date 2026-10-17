'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Sparkles,
  ShieldCheck,
  Scale,
  Sun,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Award,
  ShoppingBag,
  Filter,
  Calendar,
  MapPin,
  Activity,
  FileText,
  Layers,
} from 'lucide-react';
import {
  useGetSpiceForwardLotsQuery,
  useGetSpiceDryingBatchesQuery,
  useGetSpiceLabTestsQuery,
  useCalculateSpiceDehydrationMutation,
  useEvaluateSpicePurityMutation,
  usePurchaseSpiceLotMutation,
  SpiceType,
  SpiceRegion,
  DryingMethod,
  AdulterationTestStatus,
  SpiceForwardLot,
  SpiceDehydrationResult,
  SpicePurityEvaluationResult,
} from '../spiceMarketApi';

export const SpiceMarketplaceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'catalog' | 'calculator' | 'purity_tester' | 'solar_tunnels'
  >('catalog');

  const [selectedSpiceType, setSelectedSpiceType] = useState<SpiceType | 'ALL'>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<SpiceRegion | 'ALL'>('ALL');

  // Queries
  const { data: lots = [], isLoading: lotsLoading } = useGetSpiceForwardLotsQuery(
    selectedSpiceType !== 'ALL' || selectedRegion !== 'ALL'
      ? {
          spiceType: selectedSpiceType !== 'ALL' ? selectedSpiceType : undefined,
          region: selectedRegion !== 'ALL' ? selectedRegion : undefined,
        }
      : undefined,
  );

  const { data: batches = [], isLoading: batchesLoading } =
    useGetSpiceDryingBatchesQuery();
  const { data: labTests = [], isLoading: testsLoading } =
    useGetSpiceLabTestsQuery();

  // Purchase Modal State
  const [selectedLotForBuy, setSelectedLotForBuy] = useState<SpiceForwardLot | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [orderQuantityKg, setOrderQuantityKg] = useState<number>(50);
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState('');
  const [purchaseErrorMessage, setPurchaseErrorMessage] = useState('');

  const [purchaseLotMutation, { isLoading: isPurchasing }] = usePurchaseSpiceLotMutation();

  // Dehydration Calculator State
  const [calcSpiceType, setCalcSpiceType] = useState<SpiceType>('CHILLI');
  const [calcFreshWeight, setCalcFreshWeight] = useState<number>(2000);
  const [calcInitialMoisture, setCalcInitialMoisture] = useState<number>(80);
  const [calcTargetMoisture, setCalcTargetMoisture] = useState<number>(10);
  const [calcDryingMethod, setCalcDryingMethod] =
    useState<DryingMethod>('SOLAR_PARABOLIC_TUNNEL');
  const [calcResult, setCalcResult] = useState<SpiceDehydrationResult | null>(null);

  const [calculateDehydration, { isLoading: isCalculatingDehydration }] =
    useCalculateSpiceDehydrationMutation();

  // Purity Tester State
  const [simSpiceType, setSimSpiceType] = useState<SpiceType>('CHILLI');
  const [simSudan, setSimSudan] =
    useState<AdulterationTestStatus>('NEGATIVE_NOT_DETECTED');
  const [simLeadChromate, setSimLeadChromate] =
    useState<AdulterationTestStatus>('NEGATIVE_NOT_DETECTED');
  const [simMetanilYellow, setSimMetanilYellow] =
    useState<AdulterationTestStatus>('NEGATIVE_NOT_DETECTED');
  const [simMoisture, setSimMoisture] = useState<number>(9.0);
  const [simAflatoxin, setSimAflatoxin] = useState<number>(2.0);
  const [simCurcumin, setSimCurcumin] = useState<number>(5.2);
  const [simScoville, setSimScoville] = useState<number>(48000);
  const [purityResult, setPurityResult] = useState<SpicePurityEvaluationResult | null>(null);

  const [evaluatePurity, { isLoading: isEvaluatingPurity }] =
    useEvaluateSpicePurityMutation();

  const handleOpenBuyModal = (lot: SpiceForwardLot) => {
    setSelectedLotForBuy(lot);
    setOrderQuantityKg(lot.minimumOrderKg);
    setPurchaseSuccessMessage('');
    setPurchaseErrorMessage('');
  };

  const handleConfirmPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLotForBuy) return;
    try {
      setPurchaseErrorMessage('');
      await purchaseLotMutation({
        id: selectedLotForBuy.id,
        body: {
          buyerName,
          buyerPhone,
          orderQuantityKg: Number(orderQuantityKg),
        },
      }).unwrap();
      setPurchaseSuccessMessage(
        `Successfully booked ${orderQuantityKg} kg of ${selectedLotForBuy.lotTitle}! Invoice generated.`,
      );
      setTimeout(() => {
        setSelectedLotForBuy(null);
        setPurchaseSuccessMessage('');
      }, 2000);
    } catch (err: any) {
      setPurchaseErrorMessage(
        err?.data?.message || 'Failed to complete order. Please verify minimum quantity.',
      );
    }
  };

  const handleRunDehydrationCalc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await calculateDehydration({
        spiceType: calcSpiceType,
        freshWeightKg: Number(calcFreshWeight),
        initialMoisturePct: Number(calcInitialMoisture),
        targetMoisturePct: Number(calcTargetMoisture),
        dryingMethod: calcDryingMethod,
      }).unwrap();
      setCalcResult(res);
    } catch (err) {
      console.error('Calculation failed', err);
    }
  };

  const handleRunPurityAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await evaluatePurity({
        spiceType: simSpiceType,
        sudanDyeStatus: simSudan,
        leadChromateStatus: simLeadChromate,
        metanilYellowStatus: simMetanilYellow,
        moisturePct: Number(simMoisture),
        aflatoxinB1Ppb: Number(simAflatoxin),
        curcuminPct: simSpiceType === 'TURMERIC' ? Number(simCurcumin) : undefined,
        scovilleHeatUnits: simSpiceType === 'CHILLI' ? Number(simScoville) : undefined,
      }).unwrap();
      setPurityResult(res);
    } catch (err) {
      console.error('Purity evaluation failed', err);
    }
  };

  const formatSpiceName = (spice: string) => {
    return spice.replace(/_/g, ' ');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-950 to-red-950 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Bangladeshi Authentic Pure Spices, Solar Dehydration & BSTI Anti-Adulteration Ledger
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                খাঁটি মসলা ভ্যালু চেইন ও সৌর ড্রায়িং প্ল্যাটফর্ম
              </h1>
              <p className="mt-2 text-base sm:text-lg text-amber-100/90 max-w-3xl">
                Bogura char red chilli, Natore golden turmeric, and Bandarban mountain ginger dried in enclosed solar parabolic tunnels (&lt;10% moisture) and certified 100% free from carcinogenic Sudan dyes and toxic lead chromate.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/seller/spice-market"
                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition shadow-sm inline-flex items-center gap-2"
              >
                <Sun className="w-4 h-4 text-slate-950" />
                Grower Solar Hub
              </Link>
              <Link
                href="/admin/spice-market"
                className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition border border-white/20 inline-flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                BSTI Lab Desk
              </Link>
            </div>
          </div>

          {/* Quick Metrics KPI Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold">
                <Sun className="w-4 h-4 text-amber-300" /> Solar Tunnel Batches
              </div>
              <div className="text-2xl font-black text-white mt-1">
                {batches.length} <span className="text-xs font-normal text-amber-200">co-op tunnels</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-300" /> BSTI Tested Pure Lots
              </div>
              <div className="text-2xl font-black text-emerald-200 mt-1">
                {labTests.filter((t) => t.certificateIssued).length} <span className="text-xs font-normal text-amber-200">certified</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold">
                <Flame className="w-4 h-4 text-red-300" /> Bioactive Potency Index
              </div>
              <div className="text-2xl font-black text-red-200 mt-1">
                5.2% <span className="text-xs font-normal text-amber-200">Curcumin / 50K SHU</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold">
                <Scale className="w-4 h-4 text-sky-300" /> Safe Moisture Content
              </div>
              <div className="text-2xl font-black text-sky-200 mt-1">
                &lt; 9.5% <span className="text-xs font-normal text-amber-200">Aflatoxin safe</span>
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
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'catalog'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Verified Pure Spice Lots (খাঁটি মসলা লট ক্যাটালগ)
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'calculator'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            Solar Dehydration Calculator (ড্রায়িং আর্দ্রতা ও ফলন হিসাব)
          </button>
          <button
            onClick={() => setActiveTab('purity_tester')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'purity_tester'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            BSTI Anti-Adulteration Simulator (ভেজালরোধী ও ল্যাব অডিট)
          </button>
          <button
            onClick={() => setActiveTab('solar_tunnels')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'solar_tunnels'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sun className="w-4 h-4" />
            Solar Tunnel Dehydration Troughs (সৌর টানেল ব্যাচ)
          </button>
        </div>

        {/* Tab 1: Catalog */}
        {activeTab === 'catalog' && (
          <div className="mt-6 space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" /> Filters:
                </span>
                <select
                  value={selectedSpiceType}
                  onChange={(e) => setSelectedSpiceType(e.target.value as any)}
                  className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-amber-500"
                >
                  <option value="ALL">All Spices (সব মসলা)</option>
                  <option value="CHILLI">Chilli (শুকনা মরিচ)</option>
                  <option value="TURMERIC">Turmeric (দেশি হলুদ)</option>
                  <option value="GINGER">Ginger (আদা)</option>
                  <option value="GARLIC">Garlic (রসুন)</option>
                  <option value="CORIANDER">Coriander (ধনিয়া)</option>
                  <option value="BLACK_CUMIN">Black Cumin (কালোজিরা)</option>
                  <option value="ONION_SEED">Onion Seed (পেঁয়াজ দানা)</option>
                </select>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value as any)}
                  className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-amber-500"
                >
                  <option value="ALL">All Regions (সব অঞ্চল)</option>
                  <option value="BOGURA_SARIAKANDI_CHAR">Bogura (Sariakandi Char)</option>
                  <option value="NATORE_GURUDASPUR">Natore (Gurudaspur)</option>
                  <option value="PABNA_SANTHIA">Pabna (Santhia)</option>
                  <option value="FARIDPUR_SADAR">Faridpur (Sadar)</option>
                  <option value="BANDARBAN_HILL_TRACTS">Bandarban (Hill Tracts)</option>
                </select>
              </div>
              <div className="text-xs text-slate-500">
                Showing <strong className="text-slate-800">{lots.length}</strong> authenticated pure lots
              </div>
            </div>

            {/* Lots Grid */}
            {lotsLoading ? (
              <div className="text-center py-12 text-slate-500 text-sm">Loading spice lots...</div>
            ) : lots.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                No pure spice lots available for selected filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lots.map((lot) => (
                  <div
                    key={lot.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {lot.lotCode}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {lot.purityGrade.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-2">
                        {lot.lotTitle}
                      </h3>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {lot.originRegion.replace(/_/g, ' ')}
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {lot.formFactor.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {lot.packagingType.replace(/_/g, ' ')}
                        </span>
                        {lot.isBstiCertified && (
                          <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> BSTI Pure
                          </span>
                        )}
                        {lot.isBarisrcVerified && (
                          <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                            <Award className="w-3 h-3 text-blue-600" /> BARI-SRC Certified
                          </span>
                        )}
                      </div>

                      {/* Pricing Block */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-slate-500 block">Wholesale Rate</span>
                          <span className="text-xl font-black text-amber-700">
                            ৳{lot.pricePerKgBdt} <span className="text-xs font-normal text-slate-500">/kg</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-slate-500 block">Available Stock</span>
                          <span className="text-sm font-bold text-slate-800">
                            {lot.availableQuantityKg} kg
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Min Order: {lot.minimumOrderKg} kg
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500">
                        Producer: <strong>{lot.producerName}</strong>
                      </span>
                      <button
                        onClick={() => handleOpenBuyModal(lot)}
                        disabled={lot.availableQuantityKg <= 0}
                        className="px-3.5 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition shadow-sm flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Purchase Lot
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Dehydration Calculator */}
        {activeTab === 'calculator' && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Solar Parabolic Dehydration & Yield Calculator
                  </h2>
                  <p className="text-xs text-slate-500">
                    Calculates mass balance dry weight, water evaporation loss, solar drying duration, and cleanliness market premiums.
                  </p>
                </div>
              </div>

              <form onSubmit={handleRunDehydrationCalc} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Spice Type (মসলা)
                    </label>
                    <select
                      value={calcSpiceType}
                      onChange={(e) => {
                        const st = e.target.value as SpiceType;
                        setCalcSpiceType(st);
                        if (st === 'CHILLI') setCalcInitialMoisture(80);
                        else if (st === 'TURMERIC') setCalcInitialMoisture(78);
                        else if (st === 'GINGER') setCalcInitialMoisture(82);
                        else if (st === 'GARLIC') setCalcInitialMoisture(65);
                        else setCalcInitialMoisture(60);
                      }}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
                    >
                      <option value="CHILLI">Chilli (কাঁচা মরিচ - 80% initial moisture)</option>
                      <option value="TURMERIC">Turmeric (কাঁচা হলুদ - 78% initial moisture)</option>
                      <option value="GINGER">Ginger (কাঁচা আদা - 82% initial moisture)</option>
                      <option value="GARLIC">Garlic (রসুন - 65% initial moisture)</option>
                      <option value="CORIANDER">Coriander (ধনিয়া - 60% initial moisture)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fresh Harvest Weight (কেজি)
                    </label>
                    <input
                      type="number"
                      min="10"
                      value={calcFreshWeight}
                      onChange={(e) => setCalcFreshWeight(Number(e.target.value))}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Initial Moisture % (কাঁচা আর্দ্রতা)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="90"
                      value={calcInitialMoisture}
                      onChange={(e) => setCalcInitialMoisture(Number(e.target.value))}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Finished Moisture % [Safe: &le;10%]
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="15"
                      value={calcTargetMoisture}
                      onChange={(e) => setCalcTargetMoisture(Number(e.target.value))}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700 font-bold text-amber-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Drying Method (ড্রায়িং পদ্ধতি)
                  </label>
                  <select
                    value={calcDryingMethod}
                    onChange={(e) => setCalcDryingMethod(e.target.value as DryingMethod)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
                  >
                    <option value="SOLAR_PARABOLIC_TUNNEL">Solar Parabolic Tunnel (4 Days • 0.5% Spoilage • +25% Price Premium)</option>
                    <option value="MECHANICAL_BIOMASS_DRYER">Mechanical Biomass Dryer (2 Days • 0.2% Spoilage • +20% Premium)</option>
                    <option value="HYGIENIC_RAISED_BED_SUN">Hygienic Raised Bed Sun (12 Days • 15% Spoilage Hazard)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isCalculatingDehydration}
                  className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs py-3 rounded-lg transition shadow-sm flex items-center justify-center gap-2"
                >
                  <Scale className="w-4 h-4" />
                  {isCalculatingDehydration ? 'Calculating...' : 'Calculate Dehydration Yield'}
                </button>
              </form>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-600" />
                  Dehydration & Moisture Depletion Metrics
                </h3>

                {calcResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-100">
                        <span className="text-[11px] text-amber-700 font-medium">Finished Dry Weight</span>
                        <div className="text-2xl font-black text-amber-900 mt-1">
                          {calcResult.finishedDryWeightKg.toLocaleString()} <span className="text-xs font-normal">kg</span>
                        </div>
                        <span className="text-[10px] text-amber-600">
                          Yield Ratio: {calcResult.yieldRatio}:1 ({calcResult.yieldPct}% recovery)
                        </span>
                      </div>
                      <div className="bg-sky-50 p-3.5 rounded-xl border border-sky-100">
                        <span className="text-[11px] text-sky-700 font-medium">Evaporated Moisture Loss</span>
                        <div className="text-2xl font-black text-sky-900 mt-1">
                          {calcResult.evaporatedWaterKg.toLocaleString()} <span className="text-xs font-normal">litres</span>
                        </div>
                        <span className="text-[10px] text-sky-600">
                          Dry matter core: {calcResult.dryMatterKg} kg
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Drying Duration</span>
                        <strong className="text-sm font-bold text-slate-800">
                          {calcResult.dryingDaysEstimate} days
                        </strong>
                        <span className="text-[10px] text-emerald-600 block">66% faster than road</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Cleanliness Premium</span>
                        <strong className="text-sm font-bold text-amber-700">
                          +{calcResult.cleanlinessBonusPct}%
                        </strong>
                        <span className="text-[10px] text-slate-400 block">Unblemished pod</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Spoilage Risk</span>
                        <strong className="text-sm font-bold text-emerald-700">
                          {calcResult.spoilageRiskPct}%
                        </strong>
                        <span className="text-[10px] text-slate-400 block">Dust/insect sealed</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Aflatoxin Free Guarantee:</strong> {calcResult.qualityAdvisory}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                    Configure fresh spice parameters on the left and click "Calculate Dehydration Yield" to see dried yield recovery.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Purity Tester */}
        {activeTab === 'purity_tester' && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-red-100 rounded-lg text-red-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    BSTI Anti-Adulteration Spectrophotometry Tester
                  </h2>
                  <p className="text-xs text-slate-500">
                    Simulates laboratory chemical testing against carcinogenic Sudan dyes (I-IV), toxic lead chromate polish, metanil yellow, and aflatoxin mold.
                  </p>
                </div>
              </div>

              <form onSubmit={handleRunPurityAudit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Spice Sample Category
                  </label>
                  <select
                    value={simSpiceType}
                    onChange={(e) => setSimSpiceType(e.target.value as SpiceType)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
                  >
                    <option value="CHILLI">Red Chilli Powder / Pods (শুকনা মরিচ)</option>
                    <option value="TURMERIC">Turmeric Powder / Rhizomes (হলুদ গুঁড়া)</option>
                    <option value="GINGER">Ginger Flakes (আদা)</option>
                    <option value="CORIANDER">Coriander (ধনিয়া)</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Sudan Dyes (I-IV)
                    </label>
                    <select
                      value={simSudan}
                      onChange={(e) => setSimSudan(e.target.value as AdulterationTestStatus)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-700"
                    >
                      <option value="NEGATIVE_NOT_DETECTED">Negative (0 ppm)</option>
                      <option value="POSITIVE_ADULTERATED">POSITIVE (Toxic Dye!)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Lead Chromate (PbCrO4)
                    </label>
                    <select
                      value={simLeadChromate}
                      onChange={(e) => setSimLeadChromate(e.target.value as AdulterationTestStatus)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-700"
                    >
                      <option value="NEGATIVE_NOT_DETECTED">Negative (0 ppm)</option>
                      <option value="POSITIVE_ADULTERATED">POSITIVE (Toxic Lead!)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Metanil Yellow
                    </label>
                    <select
                      value={simMetanilYellow}
                      onChange={(e) => setSimMetanilYellow(e.target.value as AdulterationTestStatus)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-700"
                    >
                      <option value="NEGATIVE_NOT_DETECTED">Negative (0 ppm)</option>
                      <option value="POSITIVE_ADULTERATED">POSITIVE (Banned Color)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Moisture Content % [Limit: 10.0%]
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={simMoisture}
                      onChange={(e) => setSimMoisture(Number(e.target.value))}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Aflatoxin B1 (ppb) [Limit: 5.0 ppb]
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={simAflatoxin}
                      onChange={(e) => setSimAflatoxin(Number(e.target.value))}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700 font-bold"
                    />
                  </div>
                </div>

                {simSpiceType === 'TURMERIC' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Curcumin Content % [Target: &ge; 4.5%]
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={simCurcumin}
                      onChange={(e) => setSimCurcumin(Number(e.target.value))}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Scoville Heat Units (SHU) [Target: 40,000 - 60,000]
                    </label>
                    <input
                      type="number"
                      step="1000"
                      value={simScoville}
                      onChange={(e) => setSimScoville(Number(e.target.value))}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isEvaluatingPurity}
                  className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs py-3 rounded-lg transition shadow-sm flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isEvaluatingPurity ? 'Evaluating...' : 'Run Spectroscopic Anti-Adulteration Audit'}
                </button>
              </form>
            </div>

            {/* Purity Results Panel */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  BSTI Chemical Compliance & Safety Verdict
                </h3>

                {purityResult ? (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-xl border flex items-start gap-3 ${
                        purityResult.bstiComplianceApproved
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}
                    >
                      {purityResult.bstiComplianceApproved ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-sm font-bold">
                          {purityResult.bstiComplianceApproved
                            ? 'PASSED: 100% Pure Chemical Integrity (BSTI Certified)'
                            : 'CRITICAL HAZARD: Adulteration or Mold Contamination!'}
                        </div>
                        <div className="text-xs mt-1 leading-relaxed">
                          {purityResult.safetyNotes}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block">Purity Grade</span>
                        <strong className="text-slate-800">{purityResult.purityGrade}</strong>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block">Bioactive Potency Score</span>
                        <strong className="text-emerald-700 text-sm">
                          {purityResult.potencyScore} / 100
                        </strong>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900">
                      <strong>Audit Verdict Code:</strong> {purityResult.verdict}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                    Run the simulation on the left to test chemical dye detection against BSTI and European Spice Association (ESA) export protocols.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Solar Tunnels */}
        {activeTab === 'solar_tunnels' && (
          <div className="mt-6 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-600" />
                Cooperative Solar Parabolic Tunnel Drying Telemetry
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Enclosed greenhouse tunnel dehydrators with temperature and moisture sensors preventing Aspergillus mold and aflatoxin.
              </p>

              {batchesLoading ? (
                <div className="text-center py-12 text-slate-500 text-sm">Loading solar drying telemetry...</div>
              ) : batches.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">No active solar drying batches found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {batches.map((batch) => (
                    <div
                      key={batch.id}
                      className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {batch.batchNumber}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              batch.aflatoxinRiskLevel === 'SAFE_ZERO_RISK'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {batch.aflatoxinRiskLevel.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 mt-2">
                          {batch.varietyName}
                        </h4>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {batch.growerCoopName} ({batch.region.replace(/_/g, ' ')})
                        </div>

                        {/* Telemetry Dials */}
                        <div className="grid grid-cols-3 gap-2 mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                          <div>
                            <span className="text-[11px] text-slate-500 block">Chamber Temp</span>
                            <strong className="text-sm font-black text-amber-900">
                              {batch.chamberTempCelsius}°C
                            </strong>
                            <span className="text-[10px] text-slate-400 block">Solar Draft</span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Moisture Level</span>
                            <strong className="text-sm font-black text-emerald-700">
                              {batch.currentMoisturePct}%
                            </strong>
                            <span className="text-[10px] text-slate-400 block">Target &le;10%</span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Days Elapsed</span>
                            <strong className="text-sm font-black text-slate-800">
                              {batch.dryingDaysElapsed} days
                            </strong>
                            <span className="text-[10px] text-slate-400 block">Enclosed Tunnel</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          Fresh: {batch.initialFreshWeightKg} kg &rarr; Dry: <strong>{batch.currentDryWeightKg} kg</strong>
                        </span>
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {batch.status.replace(/_/g, ' ')}
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

      {/* Purchase Modal */}
      {selectedLotForBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              Direct Wholesale Spice Purchase (পাইকারি মসলা বুকিং)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Lot: <strong className="text-slate-700">{selectedLotForBuy.lotCode}</strong> • {selectedLotForBuy.lotTitle}
            </p>

            {purchaseSuccessMessage ? (
              <div className="my-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center">
                {purchaseSuccessMessage}
              </div>
            ) : (
              <form onSubmit={handleConfirmPurchase} className="space-y-4 mt-4">
                {purchaseErrorMessage && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {purchaseErrorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institutional Buyer / Company Name (ক্রেতার নাম)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhuni Pure Spices / Pran Agro Foods"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone (মোবাইল নম্বর)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+8801XXXXXXXXX"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Order Quantity (কেজি) [Min: {selectedLotForBuy.minimumOrderKg} kg • Available: {selectedLotForBuy.availableQuantityKg} kg]
                  </label>
                  <input
                    type="number"
                    min={selectedLotForBuy.minimumOrderKg}
                    max={selectedLotForBuy.availableQuantityKg}
                    required
                    value={orderQuantityKg}
                    onChange={(e) => setOrderQuantityKg(Number(e.target.value))}
                    className="w-full text-sm font-bold border border-slate-300 rounded-lg p-2.5 bg-white text-amber-900"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Total Purchase Value:</span>
                    <strong className="text-amber-700 text-sm">
                      ৳{(orderQuantityKg * selectedLotForBuy.pricePerKgBdt).toLocaleString()}
                    </strong>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Packaging: {selectedLotForBuy.packagingType.replace(/_/g, ' ')}. Direct cooperative payout.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLotForBuy(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPurchasing}
                    className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition shadow-sm"
                  >
                    {isPurchasing ? 'Processing Order...' : 'Confirm B2B Purchase'}
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
