'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  AlertTriangle,
  Award,
  CheckCircle2,
  FileText,
  Search,
  Filter,
  Flame,
  PlusCircle,
  X,
  QrCode,
  Building2,
  Scale,
  Zap,
  Droplets,
  Thermometer,
  ShoppingBag,
} from 'lucide-react';
import {
  useGetSweetmeatLabTestsQuery,
  useCreateSweetmeatLabTestMutation,
  SweetmeatType,
  SweetmeatPurityGrade,
  StarchAdulterationTest,
  SweetmeatPurityLabTest,
} from '../artisanalSweetmeatsApi';

export const AdminBstiSweetmeatPurityHubView: React.FC = () => {
  const { data: tests = [], isLoading } = useGetSweetmeatLabTestsQuery();

  // Create Lab Test Modal State
  const [isCreateTestOpen, setIsCreateTestOpen] = useState(false);
  const [batchId, setBatchId] = useState('');
  const [sampleName, setSampleName] = useState('Bogura Shahi Curd Official Market Sample');
  const [sweetmeatType, setSweetmeatType] = useState<SweetmeatType>('BOGURA_SPECIAL_CURD_DOI');
  const [testingLabName, setTestingLabName] = useState('BSTI Central Chemical Testing Laboratory, Dhaka');
  const [leadChemistName, setLeadChemistName] = useState('Dr. S. M. Nazmul Huq, Chief Food Analyst');
  const [milkFatDryMatterPct, setMilkFatDryMatterPct] = useState<number>(32.5);
  const [moisturePct, setMoisturePct] = useState<number>(54.0);
  const [starchStatus, setStarchStatus] =
    useState<StarchAdulterationTest>('NEGATIVE_ZERO_TOLERANCE_PASS');
  const [isDetergentOrUrea, setIsDetergentOrUrea] = useState(false);
  const [isVanaspati, setIsVanaspati] = useState(false);
  const [isColoring, setIsColoring] = useState(false);
  const [totalAcidityLacticPct, setTotalAcidityLacticPct] = useState<number>(0.85);
  const [sensoryTasteScore, setSensoryTasteScore] = useState<number>(9.8);

  const [createTestMutation, { isLoading: isCreatingTest }] = useCreateSweetmeatLabTestMutation();

  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<SweetmeatType | 'ALL'>('ALL');
  const [filterGrade, setFilterGrade] = useState<SweetmeatPurityGrade | 'ALL'>('ALL');

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    try {
      await createTestMutation({
        batchId: batchId || undefined,
        sweetmeatType,
        sampleName,
        testingLabName,
        leadChemistName,
        milkFatDryMatterPct,
        moisturePct,
        starchAdulterationStatus: starchStatus,
        isDetergentOrUreaDetected: isDetergentOrUrea,
        isHydrogenatedFatVanaspatiDetected: isVanaspati,
        isArtificialColoringDetected: isColoring,
        totalAcidityLacticPct,
        sensoryTasteScore,
      }).unwrap();

      setStatusMessage({
        text: 'Sweetmeat chemical purity analysis logged & digital GI seal issued!',
        isError: false,
      });
      setIsCreateTestOpen(false);
    } catch (err: any) {
      setStatusMessage({
        text: err?.data?.message || 'Failed to submit sweetmeat lab test',
        isError: true,
      });
    }
  };

  // Metrics
  const totalTests = tests.length;
  const approvedCount = tests.filter((t) => t.isBstiApproved).length;
  const giCertifiedCount = tests.filter((t) => t.isGiCompliant).length;
  const seizuresCount = tests.filter(
    (t) =>
      t.starchAdulterationStatus === 'POSITIVE_STARCH_DETECTED_SEIZED' ||
      t.isDetergentOrUreaDetected ||
      t.isHydrogenatedFatVanaspatiDetected ||
      t.isArtificialColoringDetected,
  ).length;

  const filteredTests = tests.filter((t) => {
    if (filterType !== 'ALL' && t.sweetmeatType !== filterType) return false;
    if (filterGrade !== 'ALL' && t.purityGrade !== filterGrade) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-stone-100 py-10 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-500 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                BSTI & BFSA Regulatory Desk
              </span>
              <span className="bg-rose-950/80 text-rose-300 border border-rose-600/50 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Zero Tolerance Adulteration
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              BSTI Sweetmeat & Chhana Quality Assurance Desk
            </h1>
            <p className="mt-2 text-stone-300 text-sm sm:text-base max-w-2xl">
              National anti-adulteration and GI heritage verification desk. Screen against starch fillers,
              synthetic milk urea/detergent, and vanaspati trans-fats; issue digital QR authenticity seals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateTestOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5" />
              Register BSTI Lab Test
            </button>
            <Link
              href="/artisanal-sweetmeats"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-semibold rounded-xl border border-stone-600 shadow-sm"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              Marketplace
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Status Message */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center justify-between border ${
              statusMessage.isError
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {statusMessage.isError ? (
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              )}
              <span className="text-sm font-medium">{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Regulatory Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Total Tested Lots
              </span>
              <FileText className="w-5 h-5 text-stone-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-stone-900">{totalTests}</span>
              <span className="text-xs text-stone-500">Official Reports</span>
            </div>
            <p className="mt-2 text-xs text-stone-400">Regional laboratory submissions</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                BSTI Approved Pass Rate
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-stone-900">
                {totalTests > 0 ? ((approvedCount / totalTests) * 100).toFixed(1) : 0}%
              </span>
              <span className="text-xs text-emerald-600 font-semibold">{approvedCount} Passed</span>
            </div>
            <p className="mt-2 text-xs text-stone-400">Compliant with BDS standards</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                GI Authenticity Seals
              </span>
              <Award className="w-5 h-5 text-amber-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-stone-900">{giCertifiedCount}</span>
              <span className="text-xs text-amber-700 font-semibold">Grade AAA</span>
            </div>
            <p className="mt-2 text-xs text-stone-400">Protected origin heritage verified</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Adulteration Seizures
              </span>
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-600">{seizuresCount}</span>
              <span className="text-xs text-rose-600 font-semibold">Seized / Blocked</span>
            </div>
            <p className="mt-2 text-xs text-stone-400">Zero tolerance for starch & vanaspati</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div>
              <label className="text-xs font-semibold text-stone-600 mr-2">Sweetmeat:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as SweetmeatType | 'ALL')}
                className="text-xs font-medium bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="ALL">All Varieties</option>
                <option value="BOGURA_SPECIAL_CURD_DOI">Bogura Special Curd (দই)</option>
                <option value="NATORE_AUTHENTIC_KACHAGOLLA">Natore Kachagolla (কাঁচাগোল্লা)</option>
                <option value="PORABARI_CHAMCHAM">Porabari Chamcham (চমচম)</option>
                <option value="COMILLA_RASMALAI_MATRI_BHANDAR">Comilla Rasmalai (রসমালাই)</option>
                <option value="NETROKONA_BALISH_MISTI">Netrokona Balish Misti (বালিশ)</option>
                <option value="PURE_COW_MILK_CHHANA">Pure Cow Milk Chhana (ছানা)</option>
                <option value="TRADITIONAL_GAWA_GHEE">Traditional Gawa Ghee (ঘি)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-600 mr-2">Purity Grade:</label>
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value as SweetmeatPurityGrade | 'ALL')}
                className="text-xs font-medium bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="ALL">All Grades</option>
                <option value="GRADE_AAA_GI_CERTIFIED_HERITAGE">Grade AAA GI Heritage</option>
                <option value="GRADE_A_PURE_ARTISANAL">Grade A Pure Artisanal</option>
                <option value="COMMERCIAL_STANDARD">Commercial Standard</option>
                <option value="REJECTED_ADULTERATED">Rejected Adulterated</option>
              </select>
            </div>
          </div>

          <span className="text-xs text-stone-500 font-medium">
            Showing <strong className="text-stone-800">{filteredTests.length}</strong> lab certificates
          </span>
        </div>

        {/* Lab Tests Table / Cards */}
        {isLoading ? (
          <div className="py-20 text-center text-stone-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mb-3"></div>
            <p>Loading BSTI surveillance laboratory reports...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
            <ShieldCheck className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800">No Inspection Reports Found</h3>
            <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
              No laboratory reports match your filter criteria. Register a new lab certificate above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTests.map((test) => {
              const isAdulterated =
                test.starchAdulterationStatus === 'POSITIVE_STARCH_DETECTED_SEIZED' ||
                test.isDetergentOrUreaDetected ||
                test.isHydrogenatedFatVanaspatiDetected ||
                test.isArtificialColoringDetected;

              return (
                <div
                  key={test.id}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-sm ${
                    isAdulterated
                      ? 'border-rose-300 bg-rose-50/20'
                      : 'border-stone-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left: Info */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-stone-100 text-stone-800 px-2 py-0.5 rounded">
                          {test.testReportNumber}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            test.purityGrade === 'GRADE_AAA_GI_CERTIFIED_HERITAGE'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : test.purityGrade === 'GRADE_A_PURE_ARTISANAL'
                              ? 'bg-emerald-100 text-emerald-800'
                              : test.purityGrade === 'REJECTED_ADULTERATED'
                              ? 'bg-rose-100 text-rose-800 font-bold'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {test.purityGrade.replace(/_/g, ' ')}
                        </span>

                        {test.authenticitySealNumber && (
                          <span className="inline-flex items-center gap-1 text-xs font-mono bg-amber-50 border border-amber-300 text-amber-900 px-2 py-0.5 rounded">
                            <QrCode className="w-3 h-3 text-amber-700" />
                            {test.authenticitySealNumber}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-stone-900 mt-1">{test.sampleName}</h3>
                      <p className="text-xs text-stone-500">
                        {test.sweetmeatType.replace(/_/g, ' ')} • Lab: {test.testingLabName} • Analyst:{' '}
                        {test.leadChemistName}
                      </p>
                    </div>

                    {/* Right: Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs">
                      <div>
                        <span className="text-stone-400 block">Milk Fat (Dry):</span>
                        <strong
                          className={test.milkFatDryMatterPct >= 25 ? 'text-emerald-700' : 'text-rose-600'}
                        >
                          {test.milkFatDryMatterPct}% (Min 25%)
                        </strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Moisture:</span>
                        <strong className="text-stone-800">{test.moisturePct}%</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Lactic Acidity:</span>
                        <strong className="text-stone-800">{test.totalAcidityLacticPct}%</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Sensory Score:</span>
                        <strong className="text-amber-800 font-bold">{test.sensoryTasteScore}/10</strong>
                      </div>
                    </div>
                  </div>

                  {/* Adulteration & Compliance Banner */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          test.starchAdulterationStatus === 'NEGATIVE_ZERO_TOLERANCE_PASS'
                            ? 'text-emerald-700'
                            : 'text-rose-700 font-bold'
                        }`}
                      >
                        {test.starchAdulterationStatus === 'NEGATIVE_ZERO_TOLERANCE_PASS' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                        Starch Test: {test.starchAdulterationStatus.replace(/_/g, ' ')}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 ${
                          test.isDetergentOrUreaDetected ? 'text-rose-700 font-bold' : 'text-stone-500'
                        }`}
                      >
                        Urea/Detergent:{' '}
                        <strong>{test.isDetergentOrUreaDetected ? 'DETECTED!' : 'None'}</strong>
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 ${
                          test.isHydrogenatedFatVanaspatiDetected
                            ? 'text-rose-700 font-bold'
                            : 'text-stone-500'
                        }`}
                      >
                        Vanaspati/Dalda:{' '}
                        <strong>{test.isHydrogenatedFatVanaspatiDetected ? 'DETECTED!' : 'None'}</strong>
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 ${
                          test.isArtificialColoringDetected ? 'text-rose-700 font-bold' : 'text-stone-500'
                        }`}
                      >
                        Synthetic Dyes:{' '}
                        <strong>{test.isArtificialColoringDetected ? 'DETECTED!' : 'None'}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                          test.isBstiApproved
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {test.isBstiApproved ? 'BSTI APPROVED' : 'BSTI REJECTED / SEIZED'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Create Sweetmeat Lab Test */}
      {isCreateTestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold text-stone-900">
                  Register BSTI Chemical Lab Certificate
                </h3>
              </div>
              <button
                onClick={() => setIsCreateTestOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="mt-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Sample Identification Name
                </label>
                <input
                  type="text"
                  required
                  value={sampleName}
                  onChange={(e) => setSampleName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Confectionery Type
                  </label>
                  <select
                    value={sweetmeatType}
                    onChange={(e) => setSweetmeatType(e.target.value as SweetmeatType)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="BOGURA_SPECIAL_CURD_DOI">Bogura Special Curd (বগুড়ার দই)</option>
                    <option value="NATORE_AUTHENTIC_KACHAGOLLA">Natore Kachagolla (কাঁচাগোল্লা)</option>
                    <option value="PORABARI_CHAMCHAM">Porabari Chamcham (পোড়াবাড়ীর চমচম)</option>
                    <option value="COMILLA_RASMALAI_MATRI_BHANDAR">Comilla Rasmalai (রসমালাই)</option>
                    <option value="NETROKONA_BALISH_MISTI">Netrokona Balish Misti (বালিশ)</option>
                    <option value="PURE_COW_MILK_CHHANA">Pure Cow Milk Chhana (ছানা)</option>
                    <option value="TRADITIONAL_GAWA_GHEE">Traditional Gawa Ghee (ঘি)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Optional Batch ID
                  </label>
                  <input
                    type="text"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    placeholder="e.g. uuid-or-batch-no"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Testing Lab</label>
                  <input
                    type="text"
                    required
                    value={testingLabName}
                    onChange={(e) => setTestingLabName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Lead Chemist</label>
                  <input
                    type="text"
                    required
                    value={leadChemistName}
                    onChange={(e) => setLeadChemistName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Milk Fat Dry (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="100"
                    required
                    value={milkFatDryMatterPct}
                    onChange={(e) => setMilkFatDryMatterPct(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Moisture (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="90"
                    required
                    value={moisturePct}
                    onChange={(e) => setMoisturePct(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Acidity %</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="5"
                    required
                    value={totalAcidityLacticPct}
                    onChange={(e) => setTotalAcidityLacticPct(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Sensory Score (1-10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    required
                    value={sensoryTasteScore}
                    onChange={(e) => setSensoryTasteScore(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Iodine Starch Adulteration Screen
                </label>
                <select
                  value={starchStatus}
                  onChange={(e) => setStarchStatus(e.target.value as StarchAdulterationTest)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                >
                  <option value="NEGATIVE_ZERO_TOLERANCE_PASS">
                    NEGATIVE: Zero Tolerance Pass (খাঁটি দুধের ছানা)
                  </option>
                  <option value="POSITIVE_STARCH_DETECTED_SEIZED">
                    POSITIVE: Starch / Flour Detected (ভেজাল শনাক্ত - জব্দ আদেশ)
                  </option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100">
                <span className="block font-semibold text-stone-700">Chemical Adulteration Screen</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDetergentOrUrea}
                      onChange={(e) => setIsDetergentOrUrea(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <span className="text-xs font-medium text-stone-700">Detergent / Urea</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVanaspati}
                      onChange={(e) => setIsVanaspati(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <span className="text-xs font-medium text-stone-700">Vanaspati (Dalda)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isColoring}
                      onChange={(e) => setIsColoring(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <span className="text-xs font-medium text-stone-700">Synthetic Dyes</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreateTestOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTest}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {isCreatingTest ? 'Submitting...' : 'Issue Certificate & Seal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
