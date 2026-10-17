'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Thermometer,
  Truck,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  RefreshCw,
  Clock,
  Filter,
} from 'lucide-react';
import {
  useGetPhytosanitaryHwtBatchesQuery,
  useCreatePhytosanitaryHwtBatchMutation,
  useGetOrchardDispatchesQuery,
  useUpdateDispatchColdChainMutation,
  FruitType,
  FruitCultivar,
  ChemicalMrlStatus,
  ColdChainTransitStatus,
} from '../orchardAuctionApi';

export const AdminPhytosanitaryQuarantineHubView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hwt_batches' | 'new_batch' | 'reefer_supervision'>('hwt_batches');

  const { data: hwtBatches = [], isLoading: hwtLoading, refetch: refetchHwt } =
    useGetPhytosanitaryHwtBatchesQuery();
  const { data: dispatches = [], isLoading: dispLoading, refetch: refetchDisp } =
    useGetOrchardDispatchesQuery();

  // New HWT Batch Form State
  const [orchardName, setOrchardName] = useState('Mahananda Riverbank Heritage Mango Orchard');
  const [fruitType, setFruitType] = useState<FruitType>('MANGO');
  const [cultivar, setCultivar] = useState<FruitCultivar>('KHIRSAPAT_HIMSAGAR');
  const [totalFreshWeightKg, setTotalFreshWeightKg] = useState(2500);
  const [cratesCount, setCratesCount] = useState(125);
  const [hwtFacilityLocation, setHwtFacilityLocation] = useState('Central Packing House, Shyampur, Dhaka');
  const [waterTempCelsius, setWaterTempCelsius] = useState(48.0);
  const [immersionDurationMinutes, setImmersionDurationMinutes] = useState(60);
  const [fruitCoreTempCelsius, setFruitCoreTempCelsius] = useState(46.8);
  const [hydrocoolingTempCelsius, setHydrocoolingTempCelsius] = useState(25.8);
  const [chemicalMrlStatus, setChemicalMrlStatus] =
    useState<ChemicalMrlStatus>('TEST_PASSED_MRL_SAFE');
  const [pesticideMrlPpm, setPesticideMrlPpm] = useState(0.015);
  const [inspectorName, setInspectorName] = useState('Dr. Md. Nazmul Huda');
  const [inspectorDesignation, setInspectorDesignation] =
    useState('DAE Senior Plant Quarantine Entomologist');
  const [hwtFormMessage, setHwtFormMessage] = useState('');

  const [createHwtBatch, { isLoading: isCreatingHwt }] =
    useCreatePhytosanitaryHwtBatchMutation();

  // Cold Chain Telemetry Update Modal State
  const [selectedDispatchId, setSelectedDispatchId] = useState<string | null>(null);
  const [updateTemp, setUpdateTemp] = useState(11.2);
  const [updateHumidity, setUpdateHumidity] = useState(88.0);
  const [updateStatus, setUpdateStatus] = useState<ColdChainTransitStatus>('OPTIMAL_CHILLED');
  const [updateMessage, setUpdateMessage] = useState('');

  const [updateColdChain, { isLoading: isUpdatingColdChain }] =
    useUpdateDispatchColdChainMutation();

  const handleCreateHwtBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setHwtFormMessage('');
      await createHwtBatch({
        orchardName,
        fruitType,
        cultivar,
        totalFreshWeightKg: Number(totalFreshWeightKg),
        cratesCount: Number(cratesCount),
        hwtFacilityLocation,
        waterTempCelsius: Number(waterTempCelsius),
        immersionDurationMinutes: Number(immersionDurationMinutes),
        fruitCoreTempCelsius: Number(fruitCoreTempCelsius),
        hydrocoolingTempCelsius: Number(hydrocoolingTempCelsius),
        chemicalMrlStatus,
        pesticideMrlPpm: Number(pesticideMrlPpm),
        inspectorName,
        inspectorDesignation,
      }).unwrap();

      setHwtFormMessage('Phytosanitary HWT Batch created & certified successfully!');
      setTimeout(() => {
        setHwtFormMessage('');
        setActiveTab('hwt_batches');
      }, 1500);
    } catch (err: any) {
      setHwtFormMessage(err?.data?.message || 'Failed to record HWT batch.');
    }
  };

  const handleOpenUpdateModal = (disp: any) => {
    setSelectedDispatchId(disp.id);
    setUpdateTemp(disp.currentTransitTempCelsius);
    setUpdateHumidity(disp.currentTransitHumidityPct);
    setUpdateStatus(disp.coldChainStatus);
    setUpdateMessage('');
  };

  const handleConfirmColdChainUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispatchId) return;
    try {
      setUpdateMessage('');
      await updateColdChain({
        id: selectedDispatchId,
        body: {
          currentTransitTempCelsius: Number(updateTemp),
          currentTransitHumidityPct: Number(updateHumidity),
          coldChainStatus: updateStatus,
        },
      }).unwrap();

      setUpdateMessage('Telemetry synced successfully!');
      setTimeout(() => {
        setSelectedDispatchId(null);
        setUpdateMessage('');
      }, 1200);
    } catch (err: any) {
      setUpdateMessage(err?.data?.message || 'Failed to sync telemetry.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> DAE Plant Quarantine Wing & Export Audit Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              হট ওয়াটার ট্রিটমেন্ট (HWT) ও রপ্তানি কোয়ারেন্টাইন অডিট
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Supervision of 48°C / 60-min fruit fly quarantine dip tanks, chemical pesticide MRL inspection, and refrigerated reefer cold-chain dispatches.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('new_batch')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs rounded-lg transition shadow-sm inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Record HWT Treatment Batch
            </button>
            <button
              onClick={() => {
                refetchHwt();
                refetchDisp();
              }}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-lg transition border border-white/20 inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Feeds
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('hwt_batches')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'hwt_batches'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            HWT Quarantine Batches ({hwtBatches.length})
          </button>
          <button
            onClick={() => setActiveTab('new_batch')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'new_batch'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            Certify New HWT Batch (ট্রিটমেন্ট সনদপত্র)
          </button>
          <button
            onClick={() => setActiveTab('reefer_supervision')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'reefer_supervision'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            Reefer Cold-Chain Supervision ({dispatches.length})
          </button>
        </div>

        {/* Tab 1: HWT Batches */}
        {activeTab === 'hwt_batches' && (
          <div className="mt-6 space-y-4">
            {hwtLoading ? (
              <div className="text-center py-12 text-slate-500 text-sm">Loading HWT quarantine ledger...</div>
            ) : hwtBatches.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                No HWT batches recorded yet. Click "Certify New HWT Batch" to issue quarantine passes.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {hwtBatches.map((batch) => (
                  <div
                    key={batch.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {batch.batchNumber}
                          </span>
                          {batch.phytosanitaryCertificateNumber && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              {batch.phytosanitaryCertificateNumber}
                            </span>
                          )}
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              batch.quarantinePassIssued
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {batch.status}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1.5">
                          {batch.orchardName}
                        </h3>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Facility: <strong>{batch.hwtFacilityLocation}</strong> • Inspector: {batch.inspectorName} ({batch.inspectorDesignation})
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-slate-400 block">Total Treated Volume</span>
                        <strong className="text-base font-bold text-slate-800">
                          {batch.totalFreshWeightKg} kg
                        </strong>
                        <span className="text-[10px] text-slate-500 block">
                          {batch.cratesCount} export crates
                        </span>
                      </div>
                    </div>

                    {/* Telemetry Chips */}
                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-[11px] text-slate-500 block">Water Temp</span>
                        <strong className="text-sm font-bold text-teal-800">
                          {batch.waterTempCelsius}°C
                        </strong>
                        <span className="text-[10px] text-slate-400 block">Immersion: {batch.immersionDurationMinutes} min</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-[11px] text-slate-500 block">Core Pulp Temp</span>
                        <strong className="text-sm font-bold text-teal-800">
                          {batch.fruitCoreTempCelsius}°C
                        </strong>
                        <span className="text-[10px] text-slate-400 block">Hydrocooling: {batch.hydrocoolingTempCelsius}°C</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-[11px] text-slate-500 block">Chemical MRL</span>
                        <strong className="text-sm font-bold text-emerald-700">
                          {batch.pesticideMrlPpm} ppm
                        </strong>
                        <span className="text-[10px] text-emerald-600 block">Threshold &le; 0.05</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-[11px] text-slate-500 block">Fruit Fly Clearance</span>
                        <strong className="text-sm font-bold text-emerald-700">
                          100% Inactivated
                        </strong>
                        <span className="text-[10px] text-slate-400 block">Bactrocera dorsalis</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: New Batch Form */}
        {activeTab === 'new_batch' && (
          <div className="mt-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-3xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-teal-600" />
              Certify Hot Water Treatment (HWT) Batch
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Enter thermostatic tank dip readings and chemical residue test metrics to issue DAE Phytosanitary Quarantine Passports.
            </p>

            {hwtFormMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold mb-4 ${
                  hwtFormMessage.includes('successfully')
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {hwtFormMessage}
              </div>
            )}

            <form onSubmit={handleCreateHwtBatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Orchard Name
                  </label>
                  <input
                    type="text"
                    required
                    value={orchardName}
                    onChange={(e) => setOrchardName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    HWT Facility Location
                  </label>
                  <input
                    type="text"
                    required
                    value={hwtFacilityLocation}
                    onChange={(e) => setHwtFacilityLocation(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fruit Type
                  </label>
                  <select
                    value={fruitType}
                    onChange={(e) => {
                      const ft = e.target.value as FruitType;
                      setFruitType(ft);
                      setCultivar(ft === 'MANGO' ? 'KHIRSAPAT_HIMSAGAR' : 'DINAJPUR_BEDANA_LITCHI');
                    }}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  >
                    <option value="MANGO">Mango (আম)</option>
                    <option value="LITCHI">Litchi (লিচু)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cultivar
                  </label>
                  <select
                    value={cultivar}
                    onChange={(e) => setCultivar(e.target.value as FruitCultivar)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  >
                    {fruitType === 'MANGO' ? (
                      <>
                        <option value="KHIRSAPAT_HIMSAGAR">Khirsapat / Himsagar</option>
                        <option value="LANGRA">Langra</option>
                        <option value="AMRAPALI">Amrapali</option>
                        <option value="FAZLI">Fazli</option>
                        <option value="HARIBHANGA">Haribhanga</option>
                      </>
                    ) : (
                      <>
                        <option value="DINAJPUR_BEDANA_LITCHI">Dinajpur Bedana</option>
                        <option value="CHINA_3_LITCHI">China-3</option>
                        <option value="BOMBAY_LITCHI">Bombay</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Fresh Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={totalFreshWeightKg}
                    onChange={(e) => setTotalFreshWeightKg(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Crates Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={cratesCount}
                    onChange={(e) => setCratesCount(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Water Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={waterTempCelsius}
                    onChange={(e) => setWaterTempCelsius(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    required
                    value={immersionDurationMinutes}
                    onChange={(e) => setImmersionDurationMinutes(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Core Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={fruitCoreTempCelsius}
                    onChange={(e) => setFruitCoreTempCelsius(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cooling (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={hydrocoolingTempCelsius}
                    onChange={(e) => setHydrocoolingTempCelsius(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chemical MRL Status
                  </label>
                  <select
                    value={chemicalMrlStatus}
                    onChange={(e) => setChemicalMrlStatus(e.target.value as ChemicalMrlStatus)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  >
                    <option value="TEST_PASSED_MRL_SAFE">TEST_PASSED_MRL_SAFE (&le; 0.05 ppm)</option>
                    <option value="PENDING_LAB_ANALYSIS">PENDING_LAB_ANALYSIS</option>
                    <option value="RESIDUE_EXCEEDED_FAIL">RESIDUE_EXCEEDED_FAIL (&gt; 0.05 ppm)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pesticide MRL Residue (ppm)
                  </label>
                  <input
                    type="number"
                    step="0.005"
                    required
                    value={pesticideMrlPpm}
                    onChange={(e) => setPesticideMrlPpm(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    DAE Inspector Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    required
                    value={inspectorDesignation}
                    onChange={(e) => setInspectorDesignation(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCreatingHwt}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-3 rounded-lg transition shadow-sm"
                >
                  {isCreatingHwt ? 'Validating HWT Parameters...' : 'Verify Parameters & Issue Phytosanitary Pass'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Reefer Supervision */}
        {activeTab === 'reefer_supervision' && (
          <div className="mt-6 space-y-4">
            {dispLoading ? (
              <div className="text-center py-12 text-slate-500 text-sm">Loading dispatches...</div>
            ) : dispatches.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                No active reefer dispatches being monitored.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dispatches.map((disp) => (
                  <div
                    key={disp.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {disp.dispatchCode}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            disp.coldChainStatus === 'OPTIMAL_CHILLED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {disp.coldChainStatus}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 mt-2">
                        {disp.cultivar.replace(/_/g, ' ')} ({disp.fruitType})
                      </h4>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Plate: <strong>{disp.reeferVanPlateNumber}</strong> • Weight: {disp.dispatchWeightKg} kg
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Current Temp</span>
                          <strong className="text-sm font-bold text-slate-800">
                            {disp.currentTransitTempCelsius}°C
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Humidity</span>
                          <strong className="text-sm font-bold text-slate-800">
                            {disp.currentTransitHumidityPct}%
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Brix Degree</span>
                          <strong className="text-sm font-bold text-amber-700">
                            {disp.brixSugarDegree}° Brix
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Destination: {disp.destinationMarket}
                      </span>
                      <button
                        onClick={() => handleOpenUpdateModal(disp)}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition"
                      >
                        Sync Telemetry
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sync Telemetry Modal */}
      {selectedDispatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Update Reefer IoT Telemetry
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Manual sensor override & IoT sync for refrigerated van in transit.
            </p>

            {updateMessage && (
              <div className="my-3 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold text-center">
                {updateMessage}
              </div>
            )}

            <form onSubmit={handleConfirmColdChainUpdate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transit Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={updateTemp}
                  onChange={(e) => setUpdateTemp(Number(e.target.value))}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relative Humidity (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={updateHumidity}
                  onChange={(e) => setUpdateHumidity(Number(e.target.value))}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cold Chain Status
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as ColdChainTransitStatus)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                >
                  <option value="OPTIMAL_CHILLED">OPTIMAL_CHILLED</option>
                  <option value="TEMPERATURE_SPIKE_ALERT">TEMPERATURE_SPIKE_ALERT</option>
                  <option value="WARMING_RISK">WARMING_RISK</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDispatchId(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingColdChain}
                  className="px-4 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition shadow-sm"
                >
                  {isUpdatingColdChain ? 'Syncing...' : 'Save Telemetry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
