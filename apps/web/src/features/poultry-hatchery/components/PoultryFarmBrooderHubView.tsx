'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Egg,
  PlusCircle,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  Thermometer,
  Wind,
  Layers,
  FileCheck,
  ShieldCheck,
  Scale,
  Sparkles,
  Phone,
  Flame,
  Gauge,
  X,
} from 'lucide-react';
import {
  useGetPoultryOverviewStatsQuery,
  useGetPoultryBatchesQuery,
  useGetBrooderTelemetryShedsQuery,
  useGetTableEggLotsQuery,
  useCreatePoultryBatchMutation,
  useRecordBrooderTelemetryMutation,
  useCreateTableEggLotMutation,
  PoultryBreedType,
  HatcheryFlockStage,
  VaccinationStatus,
} from '../poultryHatcheryApi';

interface PoultryFarmBrooderHubViewProps {
  lang: string;
}

export const PoultryFarmBrooderHubView: React.FC<PoultryFarmBrooderHubViewProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  // API Queries
  const { data: statsData } = useGetPoultryOverviewStatsQuery();
  const { data: batchesData, isLoading: batchesLoading } = useGetPoultryBatchesQuery();
  const { data: shedsData, isLoading: shedsLoading } = useGetBrooderTelemetryShedsQuery();
  const { data: eggLotsData, isLoading: eggLotsLoading } = useGetTableEggLotsQuery();

  // Mutations
  const [createBatch, { isLoading: isCreatingBatch }] = useCreatePoultryBatchMutation();
  const [recordTelemetry, { isLoading: isRecordingTelemetry }] = useRecordBrooderTelemetryMutation();
  const [createEggLot, { isLoading: isCreatingEggLot }] = useCreateTableEggLotMutation();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'BATCHES' | 'SHEDS' | 'EGGS'>('BATCHES');

  // Modals State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
  const [isEggModalOpen, setIsEggModalOpen] = useState(false);

  // New Batch Form State
  const [batchHatcheryName, setBatchHatcheryName] = useState('');
  const [batchPhone, setBatchPhone] = useState('');
  const [batchDistrict, setBatchDistrict] = useState('গাজীপুর');
  const [batchBreed, setBatchBreed] = useState<PoultryBreedType>('SONALI_CLASSIC');
  const [batchStage, setBatchStage] = useState<HatcheryFlockStage>('DAY_OLD_CHICK_DOC');
  const [batchHatchDate, setBatchHatchDate] = useState('2026-10-17');
  const [batchCount, setBatchCount] = useState(3000);
  const [batchAvgWeight, setBatchAvgWeight] = useState(42.0);
  const [batchVaccination, setBatchVaccination] = useState<VaccinationStatus>('MAREKS_DAY_1_CERTIFIED');
  const [batchCertNo, setBatchCertNo] = useState('DLS-VET-GAZ-2026');
  const [batchPrice, setBatchPrice] = useState(40.0);

  // New Telemetry Form State
  const [teleShedCode, setTeleShedCode] = useState('SHED-GAZ-01');
  const [teleTemp, setTeleTemp] = useState(33.0);
  const [teleHumidity, setTeleHumidity] = useState(60.0);
  const [teleAmmonia, setTeleAmmonia] = useState(12.5);
  const [teleFan, setTeleFan] = useState('AUTO');
  const [teleHeater, setTeleHeater] = useState('HEATING');

  // New Egg Lot Form State
  const [eggFarmName, setEggFarmName] = useState('');
  const [eggDistrict, setEggDistrict] = useState('বগুড়া');
  const [eggCollectionDate, setEggCollectionDate] = useState('2026-10-17');
  const [eggTotalCount, setEggTotalCount] = useState(7200);
  const [eggAvgWeight, setEggAvgWeight] = useState(62.0);
  const [eggPricePerHundred, setEggPricePerHundred] = useState(1150);
  const [eggCasesCount, setEggCasesCount] = useState(20);

  const stats = statsData?.data;
  const batches = batchesData?.data || [];
  const sheds = shedsData?.data || [];
  const eggLots = eggLotsData?.data || [];

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBatch({
        hatcheryName: batchHatcheryName,
        breederPhone: batchPhone,
        district: batchDistrict,
        breedType: batchBreed,
        flockStage: batchStage,
        hatchDate: batchHatchDate,
        chickCount: Number(batchCount),
        averageWeightGrams: Number(batchAvgWeight),
        vaccinationStatus: batchVaccination,
        dlsSurgeonCertificationNo: batchCertNo,
        unitPriceBdt: Number(batchPrice),
        isBiosecureCertified: true,
      }).unwrap();
      setIsBatchModalOpen(false);
      setBatchHatcheryName('');
      setBatchPhone('');
    } catch {
      // Handled
    }
  };

  const handleRecordTelemetry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recordTelemetry({
        shedCode: teleShedCode,
        temperatureCelsius: Number(teleTemp),
        relativeHumidityPercent: Number(teleHumidity),
        ammoniaPpm: Number(teleAmmonia),
        exhaustFanState: teleFan,
        brooderHeaterState: teleHeater,
      }).unwrap();
      setIsTelemetryModalOpen(false);
    } catch {
      // Handled
    }
  };

  const handleCreateEggLot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEggLot({
        farmName: eggFarmName,
        district: eggDistrict,
        collectionDate: eggCollectionDate,
        totalEggsCount: Number(eggTotalCount),
        averageEggWeightGrams: Number(eggAvgWeight),
        pricePerHundredBdt: Number(eggPricePerHundred),
        availableCasesCount: Number(eggCasesCount),
      }).unwrap();
      setIsEggModalOpen(false);
      setEggFarmName('');
    } catch {
      // Handled
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-700 via-amber-700 to-orange-800 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold tracking-wide uppercase mb-2">
              <Egg className="w-4 h-4" />
              {isBn ? 'খামারি ও হ্যাচারি অপারেশন হাব' : 'Farm & Hatchery Operator Hub'}
            </div>
            <h1 className="text-3xl font-black">
              {isBn ? 'পোল্ট্রি ব্রুডার ও এগ ম্যানেজমেন্ট কন্ট্রোল' : 'Poultry Brooder & Egg Management Hub'}
            </h1>
            <p className="text-orange-100 text-sm mt-1">
              {isBn
                ? 'বাচ্চার ব্যাচ নিবন্ধন, ব্রুডার সেন্সর ডাটা সিংক এবং টেবিল ডিমের ডিজিটাল গ্রেডিং'
                : 'Batch registration, brooder environmental IoT sync, and table egg lot grading'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white text-orange-800 font-bold hover:bg-orange-50 transition shadow-sm inline-flex items-center gap-2 text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              {isBn ? 'নতুন বাচ্চার ব্যাচ যোগ করুন' : 'Add Flock Batch'}
            </button>
            <button
              onClick={() => setIsTelemetryModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-orange-900/60 border border-white/30 text-white font-bold hover:bg-orange-900/80 transition inline-flex items-center gap-2 text-xs"
            >
              <Gauge className="w-4 h-4" />
              {isBn ? 'ব্রুডার সেন্সর সিংক' : 'Sync Brooder IoT'}
            </button>
            <button
              onClick={() => setIsEggModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 border border-amber-400 text-white font-bold hover:bg-amber-500 transition inline-flex items-center gap-2 text-xs"
            >
              <Egg className="w-4 h-4" />
              {isBn ? 'নতুন ডিমের লট গ্রেডিং' : 'Grade Egg Lot'}
            </button>
          </div>
        </div>

        {/* Quick Hub Stats */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-xs text-orange-200 uppercase font-semibold">
              {isBn ? 'সক্রিয় ব্যাচ' : 'Active Batches'}
            </div>
            <div className="text-xl font-black mt-0.5">{batches.length}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-xs text-orange-200 uppercase font-semibold">
              {isBn ? 'ব্রুডার সেন্সর শেড' : 'Monitored Sheds'}
            </div>
            <div className="text-xl font-black mt-0.5">{sheds.length}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-xs text-orange-200 uppercase font-semibold">
              {isBn ? 'ডিমের বাণিজ্যিক লট' : 'Graded Egg Lots'}
            </div>
            <div className="text-xl font-black mt-0.5">{eggLots.length}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-xs text-orange-200 uppercase font-semibold">
              {isBn ? 'বাচ্চা উৎপাদন (মোট)' : 'Total DOCs'}
            </div>
            <div className="text-xl font-black mt-0.5">
              {(stats?.totalDocProducedCount ?? 18000).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('BATCHES')}
            className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'BATCHES'
                ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {isBn ? 'হ্যাচারি ও বাচ্চার ব্যাচসমূহ' : 'Hatchery Batches'} ({batches.length})
          </button>

          <button
            onClick={() => setActiveTab('SHEDS')}
            className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'SHEDS'
                ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Gauge className="w-4 h-4" />
            {isBn ? 'ব্রুডার সেন্সর ও অ্যামোনিয়া অ্যালার্ম' : 'Brooder IoT & Ammonia Alarms'} ({sheds.length})
          </button>

          <button
            onClick={() => setActiveTab('EGGS')}
            className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'EGGS'
                ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Egg className="w-4 h-4" />
            {isBn ? 'টেবিল ডিমের লট রেজিস্ট্রি' : 'Table Egg Lots'} ({eggLots.length})
          </button>
        </div>

        {/* TAB 1: BATCHES */}
        {activeTab === 'BATCHES' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                {isBn ? 'নিবন্ধিত বাচ্চার ব্যাচ তালিকা' : 'Registered Hatchery Batches'}
              </h3>
            </div>

            {batchesLoading ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                {isBn ? 'ব্যাচ লোড হচ্ছে...' : 'Loading batches...'}
              </div>
            ) : batches.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                {isBn ? 'কোনো ব্যাচ নিবন্ধিত নেই।' : 'No batches registered yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">{isBn ? 'ব্যাচ কোড' : 'Batch Code'}</th>
                      <th className="px-4 py-3">{isBn ? 'হ্যাচারির নাম ও জেলা' : 'Hatchery & District'}</th>
                      <th className="px-4 py-3">{isBn ? 'জাত ও স্টেজ' : 'Breed & Stage'}</th>
                      <th className="px-4 py-3">{isBn ? 'বাচ্চার সংখ্যা' : 'Chick Count'}</th>
                      <th className="px-4 py-3">{isBn ? 'গড় ওজন' : 'Avg Weight'}</th>
                      <th className="px-4 py-3">{isBn ? 'টিকা সনদ' : 'Vaccination'}</th>
                      <th className="px-4 py-3">{isBn ? 'দর (প্রতি পিস)' : 'Price / Unit'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {batches.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-mono font-bold text-orange-600 dark:text-orange-400">
                          {b.batchCode}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{b.hatcheryName}</div>
                          <div className="text-xs text-slate-400">{b.district} • {b.breederPhone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{b.breedType.replace(/_/g, ' ')}</div>
                          <div className="text-xs text-slate-500">{b.flockStage.replace(/_/g, ' ')}</div>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                          {b.chickCount.toLocaleString()} {isBn ? 'টি' : 'birds'}
                        </td>
                        <td className="px-4 py-3 font-semibold">{b.averageWeightGrams} g</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            {b.vaccinationStatus.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-black text-slate-900 dark:text-slate-100">
                          ৳{b.unitPriceBdt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BROODER SHEDS */}
        {activeTab === 'SHEDS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                {isBn ? 'ব্রুডার শেড রিয়েলটাইম টেলিমেট্রি' : 'Brooder Shed IoT Telemetry'}
              </h3>
            </div>

            {shedsLoading ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                {isBn ? 'শেড ডাটা লোড হচ্ছে...' : 'Loading sheds...'}
              </div>
            ) : sheds.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                {isBn ? 'কোনো ব্রুডার সেন্সর সক্রিয় নেই।' : 'No active brooder sheds.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sheds.map((s) => {
                  const isToxic = s.ammoniaPpm > 25.0;
                  return (
                    <div
                      key={s.id}
                      className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-sm space-y-4 ${
                        isToxic ? 'border-red-400 dark:border-red-800 ring-2 ring-red-400/20' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">
                          {s.shedCode}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            s.alarmStatus === 'OPTIMAL_BROODING_ENVIRONMENT'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                          }`}
                        >
                          {s.alarmStatus === 'OPTIMAL_BROODING_ENVIRONMENT' ? 'OPTIMAL' : 'ALERT'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{s.farmName}</h4>
                        <div className="text-xs text-slate-400">{s.district}</div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Temp</div>
                          <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                            {s.temperatureCelsius}°C
                          </div>
                        </div>

                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Humidity</div>
                          <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                            {s.relativeHumidityPercent}%
                          </div>
                        </div>

                        <div
                          className={`p-2 rounded-lg border ${
                            isToxic
                              ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                              : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40'
                          }`}
                        >
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Ammonia</div>
                          <div className="text-sm font-black">{s.ammoniaPpm} ppm</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                        <span>Exhaust Fan: <strong>{s.exhaustFanState}</strong></span>
                        <span>Heater: <strong>{s.brooderHeaterState}</strong></span>
                      </div>

                      {s.alarmMessage && (
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-xs text-red-800 dark:text-red-300">
                          {s.alarmMessage}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EGG LOTS */}
        {activeTab === 'EGGS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                {isBn ? 'টেবিল ডিমের বাণিজ্যিক লটসমূহ' : 'Commercial Table Egg Lots'}
              </h3>
            </div>

            {eggLotsLoading ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                {isBn ? 'ডিমের লট লোড হচ্ছে...' : 'Loading egg lots...'}
              </div>
            ) : eggLots.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                {isBn ? 'কোনো ডিমের লট নেই।' : 'No egg lots registered.'}
              </div>
            ) : (
              <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">{isBn ? 'লট নম্বর' : 'Lot Number'}</th>
                      <th className="px-4 py-3">{isBn ? 'খামার ও জেলা' : 'Farm & District'}</th>
                      <th className="px-4 py-3">{isBn ? 'গুণগত গ্রেড' : 'Grade'}</th>
                      <th className="px-4 py-3">{isBn ? 'মোট ডিমের সংখ্যা' : 'Total Eggs'}</th>
                      <th className="px-4 py-3">{isBn ? 'উপলব্ধ কেস' : 'Cases Available'}</th>
                      <th className="px-4 py-3">{isBn ? 'গড় ওজন' : 'Avg Weight'}</th>
                      <th className="px-4 py-3">{isBn ? 'দর (প্রতি শতক)' : 'Rate / 100'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {eggLots.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                          {e.lotNumber}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{e.farmName}</div>
                          <div className="text-xs text-slate-400">{e.district}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                            {e.eggGrade.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                          {e.totalEggsCount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-semibold">{e.availableCasesCount} cases</td>
                        <td className="px-4 py-3 font-semibold">{e.averageEggWeightGrams} g</td>
                        <td className="px-4 py-3 font-black text-slate-900 dark:text-slate-100">
                          ৳{e.pricePerHundredBdt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: Create Batch Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                {isBn ? 'নতুন বাচ্চার ব্যাচ নিবন্ধন' : 'Register New Flock Batch'}
              </h3>
              <button onClick={() => setIsBatchModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">{isBn ? 'হ্যাচারির নাম' : 'Hatchery Name'}</label>
                <input
                  type="text"
                  required
                  value={batchHatcheryName}
                  onChange={(e) => setBatchHatcheryName(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  placeholder="যেমন: সোনার বাংলা হ্যাচারি"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">{isBn ? 'যোগাযোগ নম্বর' : 'Phone'}</label>
                  <input
                    type="text"
                    required
                    value={batchPhone}
                    onChange={(e) => setBatchPhone(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                    placeholder="017xxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">{isBn ? 'জেলা' : 'District'}</label>
                  <input
                    type="text"
                    required
                    value={batchDistrict}
                    onChange={(e) => setBatchDistrict(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">{isBn ? 'জাত' : 'Breed'}</label>
                  <select
                    value={batchBreed}
                    onChange={(e) => setBatchBreed(e.target.value as PoultryBreedType)}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  >
                    <option value="SONALI_CLASSIC">Sonali Classic</option>
                    <option value="BROILER_COBB_500">Broiler Cobb-500</option>
                    <option value="LAYER_HY_LINE_BROWN">Hy-Line Layer</option>
                    <option value="HAOR_BELGIAN_DUCK">Haor Duck</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">{isBn ? 'ফ্লক স্টেজ' : 'Stage'}</label>
                  <select
                    value={batchStage}
                    onChange={(e) => setBatchStage(e.target.value as HatcheryFlockStage)}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  >
                    <option value="DAY_OLD_CHICK_DOC">Day-Old-Chick (DOC)</option>
                    <option value="BROODER_NURSERY_PULLET">Brooder Nursery Pullet</option>
                    <option value="GROWER_FLOCK">Grower Flock</option>
                    <option value="FINISHER_READY_FOR_MARKET">Finisher Ready</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">{isBn ? 'সংখ্যা' : 'Count'}</label>
                  <input
                    type="number"
                    required
                    value={batchCount}
                    onChange={(e) => setBatchCount(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">{isBn ? 'গড় ওজন (g)' : 'Weight'}</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={batchAvgWeight}
                    onChange={(e) => setBatchAvgWeight(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">{isBn ? 'দর (৳)' : 'Price'}</label>
                  <input
                    type="number"
                    required
                    value={batchPrice}
                    onChange={(e) => setBatchPrice(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{isBn ? 'টিকা স্ট্যাটাস' : 'Vaccination'}</label>
                <select
                  value={batchVaccination}
                  onChange={(e) => setBatchVaccination(e.target.value as VaccinationStatus)}
                  className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                >
                  <option value="MAREKS_DAY_1_CERTIFIED">Marek Day 1 Certified</option>
                  <option value="RANIKHET_NEWCASTLE_RDV_COMPLETED">Ranikhet (RDV) Completed</option>
                  <option value="GUMBORO_IBD_BOOSTER_DONE">Gumboro (IBD) Booster Done</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{isBn ? 'ডিএলএস ভেট প্রত্যয়ন নং' : 'DLS Vet Cert'}</label>
                <input
                  type="text"
                  value={batchCertNo}
                  onChange={(e) => setBatchCertNo(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingBatch}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
                >
                  {isCreatingBatch ? 'সংরক্ষণ হচ্ছে...' : isBn ? 'ব্যাচ তৈরি করুন' : 'Save Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Telemetry Modal */}
      {isTelemetryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                {isBn ? 'ব্রুডার শেড সেন্সর রিডিং সিংক' : 'Sync Brooder Telemetry'}
              </h3>
              <button onClick={() => setIsTelemetryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordTelemetry} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">{isBn ? 'শেড কোড' : 'Shed Code'}</label>
                <input
                  type="text"
                  required
                  value={teleShedCode}
                  onChange={(e) => setTeleShedCode(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">{isBn ? 'তাপমাত্রা (°C)' : 'Temp'}</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={teleTemp}
                    onChange={(e) => setTeleTemp(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">{isBn ? 'আর্দ্রতা (%)' : 'Humidity'}</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={teleHumidity}
                    onChange={(e) => setTeleHumidity(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">{isBn ? 'অ্যামোনিয়া (ppm)' : 'Ammonia'}</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={teleAmmonia}
                    onChange={(e) => setTeleAmmonia(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">{isBn ? 'এগজস্ট ফ্যান' : 'Exhaust Fan'}</label>
                  <select
                    value={teleFan}
                    onChange={(e) => setTeleFan(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  >
                    <option value="AUTO">AUTO</option>
                    <option value="RUNNING">RUNNING</option>
                    <option value="OFF">OFF</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">{isBn ? 'হিটার' : 'Heater'}</label>
                  <select
                    value={teleHeater}
                    onChange={(e) => setTeleHeater(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  >
                    <option value="HEATING">HEATING</option>
                    <option value="STANDBY">STANDBY</option>
                    <option value="OFF">OFF</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTelemetryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isRecordingTelemetry}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
                >
                  {isRecordingTelemetry ? 'সংরক্ষণ হচ্ছে...' : isBn ? 'টেলিমেট্রি সিংক' : 'Sync IoT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Create Egg Lot Modal */}
      {isEggModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                {isBn ? 'বাণিজ্যিক ডিমের লট গ্রেডিং' : 'Grade New Table Egg Lot'}
              </h3>
              <button onClick={() => setIsEggModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEggLot} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">{isBn ? 'খামারের নাম' : 'Farm Name'}</label>
                <input
                  type="text"
                  required
                  value={eggFarmName}
                  onChange={(e) => setEggFarmName(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  placeholder="যেমন: বগুড়া গোল্ডেন এগ ফার্ম"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">{isBn ? 'জেলা' : 'District'}</label>
                  <input
                    type="text"
                    required
                    value={eggDistrict}
                    onChange={(e) => setEggDistrict(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">{isBn ? 'সংগ্রহের তারিখ' : 'Date'}</label>
                  <input
                    type="date"
                    required
                    value={eggCollectionDate}
                    onChange={(e) => setEggCollectionDate(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">{isBn ? 'মোট ডিম' : 'Total Eggs'}</label>
                  <input
                    type="number"
                    required
                    value={eggTotalCount}
                    onChange={(e) => {
                      const count = Number(e.target.value);
                      setEggTotalCount(count);
                      setEggCasesCount(Math.floor(count / 360));
                    }}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">{isBn ? 'গড় ওজন (গ্রাম)' : 'Avg Weight (g)'}</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={eggAvgWeight}
                    onChange={(e) => setEggAvgWeight(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">{isBn ? 'দর (প্রতি শতক)' : 'Rate / 100'}</label>
                  <input
                    type="number"
                    required
                    value={eggPricePerHundred}
                    onChange={(e) => setEggPricePerHundred(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">{isBn ? 'উপলব্ধ কেস' : 'Cases (360s)'}</label>
                  <input
                    type="number"
                    required
                    value={eggCasesCount}
                    onChange={(e) => setEggCasesCount(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEggModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingEggLot}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                >
                  {isCreatingEggLot ? 'গ্রেডিং হচ্ছে...' : isBn ? 'লট অনুমোদন করুন' : 'Grade & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
