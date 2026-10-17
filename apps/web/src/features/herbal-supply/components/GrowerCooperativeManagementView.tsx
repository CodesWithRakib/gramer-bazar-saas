'use client';

import React, { useState } from 'react';
import {
  Flower2,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Microscope,
  Scale,
  ShieldCheck,
  Tag,
  MapPin,
  FileCheck2,
  Droplets,
  Layers,
  Leaf,
} from 'lucide-react';
import {
  useGetGrowerBatchesQuery,
  useCreateHerbalBatchMutation,
  useUpdateHerbalBatchMutation,
  useRecordMoistureAuditMutation,
  HerbalBatch,
  HerbalSpecies,
  PlantPartUsed,
  ProcessingState,
  GACPStandardGrade,
} from '../herbalSupplyApi';

export const GrowerCooperativeManagementView: React.FC = () => {
  const { data: batchesData, isLoading } = useGetGrowerBatchesQuery();
  const [createBatch, { isLoading: isCreatingBatch }] = useCreateHerbalBatchMutation();
  const [updateBatch] = useUpdateHerbalBatchMutation();
  const [recordAudit, { isLoading: isAuditing }] = useRecordMoistureAuditMutation();

  const [showAddBatchModal, setShowAddBatchModal] = useState<boolean>(false);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [selectedBatchForAudit, setSelectedBatchForAudit] = useState<HerbalBatch | null>(null);

  // Form State for New Batch
  const [cooperativeName, setCooperativeName] = useState<string>('Laxmipur Kholabaria Oushodhi Krishi Samity');
  const [growerPhone, setGrowerPhone] = useState<string>('01712987654');
  const [growerDistrict, setGrowerDistrict] = useState<string>('Natore');
  const [growerUpazila, setGrowerUpazila] = useState<string>('Natore Sadar');
  const [species, setSpecies] = useState<HerbalSpecies>('KALOMEGH');
  const [scientificName, setScientificName] = useState<string>('Andrographis paniculata');
  const [plantPart, setPlantPart] = useState<PlantPartUsed>('LEAF_DRIED');
  const [processingState, setProcessingState] = useState<ProcessingState>('SHADE_DRIED_WHOLE');
  const [harvestedDate, setHarvestedDate] = useState<string>('2026-10-10');
  const [totalWeightKg, setTotalWeightKg] = useState<number>(850);
  const [moistureContentPercentage, setMoistureContentPercentage] = useState<number>(8.9);
  const [activePhytochemical, setActivePhytochemical] = useState<number>(2.4);
  const [phytochemicalMarker, setPhytochemicalMarker] = useState<string>('Andrographolide Active');
  const [pricePerKgBdt, setPricePerKgBdt] = useState<number>(320);
  const [minOrderKg, setMinOrderKg] = useState<number>(40);
  const [labReportNumber, setLabReportNumber] = useState<string>('DGDA-HERB-2026-512');
  const [testingLaboratory, setTestingLaboratory] = useState<string>('BCSIR Central Laboratory');
  const [description, setDescription] = useState<string>(
    '100% bio-compost grown, harvested at peak flowering stage, and dried on elevated mesh drying beds.'
  );

  // Moisture Audit Form State
  const [testedMoisture, setTestedMoisture] = useState<number>(9.0);
  const [isAflatoxin, setIsAflatoxin] = useState<boolean>(false);
  const [leadPpm, setLeadPpm] = useState<number>(0.04);
  const [inspectorName, setInspectorName] = useState<string>('Dr. Aminul Islam (BCSIR Quality Chemist)');

  const batches = batchesData?.data || [];

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBatch({
        cooperativeName,
        growerPhone,
        growerDistrict,
        growerUpazila,
        species,
        scientificName,
        plantPart,
        processingState,
        harvestedDate,
        totalWeightKg: Number(totalWeightKg),
        moistureContentPercentage: Number(moistureContentPercentage),
        activePhytochemicalPercentage: Number(activePhytochemical),
        phytochemicalMarkerName: phytochemicalMarker,
        pricePerKgBdt: Number(pricePerKgBdt),
        minOrderKg: Number(minOrderKg),
        labReportNumber: labReportNumber.trim() ? labReportNumber : undefined,
        testingLaboratory: testingLaboratory.trim() ? testingLaboratory : undefined,
        gacpGrade: moistureContentPercentage <= 10.0 ? 'PHARMA_GRADE_A' : 'COMMERCIAL_GRADE_B',
        certStatus: 'TESTED_COMPLIANT_DGDA',
        isOrganicCertified: true,
        description,
      }).unwrap();

      setShowAddBatchModal(false);
    } catch (err) {
      console.error('Failed to create batch', err);
    }
  };

  const handleRecordAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForAudit) return;

    try {
      await recordAudit({
        batchId: selectedBatchForAudit.id,
        testedMoisturePercentage: Number(testedMoisture),
        isAflatoxinDetected: isAflatoxin,
        leadHeavyMetalPpm: Number(leadPpm),
        inspectorName,
      }).unwrap();

      setShowAuditModal(false);
      setSelectedBatchForAudit(null);
    } catch (err) {
      console.error('Failed to record audit', err);
    }
  };

  const totalStockKg = batches.reduce((sum, b) => sum + (b.totalWeightKg || 0), 0);
  const pharmaGradeCount = batches.filter((b) => b.gacpGrade === 'PHARMA_GRADE_A').length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-green-950 rounded-3xl p-6 lg:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Leaf className="w-4 h-4" />
            <span>Grower Cooperative &amp; Herbal Sourcing Ledger (ভেষজ চাষী সমবায় ড্যাশবোর্ড)</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Herbal Grower &amp; Cooperative Hub
          </h1>
          <p className="mt-2 text-xs lg:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
            Register certified medicinal batches from Natore, Tangail, Rangpur, and the Hill Tracts. Log moisture testing
            meter values, link DGDA/BCSIR lab reports, and fulfill direct institutional pharmaceutical supply orders.
          </p>
        </div>

        <button
          onClick={() => setShowAddBatchModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-all shadow-lg shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List New Harvest Batch (নতুন ভেষজ ব্যাচ)</span>
        </button>
      </div>

      {/* Operational Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">MY BOTANICAL BATCHES</div>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-2">
            {batches.length} <span className="text-xs font-medium text-gray-400">Batches</span>
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Available for wholesale sourcing</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">TOTAL STOCK IN WAREHOUSE</div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-2">
            {totalStockKg.toLocaleString()} <span className="text-xs font-medium text-gray-400">Kg</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Dried &amp; humidity controlled</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">PHARMA GRADE A RATIO</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {batches.length > 0 ? Math.round((pharmaGradeCount / batches.length) * 100) : 100}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Moisture &lt; 10% compliance</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">GACP COMPLIANCE STATUS</div>
          <div className="text-2xl font-black text-amber-500 mt-2">Certified</div>
          <div className="text-xs text-gray-500 mt-1">BCSIR / DGDA lab audited</div>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flower2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Registered Medicinal Batches ({batches.length})
            </h2>
          </div>
          <span className="text-xs text-gray-500">Live sync with Gramer Bazar Pharmacopoeia Sourcing Hub</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-500 text-xs">Loading batches...</div>
        ) : batches.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs space-y-2">
            <Flower2 className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
            <div>You have not registered any medicinal batches yet.</div>
            <button
              onClick={() => setShowAddBatchModal(true)}
              className="text-emerald-600 font-bold hover:underline"
            >
              List your first herbal harvest batch &rarr;
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-5 py-3.5">Batch &amp; Species</th>
                  <th className="px-5 py-3.5">Plant Part &amp; Processing</th>
                  <th className="px-5 py-3.5">Stock &amp; Price</th>
                  <th className="px-5 py-3.5">Moisture &amp; Grade</th>
                  <th className="px-5 py-3.5">Lab Report</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-medium">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30">
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900 dark:text-white text-sm">{batch.species}</div>
                      <div className="text-[11px] text-gray-500 italic mt-0.5">{batch.scientificName}</div>
                      <div className="font-mono text-[10px] text-emerald-600 mt-1">#{batch.batchNumber}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {batch.plantPart.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {batch.processingState.replace(/_/g, ' ')}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {batch.totalWeightKg.toLocaleString()} kg
                      </div>
                      <div className="text-emerald-600 font-bold mt-0.5">
                        ৳{batch.pricePerKgBdt}/kg (Min: {batch.minOrderKg} kg)
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-extrabold text-teal-600 dark:text-teal-400">
                        {batch.moistureContentPercentage.toFixed(1)}% Moisture
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                        {batch.gacpGrade.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-mono text-gray-700 dark:text-gray-300 text-[11px]">
                        {batch.labReportNumber || 'Report Pending'}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{batch.testingLaboratory}</div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedBatchForAudit(batch);
                          setTestedMoisture(batch.moistureContentPercentage);
                          setShowAuditModal(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold text-xs"
                      >
                        <Microscope className="w-3.5 h-3.5" />
                        <span>Log Moisture Test</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE BATCH MODAL */}
      {showAddBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 my-8 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Register New Botanical Harvest Batch (নতুন ভেষজ ফসল নিবন্ধন)
              </h3>
              <button
                onClick={() => setShowAddBatchModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Cooperative / Farm Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cooperativeName}
                    onChange={(e) => setCooperativeName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={growerPhone}
                    onChange={(e) => setGrowerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={growerDistrict}
                    onChange={(e) => setGrowerDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Upazila</label>
                  <input
                    type="text"
                    required
                    value={growerUpazila}
                    onChange={(e) => setGrowerUpazila(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Species</label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-semibold"
                  >
                    <option value="KALOMEGH">কালমেঘ (Kalomegh)</option>
                    <option value="ASHWAGANDHA">অশ্বগন্ধা (Ashwagandha)</option>
                    <option value="VASAKA">বাসক পাতা (Vasaka)</option>
                    <option value="TULSI_KRISHNA_RAMA">তুলসী (Tulsi)</option>
                    <option value="SHATAVARI">শতমূলী (Shatavari)</option>
                    <option value="ALOE_VERA">ঘৃতকুমারী (Aloe Vera)</option>
                    <option value="AMLA">আমলকী (Amla)</option>
                    <option value="HARITAKI">হরিতকী (Haritaki)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Plant Part</label>
                  <select
                    value={plantPart}
                    onChange={(e) => setPlantPart(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                  >
                    <option value="LEAF_DRIED">Leaf Dried (শুকনো পাতা)</option>
                    <option value="ROOT_RHIZOME">Root / Rhizome (মূল ও কন্দ)</option>
                    <option value="WHOLE_HERB">Whole Herb (সমগ্র উদ্ভিদ)</option>
                    <option value="GEL_EXTRACT">Gel Extract (পাল্প/নির্যাস)</option>
                    <option value="FRUIT_SEED">Fruit / Berry (শুকনো ফল)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Processing</label>
                  <select
                    value={processingState}
                    onChange={(e) => setProcessingState(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                  >
                    <option value="SHADE_DRIED_WHOLE">Shade Dried Whole (ছায়ায় শুকানো)</option>
                    <option value="SOLAR_DEHYDRATED_CHOPPED">Solar Dehydrated Chopped (সৌর ড্রায়ার)</option>
                    <option value="FINE_PULVERIZED_POWDER">Pulverized Powder (চূর্ণ)</option>
                    <option value="RAW_FRESH_HARVEST">Raw Fresh Harvest (কাঁচা ফসল)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Total Weight (Kg)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={totalWeightKg}
                    onChange={(e) => setTotalWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Moisture (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={moistureContentPercentage}
                    onChange={(e) => setMoistureContentPercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Price/Kg (৳)
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={pricePerKgBdt}
                    onChange={(e) => setPricePerKgBdt(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Min Order (Kg)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={minOrderKg}
                    onChange={(e) => setMinOrderKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Lab Report # (DGDA/BCSIR)
                  </label>
                  <input
                    type="text"
                    value={labReportNumber}
                    onChange={(e) => setLabReportNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Testing Analytical Lab
                  </label>
                  <input
                    type="text"
                    value={testingLaboratory}
                    onChange={(e) => setTestingLaboratory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Agronomic Description &amp; Organic Certification
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddBatchModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingBatch}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
                >
                  {isCreatingBatch ? 'Registering...' : 'Publish Batch Live'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD MOISTURE AUDIT MODAL */}
      {showAuditModal && selectedBatchForAudit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Log Halogen Moisture Test: #{selectedBatchForAudit.batchNumber}
              </h3>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRecordAudit} className="mt-4 space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tested Moisture Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={testedMoisture}
                  onChange={(e) => setTestedMoisture(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold"
                />
                <p className="text-[10px] text-gray-400 mt-0.5">
                  &lt;10.0% qualifies for Pharma Grade A. &gt;12.0% triggers rejection.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Inspector / Chemist Full Name
                </label>
                <input
                  type="text"
                  required
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="aflatoxinCheck"
                  checked={isAflatoxin}
                  onChange={(e) => setIsAflatoxin(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <label htmlFor="aflatoxinCheck" className="font-semibold text-red-600">
                  Visible Mold / Aflatoxin detected (triggers immediate quarantine)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAuditing}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md"
                >
                  {isAuditing ? 'Recording...' : 'Save Quality Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default GrowerCooperativeManagementView;
