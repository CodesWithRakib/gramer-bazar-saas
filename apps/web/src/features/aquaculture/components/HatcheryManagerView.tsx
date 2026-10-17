'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  PlusCircle,
  PackageCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  MapPin,
  Phone,
  FileCheck2,
  Fish,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Tag,
} from 'lucide-react';
import {
  useGetMyHatcheryBatchesQuery,
  useCreateHatcheryBatchMutation,
  useUpdateHatcheryBatchMutation,
  HatcheryBatch,
} from '../aquacultureApi';

export const HatcheryManagerView: React.FC = () => {
  const { data: myBatchesData, isLoading } = useGetMyHatcheryBatchesQuery();
  const [createBatch, { isLoading: isCreating }] = useCreateHatcheryBatchMutation();
  const [updateBatch] = useUpdateHatcheryBatchMutation();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [hatcheryName, setHatcheryName] = useState<string>('Bengal Ocean Aqua Hatchery');
  const [hatcheryPhone, setHatcheryPhone] = useState<string>('01819234567');
  const [hatcheryDistrict, setHatcheryDistrict] = useState<string>("Cox's Bazar");
  const [hatcheryUpazila, setHatcheryUpazila] = useState<string>('Kolatoli Coastal Belt');
  const [category, setCategory] = useState<HatcheryBatch['category']>('SHRIMP_BLACK_TIGER');
  const [species, setSpecies] = useState<string>('Penaeus monodon (Black Tiger Bagda)');
  const [stage, setStage] = useState<HatcheryBatch['stage']>('FINGERLING_DHANI');
  const [fingerlingCount, setFingerlingCount] = useState<number>(250000);
  const [averageLengthCm, setAverageLengthCm] = useState<number>(2.5);
  const [unitPriceBdt, setUnitPriceBdt] = useState<number>(0.85);
  const [minOrderQuantity, setMinOrderQuantity] = useState<number>(10000);
  const [pcrTestReportNumber, setPcrTestReportNumber] = useState<string>('DOF-PCR-2026-CXB-998');
  const [pcrTestStatus, setPcrTestStatus] = useState<HatcheryBatch['pcrTestStatus']>('PCR_TESTED_NEGATIVE_SPF');
  const [testingLab, setTestingLab] = useState<string>('DoF Shrimp Health Lab, Coxs Bazar');
  const [oxygenPackingIncluded, setOxygenPackingIncluded] = useState<boolean>(true);
  const [description, setDescription] = useState<string>(
    'Certified Specific Pathogen Free (SPF) post-larvae tested negative for WSSV, IHHNV, and EHP microsporidia.'
  );

  const batches = myBatchesData?.data || [];

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await createBatch({
        hatcheryName,
        hatcheryPhone,
        hatcheryDistrict,
        hatcheryUpazila,
        category,
        species,
        stage,
        fingerlingCount: Number(fingerlingCount),
        averageLengthCm: Number(averageLengthCm),
        unitPriceBdt: Number(unitPriceBdt),
        minOrderQuantity: Number(minOrderQuantity),
        pcrTestReportNumber: pcrTestReportNumber.trim() ? pcrTestReportNumber : null,
        pcrTestStatus,
        testingLab: testingLab.trim() ? testingLab : null,
        oxygenPackingIncluded,
        description,
        isAvailable: true,
      }).unwrap();

      setSuccessMessage('Hatchery batch successfully registered and published with DoF PCR audit report!');
      setShowAddModal(false);
    } catch (err: any) {
      setErrorMessage(err?.data?.message || 'Failed to create hatchery batch. Please check inputs.');
    }
  };

  const handleToggleAvailability = async (batch: HatcheryBatch) => {
    try {
      await updateBatch({
        id: batch.id,
        isAvailable: !batch.isAvailable,
      }).unwrap();
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  const totalStockCount = batches.reduce((acc, b) => acc + (b.fingerlingCount || 0), 0);
  const spfCertifiedCount = batches.filter((b) => b.pcrTestStatus === 'PCR_TESTED_NEGATIVE_SPF').length;
  const totalValuationBdt = batches.reduce((acc, b) => acc + (b.fingerlingCount || 0) * (b.unitPriceBdt || 0), 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 rounded-2xl p-6 lg:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Fish className="w-4 h-4" />
            <span>Hatchery Production &amp; Fry Inventory Hub (হ্যাচারি নার্সারি স্টক)</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Commercial Hatchery &amp; Nursery Manager
          </h1>
          <p className="mt-2 text-sm lg:text-base text-emerald-100/90 max-w-2xl">
            Register Specific Pathogen Free (SPF) post-larvae batches, attach Department of Fisheries (DoF) virus-free PCR
            reports, and fulfill live fry shipments packed in oxygenated bags nationwide.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold transition-all shadow-lg hover:shadow-emerald-500/25 shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>List New Fry Batch (নতুন পোনা ব্যাচ)</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-800 dark:text-red-200 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Operational Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>TOTAL FRY INVENTORY</span>
            <Fish className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-gray-900 dark:text-white">
            {totalStockCount.toLocaleString()} <span className="text-xs font-medium text-gray-500">pcs</span>
          </div>
          <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Active in nursing tanks &amp; ponds
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>SPF PCR CERTIFIED</span>
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-cyan-600 dark:text-cyan-400">
            {spfCertifiedCount} / {batches.length} <span className="text-xs font-medium text-gray-500">batches</span>
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            WSSV, EHP &amp; EMS Free Certified
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>INVENTORY VALUATION</span>
            <TrendingUp className="w-4 h-4 text-teal-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-gray-900 dark:text-white">
            ৳{totalValuationBdt.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Based on current farmgate listing rates
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>OXYGEN PACKING COMPLIANCE</span>
            <PackageCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-blue-600 dark:text-blue-400">
            100%
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Double polythene bag with 24h pure O₂
          </div>
        </div>
      </div>

      {/* Batches Table View */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Registered Hatchery Batches ({batches.length})
            </h2>
          </div>
          <span className="text-xs text-gray-500">Live sync with Gramer Bazar Aquaculture Market</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading hatchery batch inventory...</div>
        ) : batches.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <Fish className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
            <div className="text-base font-semibold text-gray-700 dark:text-gray-300">
              No hatchery batches registered yet
            </div>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Click &quot;List New Fry Batch&quot; above to publish your SPF shrimp post-larvae or carp fingerlings to farmers nationwide.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-5 py-3">Batch &amp; Species</th>
                  <th className="px-5 py-3">Category &amp; Stage</th>
                  <th className="px-5 py-3">Quantity &amp; Size</th>
                  <th className="px-5 py-3">Price / Min Order</th>
                  <th className="px-5 py-3">DoF PCR Certification</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 font-medium">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900 dark:text-white">{batch.species}</div>
                      <div className="text-xs text-gray-500 font-mono flex items-center gap-1.5 mt-0.5">
                        <Tag className="w-3 h-3 text-emerald-500" />
                        <span>{batch.batchNumber}</span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{batch.hatcheryDistrict}, {batch.hatcheryUpazila}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200">
                        {batch.category.replace(/_/g, ' ')}
                      </span>
                      <div className="text-xs text-gray-500 mt-1 capitalize font-medium">
                        {batch.stage.toLowerCase().replace(/_/g, ' ')}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-gray-900 dark:text-white font-semibold">
                        {batch.fingerlingCount.toLocaleString()} pcs
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Avg: {batch.averageLengthCm} cm
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                        ৳{batch.unitPriceBdt.toFixed(2)} / pc
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Min: {batch.minOrderQuantity.toLocaleString()} pcs
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {batch.pcrTestStatus === 'PCR_TESTED_NEGATIVE_SPF' ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                          <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                          <span>SPF Negative</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>PCR Pending</span>
                        </div>
                      )}
                      {batch.pcrTestReportNumber && (
                        <div className="text-xs font-mono text-gray-500 mt-1">
                          {batch.pcrTestReportNumber}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {batch.isAvailable ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>In Stock</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          Sold Out
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleToggleAvailability(batch)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        {batch.isAvailable ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-600" />
                            <span>Mark Sold</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-gray-400" />
                            <span>Mark Available</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Hatchery Batch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Fish className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Publish New Hatchery Fry Batch (নতুন পোনা তালিকাভুক্তকরণ)
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="mt-5 space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Hatchery Name (হ্যাচারির নাম)
                  </label>
                  <input
                    type="text"
                    required
                    value={hatcheryName}
                    onChange={(e) => setHatcheryName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Contact Phone (মোবাইল নম্বর)
                  </label>
                  <input
                    type="text"
                    required
                    value={hatcheryPhone}
                    onChange={(e) => setHatcheryPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    District (জেলা)
                  </label>
                  <input
                    type="text"
                    required
                    value={hatcheryDistrict}
                    onChange={(e) => setHatcheryDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Upazila / Coastal Zone (উপজেলা / উপকূলীয় এলাকা)
                  </label>
                  <input
                    type="text"
                    required
                    value={hatcheryUpazila}
                    onChange={(e) => setHatcheryUpazila(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Category (শ্রেণী)
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="SHRIMP_BLACK_TIGER">Shrimp (বাগদা চিংড়ি)</option>
                    <option value="PRAWN_GALDA">Giant Prawn (গলদা চিংড়ি)</option>
                    <option value="FRESHWATER_CARP">Carp (কার্প ও রুই-কাতলা)</option>
                    <option value="TILAPIA_PANGAS">Monosex Tilapia / Pangas</option>
                    <option value="CATFISH_SHING_MAGUR">Catfish (শিং / মাগুর / পাবদা)</option>
                    <option value="BIOFLOC_INTENSIVE">Biofloc Intensive Ready</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Species Name (প্রজাতি ও বৈজ্ঞানিক নাম)
                  </label>
                  <input
                    type="text"
                    required
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Stage (পর্যায়)
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                  >
                    <option value="FINGERLING_DHANI">Fingerling / PL-15 (ধানি)</option>
                    <option value="SPAWN_DIM_PONA">Spawn (ডিম পোনা)</option>
                    <option value="JUVENILE_CHALA">Juvenile (চালা পোনা)</option>
                    <option value="BROODSTOCK">Certified Broodstock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Total Quantity (পিস)
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={fingerlingCount}
                    onChange={(e) => setFingerlingCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Price/Piece (৳)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min={0.01}
                    value={unitPriceBdt}
                    onChange={(e) => setUnitPriceBdt(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Avg Size (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min={0.1}
                    value={averageLengthCm}
                    onChange={(e) => setAverageLengthCm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-4 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl border border-cyan-200 dark:border-cyan-800 space-y-3">
                <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-200 font-bold text-xs uppercase">
                  <ShieldCheck className="w-4 h-4 text-cyan-600" />
                  <span>Department of Fisheries (DoF) PCR Certification</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      PCR Status
                    </label>
                    <select
                      value={pcrTestStatus}
                      onChange={(e) => setPcrTestStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    >
                      <option value="PCR_TESTED_NEGATIVE_SPF">SPF Tested Negative (WSSV Free)</option>
                      <option value="PCR_PENDING">PCR Pending Lab Analysis</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      PCR Report Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DOF-PCR-2026-991"
                      value={pcrTestReportNumber}
                      onChange={(e) => setPcrTestReportNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Accredited Testing Lab
                    </label>
                    <input
                      type="text"
                      value={testingLab}
                      onChange={(e) => setTestingLab(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Batch Description &amp; Health Guarantee
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="oxygenPacking"
                  checked={oxygenPackingIncluded}
                  onChange={(e) => setOxygenPackingIncluded(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="oxygenPacking" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Includes pure oxygen injection bag packing (24 hours transit survival guarantee)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {isCreating ? 'Publishing...' : 'Publish Batch Live'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default HatcheryManagerView;
