'use client';

import React, { useState } from 'react';
import {
  Compass,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  MapPin,
  Activity,
  Layers,
  FileText,
  ShieldCheck,
  Send,
} from 'lucide-react';
import {
  useGetApiaryBoxesQuery,
  useGetHoneyLotsQuery,
  useRegisterApiaryBoxMutation,
  useUpdateApiaryBoxHealthMutation,
  useCreateHoneyHarvestLotMutation,
  BeeSpecies,
  ApiaryBoxHealthStatus,
  HoneyFloralSource,
  HoneyHarvestType,
} from '../honeyApiaryApi';

interface BeekeeperApiaryManagementViewProps {
  lang: string;
}

export const BeekeeperApiaryManagementView: React.FC<BeekeeperApiaryManagementViewProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  // API Queries
  const { data: boxesData, refetch: refetchBoxes } = useGetApiaryBoxesQuery();
  const { data: lotsData, refetch: refetchLots } = useGetHoneyLotsQuery();

  // Mutations
  const [registerBox, { isLoading: isRegisteringBox }] = useRegisterApiaryBoxMutation();
  const [updateBoxHealth, { isLoading: isUpdatingHealth }] = useUpdateApiaryBoxHealthMutation();
  const [createLot, { isLoading: isCreatingLot }] = useCreateHoneyHarvestLotMutation();

  // New Box Form State
  const [boxCode, setBoxCode] = useState('BOX-MELL-TNG-105');
  const [beekeeperName, setBeekeeperName] = useState('সিরাজুল ইসলাম');
  const [beeSpecies, setBeeSpecies] = useState<BeeSpecies>('APIS_MELLIFERA');
  const [currentDistrict, setCurrentDistrict] = useState('টাঙ্গাইল');
  const [currentUpazila, setCurrentUpazila] = useState('মির্জাপুর');
  const [gpsLat, setGpsLat] = useState(24.312);
  const [gpsLng, setGpsLng] = useState(89.985);
  const [floralCrop, setFloralCrop] = useState('সরিষা ফুল ক্ষেত');
  const [framesCount, setFramesCount] = useState(8);
  const [boxSuccess, setBoxSuccess] = useState<string | null>(null);

  // New Harvest Lot Form State
  const [lotBeekeeperName, setLotBeekeeperName] = useState('সিরাজুল ইসলাম মৌ-খামার');
  const [lotPhone, setLotPhone] = useState('01722334455');
  const [lotDistrict, setLotDistrict] = useState('টাঙ্গাইল');
  const [harvestType, setHarvestType] = useState<HoneyHarvestType>('MIGRATORY_BOX_APIARY');
  const [floralSource, setFloralSource] = useState<HoneyFloralSource>('MUSTARD_BLOSSOM_CREAM');
  const [grossKg, setGrossKg] = useState(150);
  const [moisture, setMoisture] = useState(18.0);
  const [c4Ratio, setC4Ratio] = useState(-26.0);
  const [hmf, setHmf] = useState(12.5);
  const [labCert, setLabCert] = useState('BSTI-TNG-2026-990');
  const [forestPermit, setForestPermit] = useState('');
  const [pricePerKg, setPricePerKg] = useState(650);
  const [lotSuccess, setLotSuccess] = useState<string | null>(null);

  // Quick Health Update State
  const [updatingBoxId, setUpdatingBoxId] = useState<string | null>(null);
  const [newHealthStatus, setNewHealthStatus] = useState<ApiaryBoxHealthStatus>('HONEY_SUPER_FULL_READY_TO_EXTRACT');

  const boxes = boxesData?.data || [];
  const lots = lotsData?.data || [];

  const handleRegisterBox = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await registerBox({
        boxCode,
        beekeeperName,
        beeSpecies,
        currentDistrict,
        currentUpazila,
        gpsLatitude: Number(gpsLat),
        gpsLongitude: Number(gpsLng),
        activeFloralCrop: floralCrop,
        framesCount: Number(framesCount),
      }).unwrap();

      if (res.success) {
        setBoxSuccess(
          isBn
            ? `মৌ-বাক্স ${res.data.boxCode} সফলভাবে নিবন্ধিত হয়েছে!`
            : `Apiary box ${res.data.boxCode} registered successfully!`
        );
        refetchBoxes();
        setTimeout(() => setBoxSuccess(null), 4000);
      }
    } catch {
      // Handled
    }
  };

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createLot({
        beekeeperName: lotBeekeeperName,
        beekeeperPhone: lotPhone,
        district: lotDistrict,
        harvestType,
        floralSource,
        beeSpecies,
        harvestDate: new Date().toISOString().split('T')[0],
        grossVolumeKg: Number(grossKg),
        moisturePercentage: Number(moisture),
        c4SugarIsotopeRatioPermil: Number(c4Ratio),
        hmfFreshnessMgPerKg: Number(hmf),
        labCertificateNo: labCert || undefined,
        forestDeptPermitNo: forestPermit || undefined,
        wholesalePricePerKgBdt: Number(pricePerKg),
        isForestCertifiedWild: harvestType === 'WILD_FOREST_MOUWAL_HARVEST',
      }).unwrap();

      if (res.success) {
        setLotSuccess(
          isBn
            ? `মধুর লট ${res.data.lotNumber} (${res.data.purityGrade}) সফলভাবে তালিকাভুক্ত হয়েছে!`
            : `Honey lot #${res.data.lotNumber} (${res.data.purityGrade}) listed successfully!`
        );
        refetchLots();
        setTimeout(() => setLotSuccess(null), 4000);
      }
    } catch {
      // Handled
    }
  };

  const handleUpdateBoxHealth = async (id: string) => {
    try {
      const res = await updateBoxHealth({
        id,
        data: { healthStatus: newHealthStatus },
      }).unwrap();

      if (res.success) {
        setUpdatingBoxId(null);
        refetchBoxes();
      }
    } catch {
      // Handled
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>{isBn ? 'মৌচাষী ও মৌয়াল কন্ট্রোল ড্যাশবোর্ড' : 'Beekeeper & Apiary Fleet Dashboard'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {isBn
                ? 'মৌ-বাক্স কলোনি বহর ও মধু আহরণ লট ব্যবস্থাপনা'
                : 'Apiary Colony Fleet & Honey Harvest Management'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
              {isBn
                ? 'ভ্রাম্যমাণ কাঠের বাক্সের জিপিএস অবস্থান, রানীর বংশবৃদ্ধি স্বাস্থ্য এবং ল্যাব-প্রত্যয়িত মধু চালান এন্ট্রি।'
                : 'Track mobile bee box GPS locations, colony brood health, and register lab-verified harvest lots.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                refetchBoxes();
                refetchLots();
              }}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section 1: Register New Honey Harvest Lot & Add Apiary Colony Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left (7 cols): List New Honey Harvest Lot */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isBn ? 'নতুন মধু আহরণ লট চালান নথিভুক্ত করুন' : 'List Honey Harvest Lot'}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {isBn
                    ? 'আর্দ্রতা ও C4 কার্বন আইসোটোপ অনুপাত দিয়ে গ্রেডিং নির্ধারণ করুন'
                    : 'Auto-determines Grade A/B purity and links BSTI/Forest permits'}
                </p>
              </div>
            </div>

            {lotSuccess && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{lotSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateLot} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'মৌয়াল বা খামারির নাম' : 'Beekeeper Name'}
                  </label>
                  <input
                    type="text"
                    value={lotBeekeeperName}
                    onChange={(e) => setLotBeekeeperName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'মোবাইল নম্বর' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={lotPhone}
                    onChange={(e) => setLotPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'আহরণের ধরন' : 'Harvest Type'}
                  </label>
                  <select
                    value={harvestType}
                    onChange={(e) => setHarvestType(e.target.value as HoneyHarvestType)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="MIGRATORY_BOX_APIARY">ভ্রাম্যমাণ কাঠের মৌ-বাক্স</option>
                    <option value="WILD_FOREST_MOUWAL_HARVEST">সুন্দরবনের বুনো চাক কাটা</option>
                    <option value="HOMESTEAD_TRADITIONAL_APIARY">বসতবাড়ির বাগান পালন</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'ফুলের উৎস' : 'Floral Source'}
                  </label>
                  <select
                    value={floralSource}
                    onChange={(e) => setFloralSource(e.target.value as HoneyFloralSource)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="MUSTARD_BLOSSOM_CREAM">সরিষা ফুল মধু</option>
                    <option value="SUNDARBANS_KHALISHA_WILD">সুন্দরবন খলিশা মধু</option>
                    <option value="SUNDARBANS_GORAN_GEWA">সুন্দরবন গরান ও গেওয়া</option>
                    <option value="LITCHI_ORCHARD_BLOSSOM">লিচু বাগান মধু</option>
                    <option value="BLACK_CUMIN_KALOJEERA">কালোজিরা ঔষধি মধু</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'জেলা' : 'District'}
                  </label>
                  <input
                    type="text"
                    value={lotDistrict}
                    onChange={(e) => setLotDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'ভলিউম (kg)' : 'Volume (kg)'}
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="5"
                    value={grossKg}
                    onChange={(e) => setGrossKg(parseFloat(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'আর্দ্রতা %' : 'Moisture %'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="28"
                    value={moisture}
                    onChange={(e) => setMoisture(parseFloat(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'C4 Isotope' : 'C4 δ13C'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="-35"
                    max="-10"
                    value={c4Ratio}
                    onChange={(e) => setC4Ratio(parseFloat(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'দর (৳/kg)' : 'Rate (৳/kg)'}
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="100"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(parseFloat(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'বিএসটিআই ল্যাব সনদ নং' : 'BSTI Lab Certificate No'}
                  </label>
                  <input
                    type="text"
                    value={labCert}
                    onChange={(e) => setLabCert(e.target.value)}
                    placeholder="e.g. BSTI-TNG-2026-990"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'সুন্দরবন বন বিভাগ পারমিট নং' : 'Forest Dept Permit No'}
                  </label>
                  <input
                    type="text"
                    value={forestPermit}
                    onChange={(e) => setForestPermit(e.target.value)}
                    placeholder="e.g. FD-SAT-2026-004"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreatingLot}
                className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isCreatingLot ? (
                  <span>{isBn ? 'তালিকাভুক্ত করা হচ্ছে...' : 'Listing Lot...'}</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{isBn ? 'মধু চালান প্রকাশ করুন' : 'Publish Honey Harvest Lot'}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right (5 cols): Register Apiary Colony Box */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isBn ? 'নতুন মৌ-বাক্স নিবন্ধন' : 'Register Apiary Colony Box'}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {isBn ? 'জিপিএস অবস্থান ও ফসল ট্র্যাক করুন' : 'Track GPS location and floral crop'}
                </p>
              </div>
            </div>

            {boxSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{boxSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegisterBox} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'বাক্স কোড' : 'Box Code'}
                </label>
                <input
                  type="text"
                  value={boxCode}
                  onChange={(e) => setBoxCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-cyan-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'জেলা' : 'District'}
                  </label>
                  <input
                    type="text"
                    value={currentDistrict}
                    onChange={(e) => setCurrentDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'উপজেলা' : 'Upazila'}
                  </label>
                  <input
                    type="text"
                    value={currentUpazila}
                    onChange={(e) => setCurrentUpazila(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'সক্রিয় ফুলের ফসল' : 'Active Floral Crop'}
                </label>
                <input
                  type="text"
                  value={floralCrop}
                  onChange={(e) => setFloralCrop(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'জিপিএস অক্ষাংশ (Lat)' : 'GPS Latitude'}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={gpsLat}
                    onChange={(e) => setGpsLat(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'জিপিএস দ্রাঘিমাংশ (Lng)' : 'GPS Longitude'}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={gpsLng}
                    onChange={(e) => setGpsLng(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isRegisteringBox}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isRegisteringBox ? (
                  <span>{isBn ? 'নিবন্ধন হচ্ছে...' : 'Registering...'}</span>
                ) : (
                  <>
                    <Compass className="w-4 h-4" />
                    <span>{isBn ? 'বাক্স যুক্ত করুন' : 'Add Apiary Box'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Section 2: Active Mobile Apiary Colony Fleet Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {isBn ? 'ভ্রাম্যমাণ কাঠের মৌ-বাক্স বহর ও স্বাস্থ্য স্থিতি' : 'Mobile Apiary Colony Fleet Status'}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {isBn
                    ? 'মৌসুমী মাইগ্রেশন, ফ্রেম ক্যাপাসিটি এবং মধু নিষ্কাশনের সার্বক্ষণিক পর্যবেক্ষণ'
                    : 'Manage seasonal floral migration and honey super extraction readiness'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {boxes.length} {isBn ? 'টি বাক্স' : 'Colonies'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">{isBn ? 'বাক্স কোড' : 'Box Code'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'মৌমাছির প্রজাতি' : 'Bee Species'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'বর্তমান অবস্থান ও ফসল' : 'Location & Floral Crop'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'ফ্রেম সংখ্যা' : 'Frames'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'আনুমানিক ফলন' : 'Yield'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'স্বাস্থ্য অবস্থা' : 'Brood Health'}</th>
                  <th className="py-3.5 px-4 text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {boxes.map((box) => (
                  <tr
                    key={box.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {box.boxCode}
                    </td>

                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {box.beeSpecies.replace(/_/g, ' ')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {box.currentDistrict}, {box.currentUpazila}
                      </span>
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        {box.activeFloralCrop}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {box.framesCount} Frames
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {box.estimatedHoneyYieldKg} kg
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          box.healthStatus === 'HONEY_SUPER_FULL_READY_TO_EXTRACT'
                            ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                            : box.healthStatus === 'HEALTHY_BROOD_ACTIVE'
                            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                            : 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                        }`}
                      >
                        {box.healthStatus.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {updatingBoxId === box.id ? (
                        <div className="flex items-center gap-1.5 justify-end">
                          <select
                            value={newHealthStatus}
                            onChange={(e) => setNewHealthStatus(e.target.value as ApiaryBoxHealthStatus)}
                            className="px-2 py-1 rounded-md text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          >
                            <option value="HEALTHY_BROOD_ACTIVE">সুস্থ কলোনি</option>
                            <option value="HONEY_SUPER_FULL_READY_TO_EXTRACT">নিষ্কাশন প্রস্তুত</option>
                            <option value="MIGRATION_TRANSIT">মাইগ্রেশন ট্রানজিট</option>
                            <option value="VARROA_MITE_INFESTATION_ALERT">ভারোয়া মাইট অ্যালার্ট</option>
                          </select>
                          <button
                            onClick={() => handleUpdateBoxHealth(box.id)}
                            disabled={isUpdatingHealth}
                            className="p-1 rounded bg-emerald-600 text-white"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setUpdatingBoxId(box.id);
                            setNewHealthStatus(box.healthStatus);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-all"
                        >
                          {isBn ? 'স্থিতি আপডেট' : 'Update'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
