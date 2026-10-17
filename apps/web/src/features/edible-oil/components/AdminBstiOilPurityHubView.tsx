'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  AlertTriangle,
  CheckCircle2,
  Filter,
  FileText,
  PlusCircle,
  RefreshCw,
  Search,
  Scale,
  Thermometer,
  Flame,
  Droplets,
  ExternalLink,
  QrCode,
} from 'lucide-react';
import {
  useGetOilLabTestsQuery,
  useCreateOilLabTestMutation,
  OilPurityLabTest,
  OilSeedType,
  OilPurityGrade,
  ArgemoneTestResult,
  AdulterationScreeningStatus,
} from '../edibleOilApi';

export const AdminBstiOilPurityHubView: React.FC = () => {
  const [filterSeedType, setFilterSeedType] = useState<OilSeedType | 'ALL'>('ALL');
  const [filterGrade, setFilterGrade] = useState<OilPurityGrade | 'ALL'>('ALL');

  // Queries
  const { data: labTests = [], isLoading, refetch } = useGetOilLabTestsQuery(
    filterSeedType !== 'ALL' || filterGrade !== 'ALL'
      ? {
          seedType: filterSeedType !== 'ALL' ? filterSeedType : undefined,
          purityGrade: filterGrade !== 'ALL' ? filterGrade : undefined,
        }
      : undefined,
  );

  // Mutations
  const [createLabTest, { isLoading: isCreatingTest }] = useCreateOilLabTestMutation();

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTestDetail, setSelectedTestDetail] = useState<OilPurityLabTest | null>(null);

  // Form State
  const [sampleName, setSampleName] = useState('Delduar Artisanal Wood Ghani Mustard Sample #01');
  const [batchId, setBatchId] = useState('');
  const [seedType, setSeedType] = useState<OilSeedType>('MUSTARD_MAGHI_DESHI');
  const [testingLabName, setTestingLabName] = useState('BSTI Physical & Chemical Testing Laboratory, Dhaka');
  const [leadChemistName, setLeadChemistName] = useState('Dr. Shahabuddin Ahmed, Lead Analytical Chemist');
  const [freeFattyAcidPct, setFreeFattyAcidPct] = useState<number>(0.85);
  const [peroxideValueMeq, setPeroxideValueMeq] = useState<number>(3.2);
  const [allylIsothiocyanatePct, setAllylIsothiocyanatePct] = useState<number>(0.38);
  const [refractiveIndex, setRefractiveIndex] = useState<number>(1.4658);
  const [argemoneOilStatus, setArgemoneOilStatus] =
    useState<ArgemoneTestResult>('NEGATIVE_PASS_SAFE');
  const [adulterationStatus, setAdulterationStatus] =
    useState<AdulterationScreeningStatus>('PURE_UNADULTERATED');
  const [createSuccessMsg, setCreateSuccessMsg] = useState('');
  const [createErrMsg, setCreateErrMsg] = useState('');

  // Counters
  const totalTests = labTests.length;
  const passedBsti = labTests.filter((t) => t.isBstiApproved).length;
  const argemoneSeizures = labTests.filter(
    (t) => t.argemoneOilStatus === 'POSITIVE_CONTAMINATED_SEIZED',
  ).length;
  const extraVirginLots = labTests.filter(
    (t) => t.purityGrade === 'GRADE_AAA_EXTRA_VIRGIN_COLD_PRESSED',
  ).length;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSuccessMsg('');
    setCreateErrMsg('');

    try {
      await createLabTest({
        sampleName,
        batchId: batchId || undefined,
        seedType,
        testingLabName,
        leadChemistName,
        freeFattyAcidPct: Number(freeFattyAcidPct),
        peroxideValueMeq: Number(peroxideValueMeq),
        allylIsothiocyanatePct: Number(allylIsothiocyanatePct),
        refractiveIndex: Number(refractiveIndex),
        argemoneOilStatus,
        adulterationStatus,
      }).unwrap();

      setCreateSuccessMsg('Laboratory report generated & authenticity seal registered.');
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccessMsg('');
      }, 1500);
    } catch (err: any) {
      setCreateErrMsg(err?.data?.message || 'Failed to issue lab test certificate.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            BSTI & BFSA Edible Oil Chemical Testing Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100">
            Artisanal Oil Purity & Anti-Adulteration Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            বিএসটিআই বিডিএস-২১১ এসিড মান (FFA ≤ ১.৫%), পারঅক্সাইড মান ও সিয়ালকাঁটা (আর্গেমন) শূন্য-সহনশীলতা নিয়ন্ত্রণ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Refresh Tests"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-950/40"
          >
            <PlusCircle className="w-4 h-4" />
            Issue Lab Test Certificate
          </button>
          <Link
            href="/edible-oil"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-sm font-semibold transition"
          >
            Public Catalog &rarr;
          </Link>
        </div>
      </div>

      {/* Regulatory KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">Total Audited Batches</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{totalTests}</div>
          <span className="text-[11px] text-slate-400">Physical & chemical tests</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">BSTI BDS-211 Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{passedBsti}</div>
          <span className="text-[11px] text-emerald-400 font-semibold">
            {totalTests > 0 ? ((passedBsti / totalTests) * 100).toFixed(0) : 0}% compliance rate
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">Grade-AAA Extra Virgin</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">{extraVirginLots}</div>
          <span className="text-[11px] text-slate-400">Cold-pressed &lt;40°C certified</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">Argemone Seizures</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-500">{argemoneSeizures}</div>
          <span className="text-[11px] text-rose-400 font-semibold">Zero-tolerance dropsy bans</span>
        </div>
      </div>

      {/* Enforcement Alert Banner */}
      {argemoneSeizures > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 mb-6 flex items-start gap-3 text-xs text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-sm text-rose-300 mb-1">
              Food Safety Enforcement Warning (সিয়ালকাঁটা তেলের বিষাক্ত অ্যালকালয়েড সতর্কবার্তা):
            </strong>
            {argemoneSeizures} sample(s) tested positive for toxic Argemone mexicana oil. Ingestion causes epidemic dropsy, capillary dilatation, and cardiac failure. Immediate seizure mandates and criminal prosecution have been dispatched under Section 41 of Bangladesh Food Safety Act 2013.
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Reports:
          </span>

          <select
            value={filterSeedType}
            onChange={(e) => setFilterSeedType(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Seed Types</option>
            <option value="MUSTARD_MAGHI_DESHI">Mustard Maghi Deshi</option>
            <option value="MUSTARD_BARI_14">Mustard BARI-14</option>
            <option value="SESAME_BLACK">Sesame Black</option>
            <option value="SUNFLOWER_SEED">Sunflower Seed</option>
          </select>

          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Purity Grades</option>
            <option value="GRADE_AAA_EXTRA_VIRGIN_COLD_PRESSED">Grade-AAA Extra Virgin</option>
            <option value="GRADE_A_STANDARD_VIRGIN">Grade-A Standard Virgin</option>
            <option value="COMMERCIAL_REFINED">Commercial Refined</option>
            <option value="REJECTED_ADULTERATED">Rejected / Adulterated</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="text-emerald-400 font-bold">{labTests.length}</span> analytical records
        </div>
      </div>

      {/* Lab Tests Table */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-800/40 rounded-2xl animate-pulse">
          Loading chemical laboratory records...
        </div>
      ) : labTests.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-800/30 rounded-2xl border border-slate-800">
          No lab test records found matching criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {labTests.map((test) => (
            <div
              key={test.id}
              className={`rounded-2xl bg-slate-800/80 border p-5 transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
                test.isBstiApproved
                  ? 'border-slate-700/80 hover:border-emerald-500/50'
                  : 'border-rose-500/50 bg-rose-950/10'
              }`}
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/30">
                    {test.testReportNumber}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      test.isBstiApproved
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {test.isBstiApproved ? 'BSTI Approved' : 'FAILED / SEIZED'}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-700 text-slate-300">
                    {test.seedType.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100">{test.sampleName}</h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span>Lab: <strong className="text-slate-300">{test.testingLabName}</strong></span>
                  <span>•</span>
                  <span>Chemist: <strong className="text-slate-300">{test.leadChemistName}</strong></span>
                </div>

                {test.authenticitySealNumber && (
                  <div className="flex items-center gap-2 text-xs text-amber-300 font-mono mt-1">
                    <QrCode className="w-3.5 h-3.5" />
                    Authenticity Seal: {test.authenticitySealNumber}
                  </div>
                )}
              </div>

              {/* Chemical Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-700/60 w-full lg:w-auto text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Free Fatty Acid (FFA)</span>
                  <span
                    className={`font-black text-sm ${
                      test.freeFattyAcidPct <= 1.5 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {test.freeFattyAcidPct}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Limit ≤ 1.50%</span>
                </div>

                <div className="border-l border-slate-800 pl-3">
                  <span className="text-slate-400 block text-[10px] uppercase">Peroxide Value</span>
                  <span
                    className={`font-black text-sm ${
                      test.peroxideValueMeq <= 10 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {test.peroxideValueMeq} meq
                  </span>
                  <span className="text-[10px] text-slate-500 block">Limit ≤ 10.0</span>
                </div>

                <div className="border-l border-slate-800 pl-3">
                  <span className="text-slate-400 block text-[10px] uppercase">Allyl Pungency</span>
                  <span className="font-black text-amber-400 text-sm">
                    {test.allylIsothiocyanatePct}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Min ≥ 0.25%</span>
                </div>

                <div className="border-l border-slate-800 pl-3">
                  <span className="text-slate-400 block text-[10px] uppercase">Argemone Oil</span>
                  <span
                    className={`font-black text-xs ${
                      test.argemoneOilStatus === 'NEGATIVE_PASS_SAFE'
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {test.argemoneOilStatus === 'NEGATIVE_PASS_SAFE' ? 'NEGATIVE' : 'SEIZED'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Zero Tolerance</span>
                </div>
              </div>

              {/* View Certificate */}
              <div className="shrink-0 w-full lg:w-auto">
                <button
                  onClick={() => setSelectedTestDetail(test)}
                  className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  View Lab Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE LAB TEST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-emerald-500/40 p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-100 mb-1">
              Issue Official BSTI Purity Report
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Enter spectrophotometric & chromatographic test findings to issue digital QR authenticity seal.
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

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sample Title</label>
                <input
                  type="text"
                  required
                  value={sampleName}
                  onChange={(e) => setSampleName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Seed Type</label>
                  <select
                    value={seedType}
                    onChange={(e) => setSeedType(e.target.value as OilSeedType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Batch UUID (Optional)</label>
                  <input
                    type="text"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    placeholder="Link to pressing batch ID"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Testing Laboratory</label>
                  <input
                    type="text"
                    required
                    value={testingLabName}
                    onChange={(e) => setTestingLabName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lead Chemist</label>
                  <input
                    type="text"
                    required
                    value={leadChemistName}
                    onChange={(e) => setLeadChemistName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">FFA (% Oleic)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={freeFattyAcidPct}
                    onChange={(e) => setFreeFattyAcidPct(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">POV (meq/kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    required
                    value={peroxideValueMeq}
                    onChange={(e) => setPeroxideValueMeq(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Allyl (% Pungent)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="2"
                    required
                    value={allylIsothiocyanatePct}
                    onChange={(e) => setAllylIsothiocyanatePct(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Refractive Index</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="1.4"
                    max="1.5"
                    required
                    value={refractiveIndex}
                    onChange={(e) => setRefractiveIndex(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Argemone Oil Screening
                  </label>
                  <select
                    value={argemoneOilStatus}
                    onChange={(e) => setArgemoneOilStatus(e.target.value as ArgemoneTestResult)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="NEGATIVE_PASS_SAFE">Negative (Safe Pass)</option>
                    <option value="POSITIVE_CONTAMINATED_SEIZED">Positive (Toxic Contamination)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Adulteration Screening
                  </label>
                  <select
                    value={adulterationStatus}
                    onChange={(e) => setAdulterationStatus(e.target.value as AdulterationScreeningStatus)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PURE_UNADULTERATED">Pure & Unadulterated</option>
                    <option value="ADULTERATED_PALM_DILUTION">Palm Oil Dilution</option>
                    <option value="ADULTERATED_MINERAL_OIL">Mineral Oil Adulteration</option>
                  </select>
                </div>
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
                  disabled={isCreatingTest}
                  className="w-1/2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-950/40"
                >
                  {isCreatingTest ? 'Submitting...' : 'Issue Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedTestDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-emerald-500/40 p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-100">Official BSTI Purity Report</h3>
              </div>
              <span className="font-mono text-xs text-amber-400">#{selectedTestDetail.testReportNumber}</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Sample Name:</span>
                <span className="text-slate-200 font-semibold">{selectedTestDetail.sampleName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Laboratory:</span>
                <span className="text-slate-200">{selectedTestDetail.testingLabName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Signatory Chemist:</span>
                <span className="text-slate-200">{selectedTestDetail.leadChemistName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Purity Grade:</span>
                <span className="text-purple-400 font-bold">{selectedTestDetail.purityGrade.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Refractive Index:</span>
                <span className="text-slate-200 font-mono">{selectedTestDetail.refractiveIndex}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Free Fatty Acid (FFA):</span>
                <span className="text-emerald-400 font-bold">{selectedTestDetail.freeFattyAcidPct}% (Limit &le; 1.50%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Peroxide Value (POV):</span>
                <span className="text-emerald-400 font-bold">{selectedTestDetail.peroxideValueMeq} meq/kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Allyl Isothiocyanate:</span>
                <span className="text-amber-400 font-bold">{selectedTestDetail.allylIsothiocyanatePct}%</span>
              </div>
            </div>

            {selectedTestDetail.authenticitySealNumber && (
              <div className="p-3 rounded-xl bg-slate-800 border border-amber-500/30 flex items-center gap-3">
                <QrCode className="w-8 h-8 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-400 block">Digital Verification QR Seal:</span>
                  <span className="font-mono text-amber-300 font-bold">{selectedTestDetail.authenticitySealNumber}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedTestDetail(null)}
              className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition mt-4"
            >
              Close Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
