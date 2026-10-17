'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  CheckCircle2,
  AlertTriangle,
  Flame,
  PlusCircle,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Scale,
  Sparkles,
  Layers,
  Thermometer,
  Percent,
  QrCode,
} from 'lucide-react';
import {
  useGetSpiceLabTestsQuery,
  useCreateSpiceLabTestMutation,
  useGetSpiceDryingBatchesQuery,
  SpiceType,
  SpicePurityGrade,
  AdulterationTestStatus,
  SpicePurityLabTest,
} from '../spiceMarketApi';

export const AdminBstiPurityHubView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lab_tests' | 'new_test' | 'regulatory_audit'>('lab_tests');

  const [filterSpiceType, setFilterSpiceType] = useState<SpiceType | 'ALL'>('ALL');
  const [filterPurityGrade, setFilterPurityGrade] = useState<SpicePurityGrade | 'ALL'>('ALL');

  const { data: labTests = [], isLoading: testsLoading, refetch: refetchTests } =
    useGetSpiceLabTestsQuery(
      filterSpiceType !== 'ALL' || filterPurityGrade !== 'ALL'
        ? {
            spiceType: filterSpiceType !== 'ALL' ? filterSpiceType : undefined,
            purityGrade: filterPurityGrade !== 'ALL' ? filterPurityGrade : undefined,
          }
        : undefined,
    );

  const { data: dryingBatches = [] } = useGetSpiceDryingBatchesQuery();

  // Create Lab Test Form State
  const [batchId, setBatchId] = useState('');
  const [spiceType, setSpiceType] = useState<SpiceType>('TURMERIC');
  const [sampleName, setSampleName] = useState('Natore Fresh Rhizome Solar-Dried Powder Composite');
  const [testingLabName, setTestingLabName] = useState('BSTI Chemical Testing Laboratory, Dhaka');
  const [sudanDyeStatus, setSudanDyeStatus] =
    useState<AdulterationTestStatus>('NEGATIVE_NOT_DETECTED');
  const [leadChromateStatus, setLeadChromateStatus] =
    useState<AdulterationTestStatus>('NEGATIVE_NOT_DETECTED');
  const [metanilYellowStatus, setMetanilYellowStatus] =
    useState<AdulterationTestStatus>('NEGATIVE_NOT_DETECTED');
  const [moisturePct, setMoisturePct] = useState(8.8);
  const [aflatoxinB1Ppb, setAflatoxinB1Ppb] = useState(1.8);
  const [curcuminPct, setCurcuminPct] = useState(5.4);
  const [scovilleHeatUnits, setScovilleHeatUnits] = useState(0);
  const [essentialOilPct, setEssentialOilPct] = useState(3.6);
  const [leadChemistName, setLeadChemistName] = useState('Dr. Sultana Razia, Senior Spectroscopist');
  const [createTestMessage, setCreateTestMessage] = useState('');

  const [createLabTest, { isLoading: isCreatingTest }] = useCreateSpiceLabTestMutation();

  // Detailed Modal View
  const [selectedTestDetail, setSelectedTestDetail] = useState<SpicePurityLabTest | null>(null);

  const handleCreateLabTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreateTestMessage('');
      await createLabTest({
        batchId: batchId || undefined,
        spiceType,
        sampleName,
        testingLabName,
        sudanDyeStatus,
        leadChromateStatus,
        metanilYellowStatus,
        moisturePct: Number(moisturePct),
        aflatoxinB1Ppb: Number(aflatoxinB1Ppb),
        curcuminPct: spiceType === 'TURMERIC' ? Number(curcuminPct) : undefined,
        scovilleHeatUnits: spiceType === 'CHILLI' ? Number(scovilleHeatUnits) : undefined,
        essentialOilPct: Number(essentialOilPct) > 0 ? Number(essentialOilPct) : undefined,
        leadChemistName,
      }).unwrap();

      setCreateTestMessage('BSTI Spectroscopic Lab Certificate registered & seal issued!');
      setTimeout(() => {
        setCreateTestMessage('');
        setActiveTab('lab_tests');
      }, 1500);
    } catch (err: any) {
      setCreateTestMessage(err?.data?.message || 'Failed to record lab test report.');
    }
  };

  const totalTestsCount = labTests.length;
  const passedTestsCount = labTests.filter(
    (t) => t.purityGrade === 'PURE_GRADE_AAA_EXPORT' || t.purityGrade === 'STANDARD_GRADE_A_DOMESTIC',
  ).length;
  const adulteratedCount = labTests.filter(
    (t) => t.purityGrade === 'ADULTERATED_REJECTED',
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-red-600/30 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>BSTI & BARI SRC Regulatory Desk • রাসায়নিক ভেজালরোধী পরীক্ষণ ও সনদ</span>
            </div>
            <h1 className="mt-2 text-2xl font-black md:text-3xl">
              Spices Anti-Adulteration & Authenticity Certification Hub
            </h1>
            <p className="mt-1 max-w-2xl text-slate-300 text-sm">
              Spectrophotometric verification against carcinogenic Sudan dyes (I-IV), lead chromate (PbCrO₄) polish,
              metanil yellow, and Aspergillus flavus aflatoxin B1 enforcement under Bangladesh Food Safety Act 2013.
            </p>
          </div>

          <div>
            <button
              onClick={() => setActiveTab('new_test')}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 font-bold text-slate-950 shadow-md transition hover:bg-emerald-400"
            >
              <PlusCircle className="h-4 w-4" />
              Issue Lab Certificate
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Total Tested Samples</span>
            <FileText className="h-4 w-4 text-slate-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {totalTestsCount}
          </p>
          <span className="text-xs text-slate-500 font-medium">BSTI Certified Database</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Pure Grade Lots</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {passedTestsCount}
          </p>
          <span className="text-xs text-emerald-600 font-medium">Export AAA & Domestic Grade A</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Seized Adulterations</span>
            <ShieldAlert className="h-4 w-4 text-red-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-red-600">
            {adulteratedCount}
          </p>
          <span className="text-xs text-red-600 font-medium">Zero-Tolerance Confiscations</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Aflatoxin B1 Safe Limit</span>
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            ≤ 5.0 ppb
          </p>
          <span className="text-xs text-blue-600 font-medium">ESA & BSTI Standard</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('lab_tests')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
            activeTab === 'lab_tests'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Award className="h-4 w-4" />
          Lab Certificate Ledger ({labTests.length})
        </button>
        <button
          onClick={() => setActiveTab('new_test')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
            activeTab === 'new_test'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <PlusCircle className="h-4 w-4" />
          Issue Certificate
        </button>
        <button
          onClick={() => setActiveTab('regulatory_audit')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
            activeTab === 'regulatory_audit'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          Anti-Adulteration Watch & Seizures
        </button>
      </div>

      {/* Tab 1: Lab Tests Ledger */}
      {activeTab === 'lab_tests' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase text-slate-500">Filter By:</span>
              <select
                value={filterSpiceType}
                onChange={(e) => setFilterSpiceType(e.target.value as any)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="ALL">All Commodities</option>
                <option value="CHILLI">Chilli</option>
                <option value="TURMERIC">Turmeric</option>
                <option value="GINGER">Ginger</option>
                <option value="GARLIC">Garlic</option>
                <option value="CORIANDER">Coriander</option>
                <option value="BLACK_CUMIN">Black Cumin</option>
                <option value="ONION_SEED">Onion Seed</option>
              </select>

              <select
                value={filterPurityGrade}
                onChange={(e) => setFilterPurityGrade(e.target.value as any)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="ALL">All Grades</option>
                <option value="PURE_GRADE_AAA_EXPORT">Pure Grade AAA (Export)</option>
                <option value="STANDARD_GRADE_A_DOMESTIC">Standard Grade A (Domestic)</option>
                <option value="SUBSTANDARD_INDUSTRIAL">Substandard Industrial</option>
                <option value="ADULTERATED_REJECTED">Adulterated (Seized)</option>
              </select>
            </div>

            <button
              onClick={() => refetchTests()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          {testsLoading ? (
            <div className="py-12 text-center text-slate-500">Loading lab test certificates...</div>
          ) : labTests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              <FileText className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                No lab certificates match the selected filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3">Report / Seal</th>
                    <th className="px-4 py-3">Sample & Commodity</th>
                    <th className="px-4 py-3">Sudan Dyes (I-IV)</th>
                    <th className="px-4 py-3">Lead Chromate (PbCrO₄)</th>
                    <th className="px-4 py-3">Metanil Yellow</th>
                    <th className="px-4 py-3">Moisture %</th>
                    <th className="px-4 py-3">Aflatoxin B1</th>
                    <th className="px-4 py-3">Potency Marker</th>
                    <th className="px-4 py-3">Purity Grade</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {labTests.map((test) => (
                    <tr key={test.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {test.testReportNumber}
                        </div>
                        {test.authenticitySealNumber && (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-600">
                            <QrCode className="h-3 w-3" />
                            {test.authenticitySealNumber}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {test.sampleName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {test.spiceType} • {test.testingLabName}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded px-2 py-0.5 font-bold ${
                            test.sudanDyeStatus === 'NEGATIVE_NOT_DETECTED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {test.sudanDyeStatus === 'NEGATIVE_NOT_DETECTED' ? 'SAFE NEGATIVE' : 'SEIZED SUDAN'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded px-2 py-0.5 font-bold ${
                            test.leadChromateStatus === 'NEGATIVE_NOT_DETECTED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {test.leadChromateStatus === 'NEGATIVE_NOT_DETECTED' ? 'LEAD FREE' : 'SEIZED LEAD'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded px-2 py-0.5 font-bold ${
                            test.metanilYellowStatus === 'NEGATIVE_NOT_DETECTED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {test.metanilYellowStatus === 'NEGATIVE_NOT_DETECTED' ? 'NEGATIVE' : 'SEIZED DYE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        <span
                          className={test.moisturePct <= 10.0 ? 'text-emerald-600' : 'text-amber-600'}
                        >
                          {test.moisturePct}%
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        <span
                          className={test.aflatoxinB1Ppb <= 5.0 ? 'text-emerald-600' : 'text-red-600'}
                        >
                          {test.aflatoxinB1Ppb} ppb
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {test.curcuminPct ? `Curcumin ${test.curcuminPct}%` : ''}
                        {test.scovilleHeatUnits ? `${test.scovilleHeatUnits.toLocaleString()} SHU` : ''}
                        {test.essentialOilPct ? `Oil ${test.essentialOilPct}%` : ''}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            test.purityGrade === 'PURE_GRADE_AAA_EXPORT'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : test.purityGrade === 'STANDARD_GRADE_A_DOMESTIC'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : test.purityGrade === 'SUBSTANDARD_INDUSTRIAL'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {test.purityGrade.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedTestDetail(test)}
                          className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          View Certificate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Issue New Lab Certificate Form */}
      {activeTab === 'new_test' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="max-w-3xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Issue Official BSTI / BARI SRC Spectroscopic Certificate
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Record laboratory chemical assays, evaluate adulteration status against banned dyes, and generate QR authenticity seals.
            </p>

            {createTestMessage && (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {createTestMessage}
              </div>
            )}

            <form onSubmit={handleCreateLabTestSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Sample Title / Lot Identification
                  </label>
                  <input
                    type="text"
                    required
                    value={sampleName}
                    onChange={(e) => setSampleName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Authorized Testing Laboratory
                  </label>
                  <input
                    type="text"
                    required
                    value={testingLabName}
                    onChange={(e) => setTestingLabName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Commodity Under Test
                  </label>
                  <select
                    value={spiceType}
                    onChange={(e) => setSpiceType(e.target.value as SpiceType)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="TURMERIC">Turmeric (হলুদ)</option>
                    <option value="CHILLI">Chilli (মরিচ)</option>
                    <option value="GINGER">Ginger (আদা)</option>
                    <option value="GARLIC">Garlic (রসুন)</option>
                    <option value="CORIANDER">Coriander (ধনে)</option>
                    <option value="BLACK_CUMIN">Black Cumin (কালোজিরা)</option>
                    <option value="ONION_SEED">Onion Seed (পেঁয়াজ বীজ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Link Source Drying Batch (Optional)
                  </label>
                  <select
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">No Batch Linked</option>
                    {dryingBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batchNumber} - {b.varietyName} ({b.growerCoopName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chemical Adulteration Checks */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <h3 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                  Spectrophotometric & Chemical Adulteration Assays
                </h3>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Sudan Dyes (I-IV)
                    </label>
                    <select
                      value={sudanDyeStatus}
                      onChange={(e) => setSudanDyeStatus(e.target.value as AdulterationTestStatus)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="NEGATIVE_NOT_DETECTED">NEGATIVE (Not Detected)</option>
                      <option value="POSITIVE_ADULTERATED">POSITIVE (Adulterated)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Lead Chromate (PbCrO₄)
                    </label>
                    <select
                      value={leadChromateStatus}
                      onChange={(e) => setLeadChromateStatus(e.target.value as AdulterationTestStatus)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="NEGATIVE_NOT_DETECTED">NEGATIVE (Lead Free)</option>
                      <option value="POSITIVE_ADULTERATED">POSITIVE (Toxic Adulterant)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Metanil Yellow Dye
                    </label>
                    <select
                      value={metanilYellowStatus}
                      onChange={(e) => setMetanilYellowStatus(e.target.value as AdulterationTestStatus)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="NEGATIVE_NOT_DETECTED">NEGATIVE (Not Detected)</option>
                      <option value="POSITIVE_ADULTERATED">POSITIVE (Adulterated)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Physical & Mold Markers */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Finished Moisture Content (%) [Limit: ≤ 10%]
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={moisturePct}
                    onChange={(e) => setMoisturePct(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Aflatoxin B1 (ppb) [Limit: ≤ 5.0 ppb]
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={aflatoxinB1Ppb}
                    onChange={(e) => setAflatoxinB1Ppb(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Potency Markers */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {spiceType === 'TURMERIC' && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                      Curcumin Content (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={curcuminPct}
                      onChange={(e) => setCurcuminPct(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                )}
                {spiceType === 'CHILLI' && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                      Scoville Heat Units (SHU)
                    </label>
                    <input
                      type="number"
                      step="500"
                      value={scovilleHeatUnits}
                      onChange={(e) => setScovilleHeatUnits(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Essential Volatile Oil (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={essentialOilPct}
                    onChange={(e) => setEssentialOilPct(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    Lead Analytical Chemist Name
                  </label>
                  <input
                    type="text"
                    required
                    value={leadChemistName}
                    onChange={(e) => setLeadChemistName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCreatingTest}
                  className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-500 disabled:opacity-50"
                >
                  {isCreatingTest ? 'Evaluating & Certifying...' : 'Issue Official BSTI Purity Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Anti-Adulteration Watch & Seizures */}
      {activeTab === 'regulatory_audit' && (
        <div className="space-y-6">
          {/* Statutory Limits Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/30">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <ShieldAlert className="h-5 w-5" />
                <h3 className="font-bold">Zero Tolerance: Banned Industrial Dyes</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-red-800 dark:text-red-300">
                Sudan dyes (I, II, III, IV) and Metanil Yellow are non-food grade azo dyes classified as Group 3 carcinogens.
                Any detectable trace triggers immediate mandatory lot seizure and mobile court confiscation under Bangladesh Food Safety Act 2013.
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/30">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-bold">Lead Chromate (PbCrO₄) Polish Ban</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                Used illegally to impart bright golden luster to substandard turmeric roots.
                Causes irreversible neurotoxicity. BSTI and BARI enforce strict spectrophotometric screening for heavy metal lead ions.
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/50 dark:bg-blue-950/30">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <ShieldCheck className="h-5 w-5" />
                <h3 className="font-bold">Moisture & Aflatoxin B1 Safe Bounds</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-blue-800 dark:text-blue-300">
                Safe warehousing moisture must remain ≤ 10.0% to prevent fungal colonisation by <em>Aspergillus flavus</em>.
                Aflatoxin B1 cannot exceed 5.0 ppb. Parabolic solar tunnels guarantee compliance.
              </p>
            </div>
          </div>

          {/* Seizure Watch Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Regulatory Interventions & Seized Lots Watch
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Samples flagged as adulterated or exceeding regulatory thresholds under DNCRP & BFSA oversight.
            </p>

            <div className="mt-4 space-y-3">
              {labTests.filter((t) => t.purityGrade === 'ADULTERATED_REJECTED').length === 0 ? (
                <div className="rounded-xl bg-emerald-50 p-6 text-center text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
                  <p className="mt-2 font-bold text-sm">No Contaminated or Seized Batches Detected</p>
                  <p className="text-xs">All monitored regional spice supply chains conform to safety benchmarks.</p>
                </div>
              ) : (
                labTests
                  .filter((t) => t.purityGrade === 'ADULTERATED_REJECTED')
                  .map((t) => (
                    <div
                      key={t.id}
                      className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-red-900/50 dark:bg-red-950/20"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-red-700 dark:text-red-400">
                            {t.testReportNumber}
                          </span>
                          <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            MANDATORY SEIZURE
                          </span>
                        </div>
                        <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                          {t.sampleName}
                        </h4>
                        <p className="text-xs text-red-700 dark:text-red-400">
                          {t.sudanDyeStatus === 'POSITIVE_ADULTERATED' && '• Positive for Sudan Dye I-IV '}
                          {t.leadChromateStatus === 'POSITIVE_ADULTERATED' && '• Positive for Lead Chromate '}
                          {t.metanilYellowStatus === 'POSITIVE_ADULTERATED' && '• Positive for Metanil Yellow '}
                          {t.aflatoxinB1Ppb > 5.0 && `• Aflatoxin B1 high (${t.aflatoxinB1Ppb} ppb) `}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Tested by {t.testingLabName}
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Signed: {t.leadChemistName}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Certificate Details Modal */}
      {selectedTestDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-emerald-600">BSTI CERTIFICATE OF ANALYSIS</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedTestDetail.testReportNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTestDetail(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                <span className="font-semibold text-slate-500">Sample Specification:</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedTestDetail.sampleName}
                </p>
                <p className="text-slate-500">
                  {selectedTestDetail.spiceType} • {selectedTestDetail.testingLabName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-800">
                  <span className="text-slate-500">Sudan Dye (I-IV):</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {selectedTestDetail.sudanDyeStatus}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-800">
                  <span className="text-slate-500">Lead Chromate (PbCrO₄):</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {selectedTestDetail.leadChromateStatus}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-800">
                  <span className="text-slate-500">Finished Moisture:</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {selectedTestDetail.moisturePct}%
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-800">
                  <span className="text-slate-500">Aflatoxin B1:</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {selectedTestDetail.aflatoxinB1Ppb} ppb
                  </p>
                </div>
              </div>

              {selectedTestDetail.authenticitySealNumber && (
                <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-6 w-6" />
                    <div>
                      <span className="block font-bold">Digital Authenticity QR Seal</span>
                      <span className="font-mono text-xs">{selectedTestDetail.authenticitySealNumber}</span>
                    </div>
                  </div>
                  <span className="font-bold">VERIFIED PURE</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <div>
                  <span className="text-slate-400">Certified by:</span>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {selectedTestDetail.leadChemistName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTestDetail(null)}
                  className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-white transition hover:bg-slate-800 dark:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
