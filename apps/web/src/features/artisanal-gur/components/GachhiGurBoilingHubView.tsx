'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Thermometer,
  Layers,
  Scale,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  MapPin,
  Clock,
  Gauge,
  X,
  Send,
  Droplets,
  Share2,
} from 'lucide-react';
import {
  useGetTappingBatchesQuery,
  useCreateTappingBatchMutation,
  useUpdateBatchBoilingMutation,
  useCreateArtisanalLotMutation,
  DatePalmTappingBatch,
  GurType,
  GurRegion,
  SapCollectionShift,
  BoilingPanType,
  GurPackagingType,
} from '../artisanalGurApi';

export const GachhiGurBoilingHubView: React.FC = () => {
  const { data: batches = [], isLoading } = useGetTappingBatchesQuery();

  // Create Batch Modal State
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [coopName, setCoopName] = useState('Jhikargacha Traditional Gachhi Cooperative');
  const [contactPhone, setContactPhone] = useState('+8801711229988');
  const [region, setRegion] = useState<GurRegion>('JASHORE_JHIKARGACHA');
  const [gurType, setGurType] = useState<GurType>('DATE_PALM_NOLEN_JHOLA');
  const [shift, setShift] = useState<SapCollectionShift>('DAWN_JIRAN_PREMIUM');
  const [treesCount, setTreesCount] = useState<number>(80);
  const [sapLiters, setSapLiters] = useState<number>(450);
  const [sapBrix, setSapBrix] = useState<number>(13.8);
  const [strikeTemp, setStrikeTemp] = useState<number>(115.5);
  const [panType, setPanType] = useState<BoilingPanType>('TRADITIONAL_IRON_KARAI');
  const [notes, setNotes] = useState('Dawn Jiran collection boiled with date palm leaves.');

  const [createBatchMutation, { isLoading: isCreatingBatch }] = useCreateTappingBatchMutation();

  // Update Boiling Telemetry State
  const [selectedBatchForUpdate, setSelectedBatchForUpdate] = useState<DatePalmTappingBatch | null>(null);
  const [updateStrikeTemp, setUpdateStrikeTemp] = useState<number>(116.0);
  const [updateProducedWeight, setUpdateProducedWeight] = useState<number>(53.0);
  const [updateStatus, setUpdateStatus] = useState<string>('BOILING_COMPLETED');
  const [updateNotes, setUpdateNotes] = useState('');

  const [updateBoilingMutation, { isLoading: isUpdatingBoiling }] = useUpdateBatchBoilingMutation();

  // Publish Lot Modal State
  const [selectedBatchForPublish, setSelectedBatchForPublish] = useState<DatePalmTappingBatch | null>(null);
  const [lotTitle, setLotTitle] = useState('');
  const [packagingType, setPackagingType] = useState<GurPackagingType>('TRADITIONAL_EARTHEN_POT_1KG');
  const [lotTotalWeightKg, setLotTotalWeightKg] = useState<number>(50);
  const [pricePerKgBdt, setPricePerKgBdt] = useState<number>(450);
  const [minOrderKg, setMinOrderKg] = useState<number>(2);
  const [aromaRating, setAromaRating] = useState<number>(5);

  const [createLotMutation, { isLoading: isPublishingLot }] = useCreateArtisanalLotMutation();

  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    try {
      await createBatchMutation({
        gachhiCoopName: coopName,
        contactPhone,
        region,
        gurType,
        sapCollectionShift: shift,
        treesTappedCount: treesCount,
        rawSapVolumeLiters: sapLiters,
        sapBrixDegrees: sapBrix,
        strikeBoilingTempCelsius: strikeTemp,
        panType,
        notes,
      }).unwrap();

      setStatusMessage({ text: 'Dawn sap collection & boiling batch logged successfully!', isError: false });
      setIsCreateBatchOpen(false);
    } catch (err: any) {
      setStatusMessage({ text: err?.data?.message || 'Failed to create tapping batch', isError: true });
    }
  };

  const handleUpdateBoiling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForUpdate) return;
    setStatusMessage(null);

    try {
      await updateBoilingMutation({
        id: selectedBatchForUpdate.id,
        body: {
          strikeBoilingTempCelsius: updateStrikeTemp,
          producedGurWeightKg: updateProducedWeight,
          status: updateStatus,
          notes: updateNotes,
        },
      }).unwrap();

      setStatusMessage({ text: 'Boiling telemetry & output weight updated!', isError: false });
      setSelectedBatchForUpdate(null);
    } catch (err: any) {
      setStatusMessage({ text: err?.data?.message || 'Failed to update boiling telemetry', isError: true });
    }
  };

  const handlePublishLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForPublish) return;
    setStatusMessage(null);

    try {
      await createLotMutation({
        title: lotTitle || `${selectedBatchForPublish.gachhiCoopName} - Pure Gur Lot`,
        gurType: selectedBatchForPublish.gurType,
        originRegion: selectedBatchForPublish.region,
        gachhiCoopName: selectedBatchForPublish.gachhiCoopName,
        packagingType,
        totalWeightKg: lotTotalWeightKg,
        pricePerKgBdt,
        minimumOrderKg: minOrderKg,
        aromaRating,
        isGiTagged: selectedBatchForPublish.region.includes('JASHORE'),
        isHydrosulfiteFreeCertified: true,
      }).unwrap();

      setStatusMessage({ text: 'Artisanal Gur Lot published to marketplace catalog!', isError: false });
      setSelectedBatchForPublish(null);
    } catch (err: any) {
      setStatusMessage({ text: err?.data?.message || 'Failed to publish lot', isError: true });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-amber-50 py-10 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-600 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                Gachhi & Producer Guild
              </span>
              <span className="text-xs text-amber-300">গাছি সমবায় ও কড়াই জ্বাল নিয়ন্ত্রণ কেন্দ্র</span>
            </div>
            <h1 className="text-3xl font-black font-serif tracking-tight">
              Gachhi Tapping & Karai Boiling Hub
            </h1>
            <p className="mt-1 text-sm text-amber-200/90 max-w-2xl">
              Log dawn Jiran sap intake, monitor boiling strike temperature (115°C–120°C), avoid scorch aroma degradation, and publish authentic earthen-pot lots.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsCreateBatchOpen(true)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Log Dawn Sap Collection
            </button>
            <Link
              href="/artisanal-gur"
              className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-sm font-semibold transition-colors border border-amber-500/40"
            >
              View Public Marketplace
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {statusMessage && (
          <div
            className={`p-4 rounded-xl border text-xs font-medium mb-6 flex items-center gap-2 ${
              statusMessage.isError
                ? 'bg-red-50 text-red-900 border-red-300'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300'
            }`}
          >
            {statusMessage.isError ? (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Guild Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <div className="text-xs text-stone-500 uppercase font-semibold">Logged Batches</div>
            <div className="text-2xl font-bold text-amber-900 mt-1">{batches.length}</div>
            <div className="text-[11px] text-stone-400 mt-0.5">Morning & Afternoon Shifts</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <div className="text-xs text-stone-500 uppercase font-semibold">Total Trees Tapped</div>
            <div className="text-2xl font-bold text-stone-900 mt-1">
              {batches.reduce((acc, b) => acc + (b.treesTappedCount || 0), 0)} Trees
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">Heritage Date Palms</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <div className="text-xs text-stone-500 uppercase font-semibold">Total Raw Sap Intake</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">
              {batches.reduce((acc, b) => acc + (b.rawSapVolumeLiters || 0), 0)} L
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">Dawn Jiran & Sweet Intake</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <div className="text-xs text-stone-500 uppercase font-semibold">Produced Artisanal Gur</div>
            <div className="text-2xl font-bold text-emerald-800 mt-1">
              {batches.reduce((acc, b) => acc + (b.producedGurWeightKg || 0), 0)} kg
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">Avg Ratio: ~8.4 : 1</div>
          </div>
        </div>

        {/* Batches Table */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-stone-200 flex items-center justify-between">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-700" />
              Active Tapping Batches & Open Karai Furnaces
            </h3>
            <span className="text-xs text-stone-500">Live Telemetry Ledger</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Batch Code</th>
                  <th className="px-5 py-3">Region & Guild</th>
                  <th className="px-5 py-3">Shift & Sap (L)</th>
                  <th className="px-5 py-3">Brix Density</th>
                  <th className="px-5 py-3">Strike Boiling Temp</th>
                  <th className="px-5 py-3">Output Gur (Kg)</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-stone-500">
                      Loading gachhi batches...
                    </td>
                  </tr>
                ) : batches.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-stone-500">
                      No tapping batches registered yet. Log a new batch above.
                    </td>
                  </tr>
                ) : (
                  batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-amber-900">
                        {batch.batchNumber}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-stone-900">{batch.gachhiCoopName}</div>
                        <div className="text-[11px] text-stone-400">{batch.region.replace(/_/g, ' ')}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-stone-800">{batch.rawSapVolumeLiters} L</div>
                        <div className="text-[11px] text-blue-700">
                          {batch.sapCollectionShift === 'DAWN_JIRAN_PREMIUM' ? 'Dawn Jiran' : 'Standard'}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium">{batch.sapBrixDegrees}° Brix</td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-red-700 flex items-center gap-1">
                          <Thermometer className="w-3.5 h-3.5" />
                          {batch.strikeBoilingTempCelsius}°C
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {batch.strikeBoilingTempCelsius > 123 ? 'Scorched Risk' : 'Optimal'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-amber-950">{batch.producedGurWeightKg} kg</div>
                        <div className="text-[11px] text-stone-500">Ratio: {batch.sapToGurRatio}:1</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-amber-100 text-amber-900">
                          {batch.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBatchForUpdate(batch);
                            setUpdateStrikeTemp(batch.strikeBoilingTempCelsius || 116.0);
                            setUpdateProducedWeight(batch.producedGurWeightKg || 50.0);
                            setUpdateStatus(batch.status || 'BOILING_COMPLETED');
                            setUpdateNotes(batch.notes || '');
                          }}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-medium text-[11px] transition-colors"
                        >
                          Telemetry
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBatchForPublish(batch);
                            setLotTitle(`${batch.gachhiCoopName} - 100% Pure Nolen Gur`);
                            setLotTotalWeightKg(batch.producedGurWeightKg > 0 ? batch.producedGurWeightKg : 50);
                          }}
                          className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded font-medium text-[11px] transition-colors"
                        >
                          Publish Lot
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal 1: Log Dawn Sap Collection */}
      {isCreateBatchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative">
            <button
              onClick={() => setIsCreateBatchOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-amber-700" />
              <h3 className="font-bold text-lg text-stone-900">Log Dawn Sap & Boiling Batch</h3>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Enter morning harvest telemetry from date palm tree tapping to open iron karai strike boiling.
            </p>

            <form onSubmit={handleCreateBatch} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Cooperative / Gachhi Name
                </label>
                <input
                  type="text"
                  required
                  value={coopName}
                  onChange={(e) => setCoopName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  >
                    <option value="JASHORE_JHIKARGACHA">Jashore Jhikargacha</option>
                    <option value="JASHORE_KOTWALI">Jashore Kotwali</option>
                    <option value="CHUADANGA_DAMURHUDA">Chuadanga Damurhuda</option>
                    <option value="KUSHTIA_KUMARKHALI">Kushtia Kumarkhali</option>
                    <option value="FARIDPUR_SADAR">Faridpur Sadar</option>
                    <option value="NATORE_LALPUR">Natore Lalpur</option>
                    <option value="RAJSHAHI_BAGHA">Rajshahi Bagha</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Gur Variety</label>
                  <select
                    value={gurType}
                    onChange={(e) => setGurType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  >
                    <option value="DATE_PALM_NOLEN_JHOLA">Date Palm Nolen Jhola</option>
                    <option value="DATE_PALM_PATALI_SOLID">Date Palm Patali Solid</option>
                    <option value="DATE_PALM_DANADAR">Date Palm Danadar</option>
                    <option value="SUGARCANE_ORGANIC_SOLID">Sugarcane Organic Solid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Shift</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  >
                    <option value="DAWN_JIRAN_PREMIUM">Dawn Jiran Sap (Premium)</option>
                    <option value="DAY_DAULA_STANDARD">Day Daula Sap</option>
                    <option value="EVENING_SWEET_INTAKE">Evening Sap</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Trees Tapped</label>
                  <input
                    type="number"
                    min="1"
                    value={treesCount}
                    onChange={(e) => setTreesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Sap Liters</label>
                  <input
                    type="number"
                    min="10"
                    value={sapLiters}
                    onChange={(e) => setSapLiters(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Brix Density</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sapBrix}
                    onChange={(e) => setSapBrix(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Strike Temp °C</label>
                  <input
                    type="number"
                    step="0.5"
                    value={strikeTemp}
                    onChange={(e) => setStrikeTemp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Boiling Pan Type</label>
                <select
                  value={panType}
                  onChange={(e) => setPanType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                >
                  <option value="TRADITIONAL_IRON_KARAI">Traditional Iron Karai / Tawa (লোহার কড়াই)</option>
                  <option value="STAINLESS_STEEL_PAN">Food-Grade Stainless Steel Pan</option>
                  <option value="EARTHEN_PIT_FURNACE">Artisanal Earthen Pit Furnace</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateBatchOpen(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingBatch}
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold"
                >
                  {isCreatingBatch ? 'Saving...' : 'Register Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Update Boiling Telemetry */}
      {selectedBatchForUpdate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative">
            <button
              onClick={() => setSelectedBatchForUpdate(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-stone-900 mb-1">Update Strike Boiling Telemetry</h3>
            <p className="text-xs text-stone-500 mb-4">
              Batch: {selectedBatchForUpdate.batchNumber} - {selectedBatchForUpdate.gachhiCoopName}
            </p>

            <form onSubmit={handleUpdateBoiling} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Final Strike Temp (°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={updateStrikeTemp}
                  onChange={(e) => setUpdateStrikeTemp(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Finished Gur Output (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={updateProducedWeight}
                  onChange={(e) => setUpdateProducedWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Batch Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                >
                  <option value="BOILING_IN_PROGRESS">Boiling In Progress</option>
                  <option value="BOILING_COMPLETED">Boiling Completed (Strike Struck)</option>
                  <option value="MOLD_CRYSTALLIZATION">Mold Crystallization (হাঁড়ি / ছাঁচ)</option>
                  <option value="READY_FOR_PACKAGING">Ready for Packaging</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Tapper Notes</label>
                <textarea
                  rows={2}
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="Aroma intensity, crystallization speed..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBatchForUpdate(null)}
                  className="px-4 py-2 bg-stone-200 text-stone-800 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingBoiling}
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold"
                >
                  {isUpdatingBoiling ? 'Updating...' : 'Save Telemetry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Publish Lot to Marketplace */}
      {selectedBatchForPublish && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative">
            <button
              onClick={() => setSelectedBatchForPublish(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-stone-900 mb-1">
              Publish Artisanal Gur Lot to Marketplace
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              From Batch: {selectedBatchForPublish.batchNumber} ({selectedBatchForPublish.region.replace(/_/g, ' ')})
            </p>

            <form onSubmit={handlePublishLot} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Lot Title</label>
                <input
                  type="text"
                  required
                  value={lotTitle}
                  onChange={(e) => setLotTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Packaging</label>
                  <select
                    value={packagingType}
                    onChange={(e) => setPackagingType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  >
                    <option value="TRADITIONAL_EARTHEN_POT_1KG">Traditional Earthen Pot (1kg)</option>
                    <option value="FOOD_GRADE_GLASS_JAR_500G">Glass Jar (500g)</option>
                    <option value="FOOD_GRADE_GLASS_JAR_1KG">Glass Jar (1kg)</option>
                    <option value="BAMBOO_LEAF_PATALI_BLOCK_2KG">Bamboo Leaf Patali (2kg)</option>
                    <option value="BULK_FOOD_TIN_10KG">Bulk Food Tin (10kg)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Total Weight (kg)</label>
                  <input
                    type="number"
                    min="1"
                    value={lotTotalWeightKg}
                    onChange={(e) => setLotTotalWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Price / kg (৳)</label>
                  <input
                    type="number"
                    min="100"
                    value={pricePerKgBdt}
                    onChange={(e) => setPricePerKgBdt(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Min Order (kg)</label>
                  <input
                    type="number"
                    min="1"
                    value={minOrderKg}
                    onChange={(e) => setMinOrderKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Aroma Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={aromaRating}
                    onChange={(e) => setAromaRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBatchForPublish(null)}
                  className="px-4 py-2 bg-stone-200 text-stone-800 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishingLot}
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold"
                >
                  {isPublishingLot ? 'Publishing...' : 'Publish Lot for Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
