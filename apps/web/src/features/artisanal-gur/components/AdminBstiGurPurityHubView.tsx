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
} from 'lucide-react';
import {
  useGetGurLabTestsQuery,
  useCreateGurLabTestMutation,
  GurType,
  GurRegion,
  HydrosulfiteTestResult,
  SugarSyrupAdulterationStatus,
  GurPurityLabTest,
} from '../artisanalGurApi';

export const AdminBstiGurPurityHubView: React.FC = () => {
  const { data: tests = [], isLoading } = useGetGurLabTestsQuery();

  // Create Lab Test Modal State
  const [isCreateTestOpen, setIsCreateTestOpen] = useState(false);
  const [batchId, setBatchId] = useState('');
  const [coopName, setCoopName] = useState('Jhikargacha Traditional Gachhi Cooperative');
  const [region, setRegion] = useState<GurRegion>('JASHORE_JHIKARGACHA');
  const [gurType, setGurType] = useState<GurType>('DATE_PALM_NOLEN_JHOLA');
  const [hydrosulfitePpm, setHydrosulfitePpm] = useState<number>(0.0);
  const [hydrosulfiteStatus, setHydrosulfiteStatus] =
    useState<HydrosulfiteTestResult>('NEGATIVE_ZERO_TOLERANCE_PASS');
  const [sugarStatus, setSugarStatus] =
    useState<SugarSyrupAdulterationStatus>('GENUINE_PURE_SAP');
  const [sucrosePct, setSucrosePct] = useState<number>(68.5);
  const [reducingSugarPct, setReducingSugarPct] = useState<number>(12.2);
  const [tssBrix, setTssBrix] = useState<number>(78.5);
  const [leadPbPpm, setLeadPbPpm] = useState<number>(0.01);
  const [coloringDetected, setColoringDetected] = useState(false);
  const [strikeTemp, setStrikeTemp] = useState<number>(115.5);
  const [sensoryScore, setSensoryScore] = useState<number>(9.8);
  const [labName, setLabName] = useState('BSTI Regional Certification Laboratory, Khulna');
  const [inspectorName, setInspectorName] = useState('Dr. Rafiqul Islam, Senior Chemist');

  const [createTestMutation, { isLoading: isCreatingTest }] = useCreateGurLabTestMutation();

  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    try {
      await createTestMutation({
        tappingBatchId: batchId || undefined,
        gachhiCoopName: coopName,
        originRegion: region,
        gurType,
        hydrosulfitePpm,
        hydrosulfiteStatus,
        sugarAdulterationStatus: sugarStatus,
        sucrosePct,
        reducingSugarPct,
        totalSolubleSolidsBrix: tssBrix,
        leadPbPpm,
        isArtificialColoringDetected: coloringDetected,
        strikeBoilingTempCelsius: strikeTemp,
        sensoryScore,
        laboratoryName: labName,
        inspectorName,
      }).unwrap();

      setStatusMessage({ text: 'Lab purity report registered & seal generated if passed!', isError: false });
      setIsCreateTestOpen(false);
    } catch (err: any) {
      setStatusMessage({ text: err?.data?.message || 'Failed to register lab test', isError: true });
    }
  };

  const seizuresCount = tests.filter((t) => t.hydrosulfitePpm > 0 || !t.isBstiApproved).length;
  const giCertifiedCount = tests.filter((t) => t.isGiCompliant).length;
  const approvedCount = tests.filter((t) => t.isBstiApproved).length;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-stone-100 py-10 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-500 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-500/20 text-red-300 border border-red-400/30">
                BSTI & BFSA Food Safety Desk
              </span>
              <span className="text-xs text-amber-300">বিএসটিআই ও নিরাপদ খাদ্য কর্তৃপক্ষ জিআই টেস্টিং হাব</span>
            </div>
            <h1 className="text-3xl font-black font-serif tracking-tight text-white">
              Gur Chemical Purity & Anti-Adulteration Desk
            </h1>
            <p className="mt-1 text-sm text-stone-300 max-w-2xl">
              Zero-tolerance enforcement against toxic sodium hydrosulfite bleaching agent (Na2S2O4), artificial coal-tar dyes, and white cane syrup blending. Issuance of cryptographic GI seals.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsCreateTestOpen(true)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Register Chemical Lab Audit
            </button>
            <Link
              href="/artisanal-gur"
              className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-sm font-semibold transition-colors border border-stone-600"
            >
              Public Catalog
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

        {/* Regulatory Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <div className="text-xs text-stone-500 uppercase font-semibold">Total Lab Audits</div>
            <div className="text-2xl font-bold text-stone-900 mt-1">{tests.length} Reports</div>
            <div className="text-[11px] text-stone-400 mt-0.5">Spectrophotometric & HPLC</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <div className="text-xs text-stone-500 uppercase font-semibold">BSTI Approved Lots</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{approvedCount} Passed</div>
            <div className="text-[11px] text-emerald-600 mt-0.5">Complies BDS 1660</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <div className="text-xs text-stone-500 uppercase font-semibold">Grade AAA GI Sealed</div>
            <div className="text-2xl font-bold text-amber-700 mt-1">{giCertifiedCount} Certified</div>
            <div className="text-[11px] text-amber-600 mt-0.5">Jashore Heritage QR Tagged</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <div className="text-xs text-stone-500 uppercase font-semibold">Seizure Mandates</div>
            <div className="text-2xl font-bold text-red-700 mt-1">{seizuresCount} Intercepted</div>
            <div className="text-[11px] text-red-600 mt-0.5">BFSA Mobile Court Action</div>
          </div>
        </div>

        {/* Legal Advisory Banner */}
        <div className="bg-red-50 p-4 rounded-2xl border border-red-200 mb-8 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
          <div className="text-xs text-red-950 leading-relaxed">
            <strong className="font-bold">Statutory Notice Under Bangladesh Food Safety Act 2013: </strong>
            Sodium hydrosulfite (Na2S2O4 / হাইড্রোজ) is classified as an industrial bleaching chemical strictly prohibited in human consumables. 
            Any detection exceeding 0.0 ppm triggers immediate criminal confiscation of the entire boiling pan or forward lot, revocation of trade license, and referral to the Mobile Court for summary trial.
          </div>
        </div>

        {/* Lab Tests Table */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-stone-200 flex items-center justify-between">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Certified Lab Tests & Chemical Screening Ledger
            </h3>
            <span className="text-xs text-stone-500">{tests.length} Verified Entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Report Number</th>
                  <th className="px-5 py-3">Guild / Producer</th>
                  <th className="px-5 py-3">Region & Variety</th>
                  <th className="px-5 py-3">Hydrosulfite (PPM)</th>
                  <th className="px-5 py-3">Sucrose / Reducing</th>
                  <th className="px-5 py-3">Brix Density</th>
                  <th className="px-5 py-3">BSTI Grade</th>
                  <th className="px-5 py-3">Authenticity Seal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-stone-500">
                      Loading lab reports...
                    </td>
                  </tr>
                ) : tests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-stone-500">
                      No chemical lab test reports logged yet.
                    </td>
                  </tr>
                ) : (
                  tests.map((test) => (
                    <tr key={test.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-stone-900">
                        {test.testReportNumber}
                        <div className="text-[10px] text-stone-400 font-normal">{test.laboratoryName}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-stone-900">{test.gachhiCoopName}</div>
                        <div className="text-[11px] text-stone-500">{test.inspectorName}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-stone-800">{test.gurType.replace(/_/g, ' ')}</div>
                        <div className="text-[11px] text-amber-800">{test.originRegion.replace(/_/g, ' ')}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`font-bold flex items-center gap-1 ${
                            test.hydrosulfitePpm > 0 ? 'text-red-700' : 'text-emerald-700'
                          }`}
                        >
                          {test.hydrosulfitePpm > 0 ? (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5" /> {test.hydrosulfitePpm} ppm (SEIZED)
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> 0.0 ppm (Zero Pass)
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div>Sucrose: {test.sucrosePct}%</div>
                        <div className="text-[11px] text-stone-500">Reducing: {test.reducingSugarPct}%</div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-stone-800">
                        {test.totalSolubleSolidsBrix}° Brix
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            test.purityGrade === 'GRADE_AAA_GI_CERTIFIED_HERITAGE'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : test.purityGrade === 'REJECTED_ADULTERATED'
                              ? 'bg-red-100 text-red-900 border border-red-300'
                              : 'bg-stone-200 text-stone-800'
                          }`}
                        >
                          {test.purityGrade.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {test.authenticitySealNumber ? (
                          <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center gap-1">
                            <QrCode className="w-3.5 h-3.5 text-amber-700" />
                            {test.authenticitySealNumber}
                          </span>
                        ) : (
                          <span className="text-red-600 font-semibold text-[11px]">Sealed Withheld</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Register Chemical Lab Audit */}
      {isCreateTestOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateTestOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-lg text-stone-900">Register Chemical Purity Audit</h3>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Enter official spectrophotometric, polarimetric, and chromatographic testing data.
            </p>

            <form onSubmit={handleCreateTest} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Cooperative / Producer Name
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
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Origin Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  >
                    <option value="JASHORE_JHIKARGACHA">Jashore Jhikargacha (GI)</option>
                    <option value="JASHORE_KOTWALI">Jashore Kotwali (GI)</option>
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
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Sodium Hydrosulfite (ppm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={hydrosulfitePpm}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setHydrosulfitePpm(val);
                      setHydrosulfiteStatus(
                        val > 0
                          ? 'POSITIVE_CONTAMINATED_SEIZED'
                          : 'NEGATIVE_ZERO_TOLERANCE_PASS',
                      );
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Sugar Syrup Adulteration
                  </label>
                  <select
                    value={sugarStatus}
                    onChange={(e) => setSugarStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  >
                    <option value="GENUINE_PURE_SAP">Genuine 100% Pure Sap</option>
                    <option value="SUSPECTED_SUGAR_SYRUP_DILUTED">Suspected Sugar Syrup Diluted</option>
                    <option value="HIGH_SUGAR_ADULTERATED">High Sugar Adulterated</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Sucrose (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sucrosePct}
                    onChange={(e) => setSucrosePct(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Reducing Sugar (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={reducingSugarPct}
                    onChange={(e) => setReducingSugarPct(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">TSS (°Brix)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tssBrix}
                    onChange={(e) => setTssBrix(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Lead Pb (ppm)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={leadPbPpm}
                    onChange={(e) => setLeadPbPpm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Strike Temp (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={strikeTemp}
                    onChange={(e) => setStrikeTemp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Sensory (1-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    max="10"
                    value={sensoryScore}
                    onChange={(e) => setSensoryScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Testing Laboratory</label>
                  <input
                    type="text"
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Chemist / Inspector</label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={coloringDetected}
                    onChange={(e) => setColoringDetected(e.target.checked)}
                    className="rounded border-stone-300 text-amber-700 focus:ring-amber-500 w-4 h-4"
                  />
                  <span>Synthetic Dye (Metanil Yellow or Orange-II) Detected</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsCreateTestOpen(false)}
                  className="px-4 py-2 bg-stone-200 text-stone-800 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTest}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {isCreatingTest ? 'Submitting...' : 'Issue Lab Report & Seal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
