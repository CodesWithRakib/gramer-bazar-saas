'use client';

import React, { useState } from 'react';
import {
  Sun,
  Flame,
  PlusCircle,
  Thermometer,
  ShieldCheck,
  Calendar,
  Layers,
  MapPin,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Award,
  RefreshCw,
  PackageCheck,
  Percent,
} from 'lucide-react';
import {
  useGetSpiceDryingBatchesQuery,
  useCreateSpiceDryingBatchMutation,
  useUpdateBatchTelemetryMutation,
  useGetSpiceForwardLotsQuery,
  useCreateSpiceForwardLotMutation,
  SpiceType,
  SpiceRegion,
  DryingMethod,
  DryingBatchStatus,
  AflatoxinRiskLevel,
  SpiceFormFactor,
  SpicePackagingType,
  SpiceDryingBatch,
} from '../spiceMarketApi';

export const GrowerSpiceDryingHubView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'batches' | 'new_batch' | 'forward_lots' | 'new_lot'>('batches');

  const { data: batches = [], isLoading: batchesLoading, refetch: refetchBatches } =
    useGetSpiceDryingBatchesQuery();
  const { data: forwardLots = [], isLoading: lotsLoading, refetch: refetchLots } =
    useGetSpiceForwardLotsQuery();

  // Create Drying Batch State
  const [growerCoopName, setGrowerCoopName] = useState('Sariakandi Char Spices Cooperative');
  const [contactPhone, setContactPhone] = useState('+8801712994411');
  const [region, setRegion] = useState<SpiceRegion>('BOGURA_SARIAKANDI_CHAR');
  const [spiceType, setSpiceType] = useState<SpiceType>('CHILLI');
  const [varietyName, setVarietyName] = useState('Bogura Char Hot Red Chilli (বগুড়া মরিচ)');
  const [initialFreshWeightKg, setInitialFreshWeightKg] = useState(3000);
  const [dryingMethod, setDryingMethod] = useState<DryingMethod>('SOLAR_PARABOLIC_TUNNEL');
  const [chamberTempCelsius, setChamberTempCelsius] = useState(48.5);
  const [chamberHumidityPct, setChamberHumidityPct] = useState(38.0);
  const [currentMoisturePct, setCurrentMoisturePct] = useState(78.0);
  const [createBatchMessage, setCreateBatchMessage] = useState('');

  const [createDryingBatch, { isLoading: isCreatingBatch }] = useCreateSpiceDryingBatchMutation();

  // Telemetry Update State
  const [selectedBatchForUpdate, setSelectedBatchForUpdate] = useState<SpiceDryingBatch | null>(null);
  const [updateTemp, setUpdateTemp] = useState(50.0);
  const [updateHumidity, setUpdateHumidity] = useState(32.0);
  const [updateMoisture, setUpdateMoisture] = useState(9.2);
  const [updateDaysElapsed, setUpdateDaysElapsed] = useState(4);
  const [updateAflatoxinRisk, setUpdateAflatoxinRisk] =
    useState<AflatoxinRiskLevel>('SAFE_ZERO_RISK');
  const [updateStatus, setUpdateStatus] =
    useState<DryingBatchStatus>('DEHYDRATION_COMPLETED');
  const [updateMessage, setUpdateMessage] = useState('');

  const [updateTelemetry, { isLoading: isUpdatingTelemetry }] = useUpdateBatchTelemetryMutation();

  // Create Forward Lot State
  const [lotTitle, setLotTitle] = useState('Pure Sun-Dehydrated Whole Red Chilli - Export Grade AAA');
  const [producerName, setProducerName] = useState('Sariakandi Char Spices Cooperative');
  const [lotRegion, setLotRegion] = useState<SpiceRegion>('BOGURA_SARIAKANDI_CHAR');
  const [lotSpiceType, setLotSpiceType] = useState<SpiceType>('CHILLI');
  const [formFactor, setFormFactor] = useState<SpiceFormFactor>('WHOLE_DRIED_POD_RHIZOME');
  const [totalQuantityKg, setTotalQuantityKg] = useState(600);
  const [packagingType, setPackagingType] = useState<SpicePackagingType>('HERMETIC_GRAINPRO_BAG_50KG');
  const [pricePerKgBdt, setPricePerKgBdt] = useState(420);
  const [minimumOrderKg, setMinimumOrderKg] = useState(50);
  const [isBstiCertified, setIsBstiCertified] = useState(true);
  const [isBarisrcVerified, setIsBarisrcVerified] = useState(true);
  const [associatedBatchId, setAssociatedBatchId] = useState('');
  const [createLotMessage, setCreateLotMessage] = useState('');

  const [createForwardLot, { isLoading: isCreatingLot }] = useCreateSpiceForwardLotMutation();

  // Handlers
  const handleCreateBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreateBatchMessage('');
      await createDryingBatch({
        growerCoopName,
        contactPhone,
        region,
        spiceType,
        varietyName,
        initialFreshWeightKg: Number(initialFreshWeightKg),
        dryingMethod,
        chamberTempCelsius: Number(chamberTempCelsius),
        chamberHumidityPct: Number(chamberHumidityPct),
        currentMoisturePct: Number(currentMoisturePct),
      }).unwrap();

      setCreateBatchMessage('Solar drying intake batch registered successfully!');
      setTimeout(() => {
        setCreateBatchMessage('');
        setActiveTab('batches');
      }, 1500);
    } catch (err: any) {
      setCreateBatchMessage(err?.data?.message || 'Failed to create drying batch.');
    }
  };

  const handleOpenUpdateModal = (batch: SpiceDryingBatch) => {
    setSelectedBatchForUpdate(batch);
    setUpdateTemp(batch.chamberTempCelsius);
    setUpdateHumidity(batch.chamberHumidityPct);
    setUpdateMoisture(batch.currentMoisturePct);
    setUpdateDaysElapsed(batch.dryingDaysElapsed);
    setUpdateAflatoxinRisk(batch.aflatoxinRiskLevel);
    setUpdateStatus(batch.status);
    setUpdateMessage('');
  };

  const handleUpdateTelemetrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForUpdate) return;
    try {
      setUpdateMessage('');
      await updateTelemetry({
        id: selectedBatchForUpdate.id,
        body: {
          chamberTempCelsius: Number(updateTemp),
          chamberHumidityPct: Number(updateHumidity),
          currentMoisturePct: Number(updateMoisture),
          dryingDaysElapsed: Number(updateDaysElapsed),
          aflatoxinRiskLevel: updateAflatoxinRisk,
          status: updateStatus,
        },
      }).unwrap();

      setUpdateMessage('Telemetry & moisture levels updated successfully!');
      setTimeout(() => {
        setSelectedBatchForUpdate(null);
        setUpdateMessage('');
      }, 1200);
    } catch (err: any) {
      setUpdateMessage(err?.data?.message || 'Failed to update chamber telemetry.');
    }
  };

  const handleCreateLotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreateLotMessage('');
      await createForwardLot({
        lotTitle,
        producerName,
        originRegion: lotRegion,
        spiceType: lotSpiceType,
        formFactor,
        totalQuantityKg: Number(totalQuantityKg),
        packagingType,
        pricePerKgBdt: Number(pricePerKgBdt),
        minimumOrderKg: Number(minimumOrderKg),
        isBstiCertified,
        isBarisrcVerified,
        dryingBatchId: associatedBatchId || undefined,
      }).unwrap();

      setCreateLotMessage('Certified pure spice forward lot published successfully!');
      setTimeout(() => {
        setCreateLotMessage('');
        setActiveTab('forward_lots');
      }, 1500);
    } catch (err: any) {
      setCreateLotMessage(err?.data?.message || 'Failed to publish spice lot.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-700 via-orange-800 to-red-900 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sun className="h-4 w-4 text-amber-300" />
              <span>Solar Parabolic Tunnel Dehydration Cockpit • সৌর ড্রায়ার ব্যবস্থাপনা</span>
            </div>
            <h1 className="mt-2 text-2xl font-black md:text-3xl">
              Grower & Cooperative Spice Drying Operations Hub
            </h1>
            <p className="mt-1 max-w-2xl text-amber-100 text-sm">
              Manage enclosed parabolic tunnel dehydrators, track real-time moisture reduction (&lt;10%),
              mitigate Aspergillus flavus mold & aflatoxin risks, and list pure spice forward lots.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('new_batch')}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 font-bold text-slate-900 shadow-md transition hover:bg-amber-400"
            >
              <PlusCircle className="h-4 w-4" />
              Log Drying Batch
            </button>
            <button
              onClick={() => setActiveTab('new_lot')}
              className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 font-bold text-white shadow-md backdrop-blur-sm transition hover:bg-white/30"
            >
              <PackageCheck className="h-4 w-4" />
              Publish Pure Lot
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Active Batches</span>
            <Flame className="h-4 w-4 text-orange-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {batches.filter((b) => b.status === 'DRYING_IN_PROGRESS').length}
          </p>
          <span className="text-xs text-amber-600 font-medium">In Parabolic Tunnels</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Dehydration Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {batches.filter((b) => b.status === 'DEHYDRATION_COMPLETED').length}
          </p>
          <span className="text-xs text-emerald-600 font-medium">Safe Moisture &lt;10%</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Aflatoxin Risk Status</span>
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {batches.filter((b) => b.aflatoxinRiskLevel === 'SAFE_ZERO_RISK').length}/{batches.length}
          </p>
          <span className="text-xs text-blue-600 font-medium">100% Zero Mold Hazard</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Published Forward Lots</span>
            <Award className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {forwardLots.length}
          </p>
          <span className="text-xs text-purple-600 font-medium">BARI SRC & BSTI Verified</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('batches')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
            activeTab === 'batches'
              ? 'border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Sun className="h-4 w-4" />
          Drying Batches ({batches.length})
        </button>
        <button
          onClick={() => setActiveTab('new_batch')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
            activeTab === 'new_batch'
              ? 'border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <PlusCircle className="h-4 w-4" />
          Log Solar Intake
        </button>
        <button
          onClick={() => setActiveTab('forward_lots')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
            activeTab === 'forward_lots'
              ? 'border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Award className="h-4 w-4" />
          Forward Lots ({forwardLots.length})
        </button>
        <button
          onClick={() => setActiveTab('new_lot')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
            activeTab === 'new_lot'
              ? 'border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <PackageCheck className="h-4 w-4" />
          Publish Lot
        </button>
      </div>

      {/* Tab 1: Drying Batches List */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Parabolic Tunnel & Drying Batches Ledger
            </h2>
            <button
              onClick={() => refetchBatches()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          {batchesLoading ? (
            <div className="py-12 text-center text-slate-500">Loading solar drying batches...</div>
          ) : batches.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              <Sun className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                No drying batches recorded yet. Click "Log Solar Intake" to start a batch.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400">
                        {batch.batchNumber}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {batch.varietyName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {batch.growerCoopName} • {batch.region.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        batch.status === 'DEHYDRATION_COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : batch.status === 'CURING_AND_CONDITIONING'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : batch.status === 'DRYING_IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      {batch.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-800/50">
                    <div>
                      <span className="text-[11px] text-slate-500">Chamber Temp</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {batch.chamberTempCelsius}°C
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500">Humidity</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {batch.chamberHumidityPct}%
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500">Moisture</span>
                      <p
                        className={`text-sm font-bold ${
                          batch.currentMoisturePct <= 10.0 ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {batch.currentMoisturePct}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Scale className="h-3.5 w-3.5 text-slate-400" />
                      Fresh: {batch.initialFreshWeightKg} kg → Dry: {batch.currentDryWeightKg} kg
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Day {batch.dryingDaysElapsed}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        batch.aflatoxinRiskLevel === 'SAFE_ZERO_RISK'
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {batch.aflatoxinRiskLevel.replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={() => handleOpenUpdateModal(batch)}
                      className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 transition hover:bg-orange-100 dark:bg-orange-950/50 dark:text-orange-300 dark:hover:bg-orange-900/60"
                    >
                      Update Telemetry
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: New Drying Batch Form */}
      {activeTab === 'new_batch' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="max-w-3xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Log New Spice Dehydration Batch
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Register fresh spices entering parabolic solar drying tunnels or mechanical biomass dryers.
            </p>

            {createBatchMessage && (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {createBatchMessage}
              </div>
            )}

            <form onSubmit={handleCreateBatchSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Grower Cooperative / Producer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={growCoopName(growerCoopName)}
                    onChange={(e) => setGrowerCoopName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Growing Region / Origin
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as SpiceRegion)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="BOGURA_SARIAKANDI_CHAR">Bogura Sariakandi Char (বগুড়া চর মরিচ)</option>
                    <option value="NATORE_GURUDASPUR">Natore Gurudaspur (নাটোর গুরুদাসপুর হলুদ)</option>
                    <option value="PABNA_SANTHIA">Pabna Santhia (পাবনা সাঁথিয়া পেঁয়াজ বীজ)</option>
                    <option value="FARIDPUR_SADAR">Faridpur Sadar (ফরিদপুর কালোজিরা ও ধনে)</option>
                    <option value="BANDARBAN_HILL_TRACTS">Bandarban Hill Tracts (বান্দরবান পাহাড়ি আদা)</option>
                    <option value="RAJBARI_PANGSHA">Rajbari Pangsha (রাজবাড়ী রসুন ও মসলা)</option>
                    <option value="LALMONIRHAT_HATIBANDHA">Lalmonirhat Hatibandha (লালমনিরহাট তিস্তা চর)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Spice Type
                  </label>
                  <select
                    value={spiceType}
                    onChange={(e) => setSpiceType(e.target.value as SpiceType)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="CHILLI">Chilli / Red Pepper (মরিচ)</option>
                    <option value="TURMERIC">Turmeric (হলুদ)</option>
                    <option value="GINGER">Ginger (আদা)</option>
                    <option value="GARLIC">Garlic (রসুন)</option>
                    <option value="CORIANDER">Coriander Seed (ধনে)</option>
                    <option value="BLACK_CUMIN">Black Cumin / Nigella (কালোজিরা)</option>
                    <option value="ONION_SEED">Onion Seed / Kalonji (পেঁয়াজ বীজ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                  Variety / Cultivar Name
                </label>
                <input
                  type="text"
                  required
                  value={varietyName}
                  onChange={(e) => setVarietyName(e.target.value)}
                  placeholder="e.g. BARI Morich-2, Dimbula Dimla, BARI Halud-4"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Initial Fresh Weight (KG)
                  </label>
                  <input
                    type="number"
                    required
                    min="50"
                    step="10"
                    value={initialFreshWeightKg}
                    onChange={(e) => setInitialFreshWeightKg(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Drying Method & Infrastructure
                  </label>
                  <select
                    value={dryingMethod}
                    onChange={(e) => setDryingMethod(e.target.value as DryingMethod)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="SOLAR_PARABOLIC_TUNNEL">Solar Parabolic Tunnel Dryer (সৌর টানেল)</option>
                    <option value="MECHANICAL_BIOMASS_DRYER">Mechanical Biomass Hybrid Dryer</option>
                    <option value="HYGIENIC_RAISED_BED_SUN">Hygienic Raised Mesh Bed Sun Drying</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Chamber Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={chamberTempCelsius}
                    onChange={(e) => setChamberTempCelsius(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Chamber Humidity (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={chamberHumidityPct}
                    onChange={(e) => setChamberHumidityPct(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Fresh Moisture (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={currentMoisturePct}
                    onChange={(e) => setCurrentMoisturePct(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCreatingBatch}
                  className="w-full rounded-xl bg-orange-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-orange-500 disabled:opacity-50"
                >
                  {isCreatingBatch ? 'Registering...' : 'Register Batch in Solar Tunnel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Forward Lots List */}
      {activeTab === 'forward_lots' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Pure Spice Forward Lots Portfolio
            </h2>
            <button
              onClick={() => refetchLots()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          {lotsLoading ? (
            <div className="py-12 text-center text-slate-500">Loading spice forward lots...</div>
          ) : forwardLots.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              <PackageCheck className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                No forward lots created yet. Click "Publish Lot" to register finished batches.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {forwardLots.map((lot) => (
                <div
                  key={lot.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400">
                        {lot.lotCode}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {lot.lotTitle}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {lot.producerName} • {lot.originRegion.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        lot.status === 'AVAILABLE_FOR_SALE'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : lot.status === 'RESERVED_CONTRACT'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {lot.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {lot.isBstiCertified && (
                      <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        <ShieldCheck className="h-3 w-3" />
                        BSTI Verified
                      </span>
                    )}
                    {lot.isBarisrcVerified && (
                      <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                        <Award className="h-3 w-3" />
                        BARI SRC Approved
                      </span>
                    )}
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {lot.packagingType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <div>
                      <span className="text-[11px] text-slate-500">Wholesale Price</span>
                      <p className="text-lg font-black text-orange-600 dark:text-orange-400">
                        ৳{lot.pricePerKgBdt} <span className="text-xs font-normal text-slate-500">/ kg</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500">Available Stock</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {lot.availableQuantityKg} / {lot.totalQuantityKg} kg
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: New Forward Lot Form */}
      {activeTab === 'new_lot' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="max-w-3xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Publish Certified Pure Spice Lot
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              List finished, dry moisture-tested spice lots for industrial B2B food processors and retail packaging contracts.
            </p>

            {createLotMessage && (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {createLotMessage}
              </div>
            )}

            <form onSubmit={handleCreateLotSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                  Lot Title
                </label>
                <input
                  type="text"
                  required
                  value={lotTitle}
                  onChange={(e) => setLotTitle(e.target.value)}
                  placeholder="e.g. Export AAA Whole Dried Turmeric Fingers (curcumin >5.2%)"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Producer / Cooperative
                  </label>
                  <input
                    type="text"
                    required
                    value={producerName}
                    onChange={(e) => setProducerName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Origin Region
                  </label>
                  <select
                    value={lotRegion}
                    onChange={(e) => setLotRegion(e.target.value as SpiceRegion)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="BOGURA_SARIAKANDI_CHAR">Bogura Sariakandi Char</option>
                    <option value="NATORE_GURUDASPUR">Natore Gurudaspur</option>
                    <option value="PABNA_SANTHIA">Pabna Santhia</option>
                    <option value="FARIDPUR_SADAR">Faridpur Sadar</option>
                    <option value="BANDARBAN_HILL_TRACTS">Bandarban Hill Tracts</option>
                    <option value="RAJBARI_PANGSHA">Rajbari Pangsha</option>
                    <option value="LALMONIRHAT_HATIBANDHA">Lalmonirhat Hatibandha</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Spice Commodity
                  </label>
                  <select
                    value={lotSpiceType}
                    onChange={(e) => setLotSpiceType(e.target.value as SpiceType)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="CHILLI">Chilli / Red Pepper</option>
                    <option value="TURMERIC">Turmeric</option>
                    <option value="GINGER">Ginger</option>
                    <option value="GARLIC">Garlic</option>
                    <option value="CORIANDER">Coriander</option>
                    <option value="BLACK_CUMIN">Black Cumin (Kalo Jeera)</option>
                    <option value="ONION_SEED">Onion Seed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Form Factor
                  </label>
                  <select
                    value={formFactor}
                    onChange={(e) => setFormFactor(e.target.value as SpiceFormFactor)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="WHOLE_DRIED_POD_RHIZOME">Whole Dried Pod / Rhizome Finger</option>
                    <option value="FINE_GROUND_POWDER">Fine Ground Pure Powder</option>
                    <option value="CRACKED_COARSE_FLAKES">Cracked Coarse Flakes</option>
                    <option value="CERTIFIED_SEED">Certified True Seed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Total Quantity (KG)
                  </label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={totalQuantityKg}
                    onChange={(e) => setTotalQuantityKg(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Packaging Standard
                  </label>
                  <select
                    value={packagingType}
                    onChange={(e) => setPackagingType(e.target.value as SpicePackagingType)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="HERMETIC_GRAINPRO_BAG_50KG">Hermetic GrainPro Ultra 50kg</option>
                    <option value="NITROGEN_FLUSHED_FOIL_POUCH_1KG">Nitrogen Flushed Foil Pouch 1kg</option>
                    <option value="JUTE_GUNNY_SACK_60KG">Breathable Food-Grade Jute Sack 60kg</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Price per KG (BDT)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={pricePerKgBdt}
                    onChange={(e) => setPricePerKgBdt(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Minimum Order Quantity (KG)
                  </label>
                  <input
                    type="number"
                    required
                    min="5"
                    value={minimumOrderKg}
                    onChange={(e) => setMinimumOrderKg(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Associate Source Drying Batch (Optional)
                  </label>
                  <select
                    value={associatedBatchId}
                    onChange={(e) => setAssociatedBatchId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">No Batch Linked</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batchNumber} - {b.varietyName} ({b.currentDryWeightKg} kg)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-6 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={isBstiCertified}
                    onChange={(e) => setIsBstiCertified(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-orange-600"
                  />
                  BSTI Chemical Purity Certified (Sudan/Lead-Free)
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={isBarisrcVerified}
                    onChange={(e) => setIsBarisrcVerified(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-orange-600"
                  />
                  BARI Spices Research Center (SRC) Origin Verified
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCreatingLot}
                  className="w-full rounded-xl bg-orange-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-orange-500 disabled:opacity-50"
                >
                  {isCreatingLot ? 'Publishing Lot...' : 'Publish Forward Lot to Marketplace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Telemetry Update Modal */}
      {selectedBatchForUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Update Chamber Telemetry & Moisture
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedBatchForUpdate.batchNumber} • {selectedBatchForUpdate.varietyName}
                </p>
              </div>
              <button
                onClick={() => setSelectedBatchForUpdate(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {updateMessage && (
              <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {updateMessage}
              </div>
            )}

            <form onSubmit={handleUpdateTelemetrySubmit} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Chamber Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={updateTemp}
                    onChange={(e) => setUpdateTemp(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Chamber Humidity (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={updateHumidity}
                    onChange={(e) => setUpdateHumidity(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Current Moisture (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={updateMoisture}
                    onChange={(e) => setUpdateMoisture(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Drying Days Elapsed
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={updateDaysElapsed}
                    onChange={(e) => setUpdateDaysElapsed(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Aflatoxin Risk Assessment
                </label>
                <select
                  value={updateAflatoxinRisk}
                  onChange={(e) => setUpdateAflatoxinRisk(e.target.value as AflatoxinRiskLevel)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="SAFE_ZERO_RISK">SAFE_ZERO_RISK (Dry & Ventilated &lt;10%)</option>
                  <option value="MODERATE_CONDENSATION_WATCH">MODERATE_CONDENSATION_WATCH (Watch Humidity)</option>
                  <option value="CRITICAL_MOLD_HAZARD">CRITICAL_MOLD_HAZARD (Mold Contamination Warning)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Batch Status
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as DryingBatchStatus)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="DRYING_IN_PROGRESS">DRYING_IN_PROGRESS (Inside Tunnel)</option>
                  <option value="CURING_AND_CONDITIONING">CURING_AND_CONDITIONING (Resting in Dark)</option>
                  <option value="DEHYDRATION_COMPLETED">DEHYDRATION_COMPLETED (Safe for Packaging)</option>
                  <option value="REJECTED_MOLD">REJECTED_MOLD (Seized / Discarded)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBatchForUpdate(null)}
                  className="w-1/2 rounded-lg border border-slate-300 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingTelemetry}
                  className="w-1/2 rounded-lg bg-orange-600 py-2.5 text-xs font-bold text-white transition hover:bg-orange-500 disabled:opacity-50"
                >
                  {isUpdatingTelemetry ? 'Updating...' : 'Save Telemetry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper to keep code clean
function growCoopName(name: string) {
  return name;
}
