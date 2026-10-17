'use client';

import React, { useState } from 'react';
import {
  ScrollText,
  PlusCircle,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Droplets,
  Layers,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  useGetAllRettingBatchesQuery,
  useGetAllFiberLotsQuery,
  useCreateRettingBatchMutation,
  useUpdateRettingTelemetryMutation,
  useCreateFiberLotMutation,
  JuteVariety,
  JuteFiberGrade,
  RettingMethod,
  RettingStatus,
  BaleType,
} from '../juteBiotechApi';

interface JuteFarmerRettingHubViewProps {
  lang: string;
}

export const JuteFarmerRettingHubView: React.FC<JuteFarmerRettingHubViewProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  const { data: batchesData, isLoading: batchesLoading } = useGetAllRettingBatchesQuery();
  const { data: lotsData, isLoading: lotsLoading } = useGetAllFiberLotsQuery();

  const [createBatch, { isLoading: isCreatingBatch }] = useCreateRettingBatchMutation();
  const [updateTelemetry, { isLoading: isUpdatingTelemetry }] = useUpdateRettingTelemetryMutation();
  const [createLot, { isLoading: isCreatingLot }] = useCreateFiberLotMutation();

  // Tab State
  const [activeTab, setActiveTab] = useState<'BATCHES' | 'NEW_BATCH' | 'WEIGHBRIDGE'>('BATCHES');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Batch Form State
  const [batchCode, setBatchCode] = useState(`BJRI-RET-${Math.floor(1000 + Math.random() * 9000)}`);
  const [farmerName, setFarmerName] = useState('Md. Akram Hossain Mollah');
  const [farmerPhone, setFarmerPhone] = useState('+8801711223344');
  const [district, setDistrict] = useState('Faridpur');
  const [upazila, setUpazila] = useState('Faridpur Sadar');
  const [waterSourceType, setWaterSourceType] = useState('Padma Tributary Canal');
  const [variety, setVariety] = useState<JuteVariety>('TOSSA_JUTE');
  const [rettingMethod, setRettingMethod] = useState<RettingMethod>('RIBBON_RETTING_ENZYMATIC');
  const [microbialInoculantUsed, setMicrobialInoculantUsed] = useState(true);
  const [targetYieldMaunds, setTargetYieldMaunds] = useState<number>(60);
  const [steepingDate, setSteepingDate] = useState('2026-07-15');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('2026-07-24');

  // New Fiber Lot Form State
  const [lotNumber, setLotNumber] = useState(`FBR-${Math.floor(10000 + Math.random() * 90000)}`);
  const [balingCenterName, setBalingCenterName] = useState('Faridpur Sadar Jute Baling & Warehousing Co-op');
  const [lotGrade, setLotGrade] = useState<JuteFiberGrade>('BJC_SPECIAL_TOP');
  const [baleType, setBaleType] = useState<BaleType>('KUTCHA_BALE_FARM');
  const [baleCount, setBaleCount] = useState<number>(15);
  const [grossWeightKg, setGrossWeightKg] = useState<number>(2150);
  const [tareWeightKg, setTareWeightKg] = useState<number>(75);
  const [moisturePercentage, setMoisturePercentage] = useState<number>(13.5);
  const [pricePerMaund, setPricePerMaund] = useState<number>(4100);

  const batches = batchesData?.data || [];
  const lots = lotsData?.data || [];

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBatch({
        batchCode,
        farmerName,
        farmerPhone,
        district,
        upazila,
        waterSourceType,
        variety,
        rettingMethod,
        microbialInoculantUsed,
        inoculantStrainCode: microbialInoculantUsed ? 'BJRI-PectinoConsortium-B4' : 'NATURAL_FLORA',
        steepingDate,
        expectedHarvestDate,
        daysElapsed: 1,
        waterTempCelsius: 30.5,
        waterPh: 7.1,
        dissolvedOxygenMgL: 4.4,
        targetFiberYieldMaunds: Number(targetYieldMaunds),
        bjriFieldOfficer: 'Dr. Rafiqul Islam, BJRI Senior Scientific Officer',
      }).unwrap();

      setSuccessMessage(
        isBn
          ? `পচন ব্যাচ ${batchCode} সফলভাবে নিবন্ধিত হয়েছে!`
          : `Retting Batch ${batchCode} successfully registered!`
      );
      setBatchCode(`BJRI-RET-${Math.floor(1000 + Math.random() * 9000)}`);
      setActiveTab('BATCHES');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to create batch', err);
    }
  };

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLot({
        lotNumber,
        farmerName,
        balingCenterName,
        district,
        variety,
        grade: lotGrade,
        baleType,
        baleCount: Number(baleCount),
        grossWeightKg: Number(grossWeightKg),
        tareWeightKg: Number(tareWeightKg),
        moisturePercentage: Number(moisturePercentage),
        pricePerMaund: Number(pricePerMaund),
      }).unwrap();

      setSuccessMessage(
        isBn
          ? `ওয়েইব্রিজ লট ${lotNumber} সফলভাবে এন্ট্রি ও এসক্রোতে রেকর্ড হয়েছে!`
          : `Weighbridge Lot ${lotNumber} recorded and submitted to escrow!`
      );
      setLotNumber(`FBR-${Math.floor(10000 + Math.random() * 90000)}`);
      setActiveTab('BATCHES');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to create lot', err);
    }
  };

  const handleQuickTelemetryUpdate = async (id: string, currentDays: number) => {
    try {
      const nextDays = currentDays + 1;
      const isReady = nextDays >= 9;
      await updateTelemetry({
        id,
        dto: {
          daysElapsed: nextDays,
          status: isReady ? 'FIBER_SEPARATION_READY' : 'ACTIVE_MICROBIAL_RETTING',
          waterTempCelsius: 31.2,
          dissolvedOxygenMgL: 4.1,
        },
      }).unwrap();
    } catch (err) {
      console.error('Failed to update telemetry', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 to-amber-700 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold mb-2">
              <ScrollText className="w-4 h-4" />
              <span>{isBn ? 'পাট চাষি ও বেলিং প্রেস কন্ট্রোল সেন্টার' : 'Jute Grower & Baling Press Center'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              {isBn ? 'সোনালী আঁশ পচন ও ওয়েইব্রিজ ব্যবস্থাপনা' : 'Retting Telemetry & Weighbridge Intake Hub'}
            </h1>
            <p className="text-amber-100/80 text-sm mt-1 max-w-2xl">
              {isBn
                ? 'বিজেআরআই রিবন রেটিংয়ের মাইক্রোবায়াল অগ্রগতি ট্র্যাকিং, পানির গুণমান রেকর্ড এবং স্বয়ংক্রিয় আর্দ্রতা সমন্বয়সহ ডিজিটাল ওয়েইব্রিজ এন্ট্রি।'
                : 'Monitor microbial ribbon retting, log canal water parameters, and execute automated weighbridge moisture deductions.'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('NEW_BATCH')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isBn ? 'নতুন পচন ব্যাচ' : 'New Retting Batch'}</span>
            </button>
            <button
              onClick={() => setActiveTab('WEIGHBRIDGE')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm"
            >
              <Scale className="w-4 h-4" />
              <span>{isBn ? 'ওয়েইব্রিজ এন্ট্রি' : 'Weighbridge Intake'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('BATCHES')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'BATCHES'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {isBn ? 'চলমান পচন ও বেলিং লট' : 'Active Retting & Fiber Lots'}
          </button>
          <button
            onClick={() => setActiveTab('NEW_BATCH')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'NEW_BATCH'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {isBn ? 'পচন ব্যাচ নিবন্ধন ফরম' : 'Register Retting Batch'}
          </button>
          <button
            onClick={() => setActiveTab('WEIGHBRIDGE')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'WEIGHBRIDGE'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {isBn ? 'ওয়েইব্রিজ আঁশ এন্ট্রি' : 'Weighbridge Fiber Entry'}
          </button>
        </div>

        {/* TAB 1: LIST ACTIVE BATCHES & LOTS */}
        {activeTab === 'BATCHES' && (
          <div className="mt-6 space-y-8">
            {/* RETTING BATCHES TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isBn ? 'পচন ব্যাচ ও পানি গুণমান ট্র্যাকিং' : 'Retting Batches & Canal Water Telemetry'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isBn
                      ? 'প্রতিদিন পানির তাপমাত্রা ও অক্সিজেন মাত্রা লগ করুন'
                      : 'Log water temp and DO daily to ensure high tensile golden fiber'}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-full">
                  {batches.length} {isBn ? 'টি ব্যাচ' : 'Batches'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Batch Code</th>
                      <th className="py-3 px-4">Variety & Method</th>
                      <th className="py-3 px-4">Water Telemetry</th>
                      <th className="py-3 px-4">Days Elapsed</th>
                      <th className="py-3 px-4">Yield (Maunds)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {batchesLoading ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          Loading batches...
                        </td>
                      </tr>
                    ) : (
                      batches.map((batch) => (
                        <tr key={batch.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 font-mono text-xs">
                            {batch.batchCode}
                            <span className="block text-[11px] font-sans font-normal text-slate-400">
                              {batch.upazila}, {batch.district}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800">{batch.variety}</span>
                            <span className="block text-xs text-amber-700">
                              {batch.rettingMethod === 'RIBBON_RETTING_ENZYMATIC'
                                ? 'BJRI Ribbon Retting (8-10d)'
                                : 'Whole Plant Steep'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs">
                            <span>{batch.waterTempCelsius}°C • pH {batch.waterPh}</span>
                            <span className="block text-emerald-700 font-medium">DO {batch.dissolvedOxygenMgL} mg/L</span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {batch.daysElapsed} দিন / Days
                          </td>
                          <td className="py-3.5 px-4 font-bold text-amber-700">
                            {batch.targetFiberYieldMaunds} মন
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                                batch.status === 'FIBER_SEPARATION_READY'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {batch.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleQuickTelemetryUpdate(batch.id, batch.daysElapsed)}
                              disabled={isUpdatingTelemetry}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 text-xs font-semibold transition-all border border-slate-200"
                            >
                              +1 দিন লগ
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FIBER LOTS TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isBn ? 'ওয়েইব্রিজ প্রত্যয়িত আঁশ লট ও এসক্রো পরিশোধ' : 'Weighbridge Certified Lots & Escrow Payouts'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isBn
                      ? '১৪% আর্দ্রতা আদর্শের ভিত্তিতে সমন্বিত নিট প্রদেয়'
                      : 'Net settlement calculated after pro-rata moisture penalties/bonuses'}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                  {lots.length} {isBn ? 'টি লট' : 'Lots'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Lot & Press</th>
                      <th className="py-3 px-4">Grade & Variety</th>
                      <th className="py-3 px-4">Bales & Weight</th>
                      <th className="py-3 px-4">Moisture %</th>
                      <th className="py-3 px-4">Billable Maunds</th>
                      <th className="py-3 px-4">Total Payout</th>
                      <th className="py-3 px-4">Escrow Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {lotsLoading ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          Loading lots...
                        </td>
                      </tr>
                    ) : (
                      lots.map((lot) => (
                        <tr key={lot.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-900">
                            {lot.lotNumber}
                            <span className="block text-[11px] font-sans font-normal text-slate-400">
                              {lot.balingCenterName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-amber-800 text-xs px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                              {lot.grade}
                            </span>
                            <span className="block text-xs text-slate-500 mt-1">{lot.variety}</span>
                          </td>
                          <td className="py-3.5 px-4 text-xs">
                            <span className="font-semibold text-slate-800">{lot.baleCount} Bales</span>
                            <span className="block text-slate-400">Net {lot.netRawWeightKg} kg</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-xs font-bold ${
                                lot.moisturePercentage <= 14 ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              {lot.moisturePercentage}%
                            </span>
                            {lot.moistureAdjustmentKg > 0 && (
                              <span className="block text-[10px] text-rose-600 font-medium">
                                -{lot.moistureAdjustmentKg} kg
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-amber-800">
                            {lot.billableMaunds} মন
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-700">
                            ৳{lot.totalPayoutBdt.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {lot.escrowStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER NEW RETTING BATCH */}
        {activeTab === 'NEW_BATCH' && (
          <div className="mt-6 max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {isBn ? 'নতুন পাট পচন ব্যাচ নিবন্ধন' : 'Register New Jute Retting Batch'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isBn
                    ? 'বিজেআরআই ইনোকুল্যান্ট ব্যবহার করে রিবন রেটিং শুরু করুন'
                    : 'Start microbial ribbon retting with BJRI biotechnical consortia'}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateBatch} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Code</label>
                  <input
                    type="text"
                    value={batchCode}
                    onChange={(e) => setBatchCode(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'চাষির নাম' : 'Farmer Name'}
                  </label>
                  <input
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'মোবাইল নম্বর' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'জেলা' : 'District'}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'উপজেলা' : 'Upazila'}
                  </label>
                  <input
                    type="text"
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'পাটের জাত' : 'Jute Variety'}
                  </label>
                  <select
                    value={variety}
                    onChange={(e) => setVariety(e.target.value as JuteVariety)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                  >
                    <option value="TOSSA_JUTE">তোষা পাট (Corchorus olitorius)</option>
                    <option value="WHITE_JUTE">সাদা দেশি পাট (Corchorus capsularis)</option>
                    <option value="MESTA_KENAF">মেস্তা কেনাফ (Hibiscus sabdariffa)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'পচন পদ্ধতি' : 'Retting Method'}
                  </label>
                  <select
                    value={rettingMethod}
                    onChange={(e) => setRettingMethod(e.target.value as RettingMethod)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                  >
                    <option value="RIBBON_RETTING_ENZYMATIC">
                      রিবন রেটিং (BJRI মাইক্রোবায়াল কনসোর্টিয়াম ৮–১০ দিন)
                    </option>
                    <option value="CONVENTIONAL_WHOLE_PLANT_STEEP">
                      সনাতন গোটা গাছ জাগ দেওয়া (১৮–২১ দিন)
                    </option>
                    <option value="TANK_MICROBIAL_RETTING">জিও-মেমব্রেন কৃত্রিম ট্যাংক</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'জলাশয়ের ধরন' : 'Water Source'}
                  </label>
                  <input
                    type="text"
                    value={waterSourceType}
                    onChange={(e) => setWaterSourceType(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'জাগ দেওয়ার তারিখ' : 'Steeping Date'}
                  </label>
                  <input
                    type="date"
                    value={steepingDate}
                    onChange={(e) => setSteepingDate(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'লক্ষ্যমাত্রা (মন)' : 'Target Yield (Maunds)'}
                  </label>
                  <input
                    type="number"
                    value={targetYieldMaunds}
                    onChange={(e) => setTargetYieldMaunds(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('BATCHES')}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingBatch}
                  className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-md transition-all"
                >
                  {isCreatingBatch
                    ? (isBn ? 'নিবন্ধন হচ্ছে...' : 'Saving...')
                    : (isBn ? 'পচন ব্যাচ নিশ্চিত করুন' : 'Confirm Retting Batch')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: WEIGHBRIDGE FIBER ENTRY */}
        {activeTab === 'WEIGHBRIDGE' && (
          <div className="mt-6 max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {isBn ? 'ডিজিটাল ওয়েইব্রিজ আঁশ এন্ট্রি ও এসক্রো রেকর্ড' : 'Digital Weighbridge Fiber Intake'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isBn
                    ? 'আর্দ্রতা পরীক্ষা ও স্বয়ংক্রিয় ওজন সমন্বয়সহ বেল তৈরি করুন'
                    : 'Log weighbridge gross/tare weights with automatic moisture deductions'}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateLot} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lot Number</label>
                  <input
                    type="text"
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'বেলিং প্রেস / কেন্দ্রের নাম' : 'Baling Center Name'}
                  </label>
                  <input
                    type="text"
                    value={balingCenterName}
                    onChange={(e) => setBalingCenterName(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'বিজেআরআই গ্রেড' : 'BJRI Grade'}
                  </label>
                  <select
                    value={lotGrade}
                    onChange={(e) => setLotGrade(e.target.value as JuteFiberGrade)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                  >
                    <option value="BJC_SPECIAL_TOP">BJC Special Top</option>
                    <option value="BJD_GRADE_2">BJD Grade 2</option>
                    <option value="BJD_GRADE_3">BJD Grade 3</option>
                    <option value="BJD_GRADE_4">BJD Grade 4</option>
                    <option value="BWC_SPECIAL_TOP">BWC Special Top</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'বেলের ধরন' : 'Bale Type'}
                  </label>
                  <select
                    value={baleType}
                    onChange={(e) => setBaleType(e.target.value as BaleType)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                  >
                    <option value="KUTCHA_BALE_FARM">কাঁচা বেল (Kutcha Bale 120-150 kg)</option>
                    <option value="PUCCA_EXPORT_BALE">পাক্কা রপ্তানি বেল (Pucca 180 kg)</option>
                    <option value="LOOSE_MORAH_LOT">খোলা মোড়া লট (Loose Morah 40-50 kg)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'বেল সংখ্যা' : 'Bale Count'}
                  </label>
                  <input
                    type="number"
                    value={baleCount}
                    onChange={(e) => setBaleCount(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'গ্রস ওজন (কেজি)' : 'Gross (kg)'}
                  </label>
                  <input
                    type="number"
                    value={grossWeightKg}
                    onChange={(e) => setGrossWeightKg(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'ট্যার ওজন (কেজি)' : 'Tare (kg)'}
                  </label>
                  <input
                    type="number"
                    value={tareWeightKg}
                    onChange={(e) => setTareWeightKg(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'আর্দ্রতা %' : 'Moisture %'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={moisturePercentage}
                    onChange={(e) => setMoisturePercentage(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
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
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('BATCHES')}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingLot}
                  className="px-6 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-md transition-all"
                >
                  {isCreatingLot
                    ? (isBn ? 'এন্ট্রি হচ্ছে...' : 'Saving...')
                    : (isBn ? 'ওয়েইব্রিজ লট সেভ করুন' : 'Submit Weighbridge Lot')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
