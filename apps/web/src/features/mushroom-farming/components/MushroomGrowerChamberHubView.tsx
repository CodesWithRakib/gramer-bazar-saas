'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sprout,
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
  CloudFog,
  X,
  Droplets,
  Package,
} from 'lucide-react';
import {
  useGetMushroomOverviewStatsQuery,
  useGetMushroomSpawnBatchesQuery,
  useGetFruitingChambersQuery,
  useGetDehydratedMushroomLotsQuery,
  useCreateMushroomSpawnBatchMutation,
  useRecordChamberTelemetryMutation,
  useCreateDehydratedMushroomLotMutation,
  MushroomVariety,
  SpawnGenerationStage,
  MushroomProductForm,
  SubstrateSterilizationStatus,
} from '../mushroomFarmingApi';

interface MushroomGrowerChamberHubViewProps {
  lang: string;
}

export const MushroomGrowerChamberHubView: React.FC<MushroomGrowerChamberHubViewProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  // API Queries
  const { data: statsData } = useGetMushroomOverviewStatsQuery();
  const { data: spawnsData, isLoading: spawnsLoading } = useGetMushroomSpawnBatchesQuery();
  const { data: chambersData, isLoading: chambersLoading } = useGetFruitingChambersQuery();
  const { data: lotsData, isLoading: lotsLoading } = useGetDehydratedMushroomLotsQuery();

  // Mutations
  const [createSpawn, { isLoading: isCreatingSpawn }] = useCreateMushroomSpawnBatchMutation();
  const [recordTelemetry, { isLoading: isRecordingTelemetry }] = useRecordChamberTelemetryMutation();
  const [createLot, { isLoading: isCreatingLot }] = useCreateDehydratedMushroomLotMutation();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'SPAWNS' | 'CHAMBERS' | 'LOTS'>('SPAWNS');

  // Modal States
  const [isSpawnModalOpen, setIsSpawnModalOpen] = useState(false);
  const [isChamberModalOpen, setIsChamberModalOpen] = useState(false);
  const [isLotModalOpen, setIsLotModalOpen] = useState(false);

  // New Spawn Form State
  const [spawnLabName, setSpawnLabName] = useState('');
  const [spawnPhone, setSpawnPhone] = useState('');
  const [spawnDistrict, setSpawnDistrict] = useState('ঢাকা (সাভার)');
  const [spawnVariety, setSpawnVariety] = useState<MushroomVariety>('OYSTER_WHITE_PO2');
  const [spawnStage, setSpawnStage] = useState<SpawnGenerationStage>('COMMERCIAL_SAWDUST_CYLINDER');
  const [spawnDate, setSpawnDate] = useState('2026-10-17');
  const [spawnCount, setSpawnCount] = useState(1000);
  const [spawnSterilization, setSpawnSterilization] = useState<SubstrateSterilizationStatus>('AUTOCLAVE_PRESSURE_STERILIZED');
  const [spawnTemp, setSpawnTemp] = useState(121.0);
  const [spawnPsi, setSpawnPsi] = useState(15.0);
  const [spawnCertNo, setSpawnCertNo] = useState('NMDI-LAB-2026');
  const [spawnPrice, setSpawnPrice] = useState(45.0);

  // New Chamber Telemetry Form State
  const [teleChamberCode, setTeleChamberCode] = useState('CHAMBER-SVR-01');
  const [teleTemp, setTeleTemp] = useState(24.0);
  const [teleHum, setTeleHum] = useState(85.0);
  const [teleCo2, setTeleCo2] = useState(820.0);
  const [teleFogger, setTeleFogger] = useState('AUTO');
  const [teleDamper, setTeleDamper] = useState('AUTO');

  // New Dehydrated Lot Form State
  const [lotProcessorName, setLotProcessorName] = useState('');
  const [lotDistrict, setLotDistrict] = useState('ঢাকা (সাভার)');
  const [lotVariety, setLotVariety] = useState<MushroomVariety>('OYSTER_WHITE_PO2');
  const [lotProductForm, setLotProductForm] = useState<MushroomProductForm>('DEHYDRATED_DRIED_SLICES');
  const [lotDate, setLotDate] = useState('2026-10-17');
  const [lotFreshWeight, setLotFreshWeight] = useState(100.0);
  const [lotDryWeight, setLotDryWeight] = useState(10.0);
  const [lotMoisture, setLotMoisture] = useState(8.5);
  const [lotBetaGlucan, setLotBetaGlucan] = useState(25.0);
  const [lotPrice, setLotPrice] = useState(1600.0);
  const [lotStock, setLotStock] = useState(10.0);

  const stats = statsData?.data;
  const spawns = spawnsData?.data || [];
  const chambers = chambersData?.data || [];
  const lots = lotsData?.data || [];

  const handleCreateSpawn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSpawn({
        labName: spawnLabName,
        growerPhone: spawnPhone,
        district: spawnDistrict,
        variety: spawnVariety,
        generationStage: spawnStage,
        inoculationDate: spawnDate,
        packetsCount: Number(spawnCount),
        sterilizationMethod: spawnSterilization,
        autoclaveTempCelsius: Number(spawnTemp),
        autoclavePressurePsi: Number(spawnPsi),
        nmdiLabCertificationNo: spawnCertNo,
        pricePerPacketBdt: Number(spawnPrice),
        isContaminationFreeCertified: true,
      }).unwrap();
      setIsSpawnModalOpen(false);
      setSpawnLabName('');
      setSpawnPhone('');
    } catch {
      // Handled
    }
  };

  const handleRecordTelemetry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recordTelemetry({
        chamberCode: teleChamberCode,
        temperatureCelsius: Number(teleTemp),
        relativeHumidityPercent: Number(teleHum),
        co2Ppm: Number(teleCo2),
        foggerMistState: teleFogger,
        freshAirDamperState: teleDamper,
      }).unwrap();
      setIsChamberModalOpen(false);
    } catch {
      // Handled
    }
  };

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLot({
        processorName: lotProcessorName,
        district: lotDistrict,
        variety: lotVariety,
        productForm: lotProductForm,
        processingDate: lotDate,
        freshWeightKg: Number(lotFreshWeight),
        dryWeightKg: Number(lotDryWeight),
        moisturePercentage: Number(lotMoisture),
        polysaccharideBetaGlucanPercent: Number(lotBetaGlucan),
        isHermeticNitrogenSealed: true,
        pricePerKgBdt: Number(lotPrice),
        availableStockKg: Number(lotStock),
      }).unwrap();
      setIsLotModalOpen(false);
      setLotProcessorName('');
    } catch {
      // Handled
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold tracking-wide uppercase mb-2">
              <Sprout className="w-4 h-4" />
              {isBn ? 'মাশরুম খামারি ও স্পন ল্যাব হাব' : 'Grower & Spawn Lab Operator Hub'}
            </div>
            <h1 className="text-3xl font-black">
              {isBn ? 'স্পন ল্যাব ও ফ্রুটিং চেম্বার কন্ট্রোল প্যানেল' : 'Mushroom Lab & Chamber Control Hub'}
            </h1>
            <p className="text-emerald-100 text-sm mt-1">
              {isBn
                ? 'স্পন ব্যাচ নিবন্ধন, ফ্রুটিং চেম্বারের CO₂ টেলিমেট্রি সিংক এবং ড্রাই মাশরুম প্রসেসিং'
                : 'Spawn strain registration, chamber environmental telemetry sync, and dehydration packaging'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsSpawnModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-bold hover:bg-emerald-50 transition shadow-sm inline-flex items-center gap-2 text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              {isBn ? 'নতুন স্পন ব্যাচ নিবন্ধন' : 'Add Spawn Batch'}
            </button>
            <button
              onClick={() => setIsChamberModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-950/60 border border-white/30 text-white font-bold hover:bg-emerald-950/80 transition inline-flex items-center gap-2 text-xs"
            >
              <CloudFog className="w-4 h-4" />
              {isBn ? 'চেম্বার আইওটি সিংক' : 'Sync Chamber IoT'}
            </button>
            <button
              onClick={() => setIsLotModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 border border-teal-400 text-white font-bold hover:bg-teal-500 transition inline-flex items-center gap-2 text-xs"
            >
              <Package className="w-4 h-4" />
              {isBn ? 'ড্রাই মাশরুম লট যুক্ত করুন' : 'Add Dry Lot'}
            </button>
          </div>
        </div>

        {/* Hub Quick Stats */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-xs text-emerald-200 uppercase font-semibold">
              {isBn ? 'সক্রিয় স্পন ব্যাচ' : 'Active Batches'}
            </div>
            <div className="text-xl font-black mt-0.5">{spawns.length}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-xs text-emerald-200 uppercase font-semibold">
              {isBn ? 'ফ্রুটিং চেম্বার' : 'Fruiting Chambers'}
            </div>
            <div className="text-xl font-black mt-0.5">{chambers.length}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-xs text-emerald-200 uppercase font-semibold">
              {isBn ? 'ড্রাই লট স্টক' : 'Dry Lots Stock'}
            </div>
            <div className="text-xl font-black mt-0.5">
              {(stats?.totalDehydratedStockKg ?? 55.0)} kg
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-xs text-emerald-200 uppercase font-semibold">
              {isBn ? 'মোট স্পন প্যাকেট' : 'Spawn Packets'}
            </div>
            <div className="text-xl font-black mt-0.5">
              {(stats?.totalActiveSpawnPacketsCount ?? 5500).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('SPAWNS')}
            className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'SPAWNS'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {isBn ? 'স্পন ব্যাচ তালিকা' : 'Spawn Batches'} ({spawns.length})
          </button>

          <button
            onClick={() => setActiveTab('CHAMBERS')}
            className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'CHAMBERS'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <CloudFog className="w-4 h-4" />
            {isBn ? 'ফ্রুটিং চেম্বার টেলিমেট্রি' : 'Fruiting Chambers'} ({chambers.length})
          </button>

          <button
            onClick={() => setActiveTab('LOTS')}
            className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'LOTS'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Package className="w-4 h-4" />
            {isBn ? 'ড্রাই মাশরুম ও এক্সট্র্যাক্ট লট' : 'Dehydrated Lots'} ({lots.length})
          </button>
        </div>

        {/* TAB 1: SPAWN BATCHES */}
        {activeTab === 'SPAWNS' && (
          <div className="space-y-4">
            {spawnsLoading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading spawn batches...</div>
            ) : spawns.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                No spawn batches found.
              </div>
            ) : (
              <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Batch Number</th>
                      <th className="px-4 py-3">Lab & District</th>
                      <th className="px-4 py-3">Variety & Stage</th>
                      <th className="px-4 py-3">Packets</th>
                      <th className="px-4 py-3">Autoclave Spec</th>
                      <th className="px-4 py-3">Inoculation</th>
                      <th className="px-4 py-3">Price / Pkt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {spawns.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {s.batchNumber}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{s.labName}</div>
                          <div className="text-xs text-slate-400">{s.district} • {s.growerPhone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{s.variety.replace(/_/g, ' ')}</div>
                          <div className="text-xs text-slate-500">{s.generationStage.replace(/_/g, ' ')}</div>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                          {s.packetsCount.toLocaleString()} pkts
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                          {s.autoclaveTempCelsius}°C / {s.autoclavePressurePsi} psi
                        </td>
                        <td className="px-4 py-3">{s.inoculationDate}</td>
                        <td className="px-4 py-3 font-black text-slate-900 dark:text-slate-100">
                          ৳{s.pricePerPacketBdt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CHAMBERS */}
        {activeTab === 'CHAMBERS' && (
          <div className="space-y-4">
            {chambersLoading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading chambers...</div>
            ) : chambers.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                No active chambers.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {chambers.map((c) => {
                  const isOptimal = c.alarmStatus === 'OPTIMAL_GROWTH_CLIMATE';
                  return (
                    <div
                      key={c.id}
                      className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-sm space-y-4 ${
                        isOptimal ? 'border-slate-200 dark:border-slate-800' : 'border-red-400 dark:border-red-800 ring-2 ring-red-400/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">
                          {c.chamberCode}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isOptimal ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50' : 'bg-red-100 text-red-800 dark:bg-red-900/50'
                          }`}
                        >
                          {isOptimal ? 'OPTIMAL' : 'ALERT'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{c.farmName}</h4>
                        <div className="text-xs text-slate-400">{c.district}</div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Temp</div>
                          <div className="text-sm font-black text-slate-900 dark:text-slate-100">{c.temperatureCelsius}°C</div>
                        </div>

                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Humidity</div>
                          <div className="text-sm font-black text-slate-900 dark:text-slate-100">{c.relativeHumidityPercent}%</div>
                        </div>

                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">CO₂ Gas</div>
                          <div className="text-sm font-black text-slate-900 dark:text-slate-100">{c.co2Ppm} ppm</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                        <span>Damper: <strong>{c.freshAirDamperState}</strong></span>
                        <span>Fogger: <strong>{c.foggerMistState}</strong></span>
                      </div>

                      {c.alarmMessage && (
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-xs text-red-800 dark:text-red-300">
                          {c.alarmMessage}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DEHYDRATED LOTS */}
        {activeTab === 'LOTS' && (
          <div className="space-y-4">
            {lotsLoading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading lots...</div>
            ) : lots.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                No lots registered.
              </div>
            ) : (
              <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Lot Code</th>
                      <th className="px-4 py-3">Processor</th>
                      <th className="px-4 py-3">Form & Variety</th>
                      <th className="px-4 py-3">Dry Stock</th>
                      <th className="px-4 py-3">Final Moisture</th>
                      <th className="px-4 py-3">Beta-Glucan</th>
                      <th className="px-4 py-3">Rate / kg</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {lots.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-mono font-bold text-teal-600 dark:text-teal-400">
                          {l.lotCode}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{l.processorName}</div>
                          <div className="text-xs text-slate-400">{l.district}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{l.productForm.replace(/_/g, ' ')}</div>
                          <div className="text-xs text-slate-500">{l.variety.replace(/_/g, ' ')}</div>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                          {l.availableStockKg} kg
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-600">
                          {l.moisturePercentage}%
                        </td>
                        <td className="px-4 py-3 font-semibold text-teal-600">
                          {l.polysaccharideBetaGlucanPercent ? `${l.polysaccharideBetaGlucanPercent}%` : 'N/A'}
                        </td>
                        <td className="px-4 py-3 font-black text-slate-900 dark:text-slate-100">
                          ৳{l.pricePerKgBdt}
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

      {/* MODAL 1: Add Spawn Batch */}
      {isSpawnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                {isBn ? 'নতুন স্পন ব্যাচ নিবন্ধন' : 'Register New Spawn Batch'}
              </h3>
              <button onClick={() => setIsSpawnModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSpawn} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Lab / Center Name</label>
                <input
                  type="text"
                  required
                  value={spawnLabName}
                  onChange={(e) => setSpawnLabName(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  placeholder="যেমন: সাভার জাতীয় মাশরুম উন্নয়ন ল্যাব"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={spawnPhone}
                    onChange={(e) => setSpawnPhone(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={spawnDistrict}
                    onChange={(e) => setSpawnDistrict(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Variety</label>
                  <select
                    value={spawnVariety}
                    onChange={(e) => setSpawnVariety(e.target.value as MushroomVariety)}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  >
                    <option value="OYSTER_WHITE_PO2">Oyster White PO-2</option>
                    <option value="OYSTER_GREY_HK51">Oyster Grey HK-51</option>
                    <option value="MILKY_WHITE_SUMMER">Milky White Summer</option>
                    <option value="BUTTON_AGARICUS_WINTER">Button Agaricus</option>
                    <option value="GANODERMA_REISHI_MEDICINAL">Ganoderma Reishi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Stage</label>
                  <select
                    value={spawnStage}
                    onChange={(e) => setSpawnStage(e.target.value as SpawnGenerationStage)}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  >
                    <option value="COMMERCIAL_SAWDUST_CYLINDER">Commercial Sawdust Cylinder</option>
                    <option value="PRIMARY_GRAIN_SPAWN">Primary Grain Spawn</option>
                    <option value="MOTHER_TISSUE_CULTURE_SLANT">Mother Tissue Culture</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">Packets</label>
                  <input
                    type="number"
                    required
                    value={spawnCount}
                    onChange={(e) => setSpawnCount(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Autoclave (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={spawnTemp}
                    onChange={(e) => setSpawnTemp(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Price (৳)</label>
                  <input
                    type="number"
                    required
                    value={spawnPrice}
                    onChange={(e) => setSpawnPrice(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">NMDI Lab Certificate No</label>
                <input
                  type="text"
                  value={spawnCertNo}
                  onChange={(e) => setSpawnCertNo(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSpawnModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSpawn}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  {isCreatingSpawn ? 'Saving...' : 'Save Spawn Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Chamber Telemetry */}
      {isChamberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                {isBn ? 'চেম্বার ক্লাইমেট আইওটি সিংক' : 'Sync Chamber Telemetry'}
              </h3>
              <button onClick={() => setIsChamberModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordTelemetry} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Chamber Code</label>
                <input
                  type="text"
                  required
                  value={teleChamberCode}
                  onChange={(e) => setTeleChamberCode(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={teleTemp}
                    onChange={(e) => setTeleTemp(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Humidity (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={teleHum}
                    onChange={(e) => setTeleHum(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">CO₂ (ppm)</label>
                  <input
                    type="number"
                    required
                    value={teleCo2}
                    onChange={(e) => setTeleCo2(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Fresh Air Damper</label>
                  <select
                    value={teleDamper}
                    onChange={(e) => setTeleDamper(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  >
                    <option value="AUTO">AUTO</option>
                    <option value="OPEN_VENTILATING">OPEN_VENTILATING</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Ultrasonic Fogger</label>
                  <select
                    value={teleFogger}
                    onChange={(e) => setTeleFogger(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  >
                    <option value="AUTO">AUTO</option>
                    <option value="RUNNING">RUNNING</option>
                    <option value="OFF">OFF</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsChamberModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecordingTelemetry}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  {isRecordingTelemetry ? 'Syncing...' : 'Sync Telemetry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Create Dehydrated Lot */}
      {isLotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                {isBn ? 'ড্রাই মাশরুম লট যুক্তকরণ' : 'Add Dehydrated Lot'}
              </h3>
              <button onClick={() => setIsLotModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLot} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Processor Name</label>
                <input
                  type="text"
                  required
                  value={lotProcessorName}
                  onChange={(e) => setLotProcessorName(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  placeholder="যেমন: সাভার অর্গানিক মাশরুম ফুডস"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={lotDistrict}
                    onChange={(e) => setLotDistrict(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Variety</label>
                  <select
                    value={lotVariety}
                    onChange={(e) => setLotVariety(e.target.value as MushroomVariety)}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  >
                    <option value="OYSTER_WHITE_PO2">Oyster White PO-2</option>
                    <option value="GANODERMA_REISHI_MEDICINAL">Ganoderma Reishi</option>
                    <option value="MILKY_WHITE_SUMMER">Milky White Summer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Product Form</label>
                  <select
                    value={lotProductForm}
                    onChange={(e) => setLotProductForm(e.target.value as MushroomProductForm)}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  >
                    <option value="DEHYDRATED_DRIED_SLICES">Dehydrated Dried Slices</option>
                    <option value="MEDICINAL_EXTRACT_POWDER">Medicinal Extract Powder</option>
                    <option value="FRESH_HARVEST_CRATES">Fresh Harvest Crates</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Processing Date</label>
                  <input
                    type="date"
                    required
                    value={lotDate}
                    onChange={(e) => setLotDate(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Fresh Weight (kg)</label>
                  <input
                    type="number"
                    required
                    value={lotFreshWeight}
                    onChange={(e) => setLotFreshWeight(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Dry Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={lotDryWeight}
                    onChange={(e) => {
                      const dry = Number(e.target.value);
                      setLotDryWeight(dry);
                      setLotStock(dry);
                    }}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Final Moisture (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={lotMoisture}
                    onChange={(e) => setLotMoisture(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Rate / kg (৳)</label>
                  <input
                    type="number"
                    required
                    value={lotPrice}
                    onChange={(e) => setLotPrice(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLotModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingLot}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
                >
                  {isCreatingLot ? 'Saving...' : 'Save Lot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
