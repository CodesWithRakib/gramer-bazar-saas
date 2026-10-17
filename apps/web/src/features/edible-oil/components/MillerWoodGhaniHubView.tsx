'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  PlusCircle,
  Thermometer,
  Scale,
  Award,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  Droplets,
  Edit3,
} from 'lucide-react';
import {
  useGetGhaniBatchesQuery,
  useCreateGhaniBatchMutation,
  useUpdateBatchExtractionMutation,
  useCreateArtisanalOilLotMutation,
  GhaniPressingBatch,
  OilSeedType,
  OilRegion,
  OilExtractionMethod,
  GhaniWoodType,
  PressingBatchStatus,
  OilPackagingType,
} from '../edibleOilApi';

export const MillerWoodGhaniHubView: React.FC = () => {
  const [filterRegion, setFilterRegion] = useState<OilRegion | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<PressingBatchStatus | 'ALL'>('ALL');

  // Queries
  const { data: batches = [], isLoading, refetch } = useGetGhaniBatchesQuery(
    filterRegion !== 'ALL' || filterStatus !== 'ALL'
      ? {
          region: filterRegion !== 'ALL' ? filterRegion : undefined,
          status: filterStatus !== 'ALL' ? filterStatus : undefined,
        }
      : undefined,
  );

  // Mutations
  const [createBatch, { isLoading: isCreatingBatch }] = useCreateGhaniBatchMutation();
  const [updateBatchExtraction, { isLoading: isUpdatingExtraction }] =
    useUpdateBatchExtractionMutation();
  const [createOilLot, { isLoading: isCreatingLot }] = useCreateArtisanalOilLotMutation();

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<GhaniPressingBatch | null>(null);
  const [publishingLotBatch, setPublishingLotBatch] = useState<GhaniPressingBatch | null>(null);

  // Form States - Create Batch
  const [millName, setMillName] = useState('Delduar Heritage Wood Ghani Cooperative');
  const [contactPhone, setContactPhone] = useState('+8801711223344');
  const [region, setRegion] = useState<OilRegion>('TANGAIL_DELDUAR');
  const [seedType, setSeedType] = useState<OilSeedType>('MUSTARD_MAGHI_DESHI');
  const [seedVariety, setSeedVariety] = useState('Deshi Maghi Red/Brown Seed (ছোট লাল মাঘী সরিষা)');
  const [inputSeedWeightKg, setInputSeedWeightKg] = useState<number>(500);
  const [extractionMethod] = useState<OilExtractionMethod>('WOOD_GHANI_COLD_PRESS');
  const [ghaniWoodType, setGhaniWoodType] = useState<GhaniWoodType>('TAMARIND_WOOD');
  const [maxExtractionTempCelsius, setMaxExtractionTempCelsius] = useState<number>(36.5);
  const [operatingRpm, setOperatingRpm] = useState<number>(16);
  const [crushingHours, setCrushingHours] = useState<number>(6.5);
  const [notes, setNotes] = useState('Traditional tamarind pestle; slow churning keeping heat strictly under 38°C.');
  const [createSuccessMsg, setCreateSuccessMsg] = useState('');
  const [createErrMsg, setCreateErrMsg] = useState('');

  // Form States - Update Extraction & Status
  const [updateTemp, setUpdateTemp] = useState<number>(37);
  const [updateOilLiters, setUpdateOilLiters] = useState<number>(175);
  const [updateOilcakeKg, setUpdateOilcakeKg] = useState<number>(310);
  const [updateStatus, setUpdateStatus] = useState<PressingBatchStatus>('DECANTING_SETTLING');
  const [updateNotes, setUpdateNotes] = useState('');

  // Form States - Publish Lot
  const [lotTitle, setLotTitle] = useState('');
  const [lotProducerName, setLotProducerName] = useState('');
  const [lotPackagingType, setLotPackagingType] =
    useState<OilPackagingType>('AMBER_GLASS_BOTTLE_1L');
  const [lotTotalVolume, setLotTotalVolume] = useState<number>(150);
  const [lotPricePerLiter, setLotPricePerLiter] = useState<number>(420);
  const [lotMinOrder, setLotMinOrder] = useState<number>(5);
  const [lotPungency, setLotPungency] = useState<number>(5);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState('');
  const [publishErrMsg, setPublishErrMsg] = useState('');

  // Metric aggregates
  const totalSeedsPressedKg = batches.reduce((acc, b) => acc + (b.inputSeedWeightKg || 0), 0);
  const totalOilProducedLiters = batches.reduce((acc, b) => acc + (b.extractedOilLiters || 0), 0);
  const totalOilcakeKg = batches.reduce((acc, b) => acc + (b.oilcakeWeightKg || 0), 0);
  const avgTemp =
    batches.length > 0
      ? (batches.reduce((acc, b) => acc + b.maxExtractionTempCelsius, 0) / batches.length).toFixed(1)
      : '0.0';

  const handleCreateBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSuccessMsg('');
    setCreateErrMsg('');

    try {
      await createBatch({
        millName,
        contactPhone,
        region,
        seedType,
        seedVariety,
        inputSeedWeightKg: Number(inputSeedWeightKg),
        extractionMethod,
        ghaniWoodType,
        maxExtractionTempCelsius: Number(maxExtractionTempCelsius),
        operatingRpm: Number(operatingRpm),
        crushingHours: Number(crushingHours),
        notes,
      }).unwrap();

      setCreateSuccessMsg('New ghani pressing batch registered successfully with direct wood telemetry.');
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccessMsg('');
      }, 1500);
    } catch (err: any) {
      setCreateErrMsg(err?.data?.message || 'Failed to create ghani batch.');
    }
  };

  const handleOpenEdit = (batch: GhaniPressingBatch) => {
    setEditingBatch(batch);
    setUpdateTemp(batch.maxExtractionTempCelsius);
    setUpdateOilLiters(batch.extractedOilLiters);
    setUpdateOilcakeKg(batch.oilcakeWeightKg);
    setUpdateStatus(batch.status);
    setUpdateNotes(batch.notes || '');
  };

  const handleUpdateExtractionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;

    try {
      await updateBatchExtraction({
        id: editingBatch.id,
        body: {
          maxExtractionTempCelsius: Number(updateTemp),
          extractedOilLiters: Number(updateOilLiters),
          oilcakeWeightKg: Number(updateOilcakeKg),
          status: updateStatus,
          notes: updateNotes,
        },
      }).unwrap();

      setEditingBatch(null);
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to update batch telemetry.');
    }
  };

  const handleOpenPublishLot = (batch: GhaniPressingBatch) => {
    setPublishingLotBatch(batch);
    setLotTitle(`Pure Wood-Ghani Cold-Pressed ${batch.seedType.replace(/_/g, ' ')} Oil`);
    setLotProducerName(batch.millName);
    setLotTotalVolume(batch.extractedOilLiters > 0 ? batch.extractedOilLiters : 100);
    setLotPackagingType('AMBER_GLASS_BOTTLE_1L');
    setLotPricePerLiter(420);
    setLotMinOrder(5);
    setLotPungency(5);
    setPublishSuccessMsg('');
    setPublishErrMsg('');
  };

  const handlePublishLotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishingLotBatch) return;

    try {
      await createOilLot({
        batchId: publishingLotBatch.id,
        lotTitle,
        millProducerName: lotProducerName,
        originRegion: publishingLotBatch.region,
        seedType: publishingLotBatch.seedType,
        packagingType: lotPackagingType,
        totalVolumeLiters: Number(lotTotalVolume),
        pricePerLiterBdt: Number(lotPricePerLiter),
        minimumOrderLiters: Number(lotMinOrder),
        pungencyRating: Number(lotPungency),
        isBstiCertified: true,
        isColdPressedCertified: true,
      }).unwrap();

      setPublishSuccessMsg('Artisanal lot successfully listed in the public marketplace catalog!');
      setTimeout(() => {
        setPublishingLotBatch(null);
        setPublishSuccessMsg('');
      }, 1500);
    } catch (err: any) {
      setPublishErrMsg(err?.data?.message || 'Failed to publish artisanal oil lot.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-slate-800/80 border border-amber-500/30 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            Miller & Artisanal Ghani Operator Cockpit
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100">
            Wood-Ghani Milling & Traceability Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            কাঠের ঘানি তেল উৎপাদন ব্যবস্থাপনা, তামমাত্রা নিয়ন্ত্রণ (&lt;40°C), ও খাঁটি ভোজ্যতেল লট প্রকাশনা
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Refresh Batches"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition shadow-lg shadow-amber-950/40"
          >
            <PlusCircle className="w-4 h-4" />
            Register Pressing Batch
          </button>
          <Link
            href="/edible-oil"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-sm font-semibold transition"
          >
            Public Marketplace &rarr;
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">Total Seeds Crushed</span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{totalSeedsPressedKg.toLocaleString()} kg</div>
          <span className="text-[11px] text-slate-400">Mustard, til & sunflower</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">Pure Oil Extracted</span>
            <Droplets className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{totalOilProducedLiters.toLocaleString()} L</div>
          <span className="text-[11px] text-slate-400">Cold-pressed extra virgin</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">Oilcake (খৈল) Output</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">{totalOilcakeKg.toLocaleString()} kg</div>
          <span className="text-[11px] text-slate-400">Natural cattle feed/fertilizer</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">Avg Mortar Temp</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{avgTemp}°C</div>
          <span className="text-[11px] text-emerald-400 font-semibold">&lt; 40°C Cold Press Verified</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Batches:
          </span>

          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Production Hubs</option>
            <option value="TANGAIL_DELDUAR">Tangail Delduar</option>
            <option value="MANIKGANJ_SINGAIR">Manikganj Singair</option>
            <option value="SIRAJGANJ_ULLAPARA">Sirajganj Ullapara</option>
            <option value="JASHORE_JHIKARGACHA">Jashore Jhikargacha</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Batch Stages</option>
            <option value="CRUSHING_IN_PROGRESS">Crushing In Progress</option>
            <option value="DECANTING_SETTLING">Decanting & Settling</option>
            <option value="TESTING_AND_BOTTLING">Testing & Bottling</option>
            <option value="COMPLETED_DISPATCHED">Completed & Dispatched</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="text-amber-400 font-bold">{batches.length}</span> active ghani batches
        </div>
      </div>

      {/* Batches Table / Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-800/40 rounded-2xl animate-pulse">
          Loading wood-ghani batch telemetry...
        </div>
      ) : batches.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-800/30 rounded-2xl border border-slate-800">
          No matching ghani batches found. Register a new pressing batch above.
        </div>
      ) : (
        <div className="space-y-4">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="rounded-2xl bg-slate-800/80 border border-slate-700/80 p-5 hover:border-amber-500/50 transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/30">
                    {batch.batchNumber}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {batch.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-700 text-slate-300">
                    {batch.ghaniWoodType.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100">{batch.millName}</h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {batch.region.replace(/_/g, ' ')}
                  </span>
                  <span>•</span>
                  <span>Cultivar: <strong className="text-slate-200">{batch.seedVariety}</strong></span>
                  <span>•</span>
                  <span>Speed: <strong className="text-amber-400">{batch.operatingRpm} RPM</strong></span>
                  <span>•</span>
                  <span>Duration: <strong className="text-slate-200">{batch.crushingHours} hrs</strong></span>
                </div>

                {batch.notes && (
                  <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2 rounded-lg">
                    "{batch.notes}"
                  </p>
                )}
              </div>

              {/* Extraction Metrics */}
              <div className="flex flex-wrap items-center gap-4 bg-slate-900/90 p-4 rounded-xl border border-slate-700/60 w-full lg:w-auto">
                <div className="text-center px-3">
                  <span className="text-[10px] text-slate-400 uppercase">Input Seed</span>
                  <div className="text-base font-bold text-slate-200">{batch.inputSeedWeightKg} kg</div>
                </div>

                <div className="text-center px-3 border-l border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Oil Yield</span>
                  <div className="text-base font-bold text-amber-400">{batch.extractionYieldPct}%</div>
                </div>

                <div className="text-center px-3 border-l border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Pure Oil</span>
                  <div className="text-base font-black text-emerald-400">{batch.extractedOilLiters} L</div>
                </div>

                <div className="text-center px-3 border-l border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Mortar Temp</span>
                  <div
                    className={`text-base font-black flex items-center justify-center gap-0.5 ${
                      batch.maxExtractionTempCelsius <= 40 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    <Thermometer className="w-3.5 h-3.5" />
                    {batch.maxExtractionTempCelsius}°C
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto shrink-0">
                <button
                  onClick={() => handleOpenEdit(batch)}
                  className="w-full py-2 px-3.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  Update Telemetry
                </button>
                <button
                  onClick={() => handleOpenPublishLot(batch)}
                  className="w-full py-2 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/30"
                >
                  <Award className="w-3.5 h-3.5" />
                  Publish Bottled Lot
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE BATCH MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-amber-500/40 p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-100 mb-1">
              Register New Ghani Pressing Batch
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Log seed cultivar, mortar wood species, and operating telemetry for cold-pressed oil certification.
            </p>

            {createSuccessMsg && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-xs">
                {createSuccessMsg}
              </div>
            )}
            {createErrMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-950/60 border border-rose-500 text-rose-200 text-xs">
                {createErrMsg}
              </div>
            )}

            <form onSubmit={handleCreateBatchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mill / Guild Name</label>
                <input
                  type="text"
                  required
                  value={millName}
                  onChange={(e) => setMillName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Origin Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as OilRegion)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="TANGAIL_DELDUAR">Tangail Delduar</option>
                    <option value="MANIKGANJ_SINGAIR">Manikganj Singair</option>
                    <option value="SIRAJGANJ_ULLAPARA">Sirajganj Ullapara</option>
                    <option value="JASHORE_JHIKARGACHA">Jashore Jhikargacha</option>
                    <option value="CHUADANGA_DAMURHUDA">Chuadanga Damurhuda</option>
                    <option value="NATORE_SINGRA">Natore Singra</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Seed Cultivar Type</label>
                  <select
                    value={seedType}
                    onChange={(e) => setSeedType(e.target.value as OilSeedType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="MUSTARD_MAGHI_DESHI">Mustard Maghi Deshi</option>
                    <option value="MUSTARD_BARI_14">Mustard BARI-14</option>
                    <option value="MUSTARD_TORI_7">Mustard Tori-7</option>
                    <option value="SESAME_BLACK">Sesame Black</option>
                    <option value="SESAME_WHITE">Sesame White</option>
                    <option value="SUNFLOWER_SEED">Sunflower Seed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Seed Variety Label</label>
                  <input
                    type="text"
                    required
                    value={seedVariety}
                    onChange={(e) => setSeedVariety(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Seed Weight (kg)</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={inputSeedWeightKg}
                    onChange={(e) => setInputSeedWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ghani Mortar Wood</label>
                  <select
                    value={ghaniWoodType}
                    onChange={(e) => setGhaniWoodType(e.target.value as GhaniWoodType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="TAMARIND_WOOD">Tamarind Wood (তেঁতুল)</option>
                    <option value="NEEM_WOOD">Neem Wood (নিম)</option>
                    <option value="MAHOGANY_WOOD">Mahogany Wood (মেহগনি)</option>
                    <option value="BABOOL_WOOD">Babool Wood (বাবলা)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={maxExtractionTempCelsius}
                    onChange={(e) => setMaxExtractionTempCelsius(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Speed (RPM)</label>
                  <input
                    type="number"
                    min="8"
                    max="40"
                    required
                    value={operatingRpm}
                    onChange={(e) => setOperatingRpm(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Crushing Time (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="24"
                    required
                    value={crushingHours}
                    onChange={(e) => setCrushingHours(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Process / Artisan Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingBatch}
                  className="w-1/2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition shadow-lg shadow-amber-950/40"
                >
                  {isCreatingBatch ? 'Registering...' : 'Register Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EXTRACTION TELEMETRY MODAL */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-amber-500/40 p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-1">
              Update Extraction Telemetry
            </h3>
            <p className="font-mono text-xs text-amber-400 mb-4">#{editingBatch.batchNumber}</p>

            <form onSubmit={handleUpdateExtractionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Peak Extraction Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={updateTemp}
                  onChange={(e) => setUpdateTemp(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                />
                {updateTemp > 40 && (
                  <span className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Warning: Exceeds 40°C cold-press ceiling.
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Extracted Pure Oil (Liters)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={updateOilLiters}
                  onChange={(e) => setUpdateOilLiters(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recovered Oilcake (খৈল kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={updateOilcakeKg}
                  onChange={(e) => setUpdateOilcakeKg(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Batch Stage Status
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as PressingBatchStatus)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="CRUSHING_IN_PROGRESS">Crushing In Progress</option>
                  <option value="DECANTING_SETTLING">Decanting & Settling in Stainless Vat</option>
                  <option value="TESTING_AND_BOTTLING">Testing & Bottling</option>
                  <option value="COMPLETED_DISPATCHED">Completed & Dispatched</option>
                  <option value="REJECTED_OVERHEATED">Rejected (Overheated)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  className="w-1/2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingExtraction}
                  className="w-1/2 py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition shadow-lg shadow-amber-950/40"
                >
                  {isUpdatingExtraction ? 'Saving...' : 'Save Telemetry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PUBLISH BOTTLED LOT MODAL */}
      {publishingLotBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-amber-500/40 p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-100 mb-1">
              Publish Bottled Artisanal Oil Lot
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Create a forward lot for public marketplace purchase backed by batch #{publishingLotBatch.batchNumber}.
            </p>

            {publishSuccessMsg && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-xs">
                {publishSuccessMsg}
              </div>
            )}
            {publishErrMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-950/60 border border-rose-500 text-rose-200 text-xs">
                {publishErrMsg}
              </div>
            )}

            <form onSubmit={handlePublishLotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Lot Listing Title</label>
                <input
                  type="text"
                  required
                  value={lotTitle}
                  onChange={(e) => setLotTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Producer / Cooperative Name</label>
                <input
                  type="text"
                  required
                  value={lotProducerName}
                  onChange={(e) => setLotProducerName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Packaging Vessel</label>
                  <select
                    value={lotPackagingType}
                    onChange={(e) => setLotPackagingType(e.target.value as OilPackagingType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="AMBER_GLASS_BOTTLE_500ML">Amber Glass Bottle (500 ml)</option>
                    <option value="AMBER_GLASS_BOTTLE_1L">Amber Glass Bottle (1 Liter)</option>
                    <option value="FOOD_GRADE_CAN_5L">Food-Grade Tin Can (5 Liters)</option>
                    <option value="BULK_STEEL_DRUM_200L">Bulk Stainless Drum (200 L)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total Volume (Liters)</label>
                  <input
                    type="number"
                    min="5"
                    required
                    value={lotTotalVolume}
                    onChange={(e) => setLotTotalVolume(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price / Liter (৳)</label>
                  <input
                    type="number"
                    min="50"
                    required
                    value={lotPricePerLiter}
                    onChange={(e) => setLotPricePerLiter(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Min Order (L)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={lotMinOrder}
                    onChange={(e) => setLotMinOrder(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pungency (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    required
                    value={lotPungency}
                    onChange={(e) => setLotPungency(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPublishingLotBatch(null)}
                  className="w-1/2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingLot}
                  className="w-1/2 py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition shadow-lg shadow-amber-950/40"
                >
                  {isCreatingLot ? 'Publishing...' : 'Publish to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
