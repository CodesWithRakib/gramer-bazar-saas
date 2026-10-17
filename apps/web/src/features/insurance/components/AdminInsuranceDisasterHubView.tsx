'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  CloudRain,
  Waves,
  Wind,
  CheckCircle2,
  AlertCircle,
  Play,
  FileText,
  DollarSign,
  RefreshCw,
  Search,
  Filter,
  Sparkles,
} from 'lucide-react';
import {
  useGetAdminCropInsuranceClaimsQuery,
  useGetAdminCropInsuranceEnrollmentsQuery,
  useGetRecentTelemetryQuery,
  useSimulateWeatherTriggerMutation,
  useApproveDisasterDisbursementMutation,
  ParametricTriggerType,
  ParametricClaimDisbursement,
  ClaimPayoutMethod,
} from '../cropInsuranceApi';

export function AdminInsuranceDisasterHubView({ lang = 'en' }: { lang?: string }) {
  const isBn = lang === 'bn';

  const [activeTab, setActiveTab] = useState<'SIMULATOR' | 'CLAIMS' | 'ENROLLMENTS'>('SIMULATOR');

  // Queries
  const { data: claims = [], isLoading: isClaimsLoading, refetch: refetchClaims } = useGetAdminCropInsuranceClaimsQuery();
  const { data: enrollments = [], isLoading: isEnrLoading, refetch: refetchEnr } = useGetAdminCropInsuranceEnrollmentsQuery();
  const { data: telemetry = [], refetch: refetchTelemetry } = useGetRecentTelemetryQuery();

  // Simulator State
  const [district, setDistrict] = useState('Sunamganj');
  const [upazila, setUpazila] = useState('Tahirpur');
  const [stationName, setStationName] = useState('Surma River Gauge Station #4');
  const [triggerType, setTriggerType] = useState<ParametricTriggerType>('FLASH_FLOOD');
  const [measuredValue, setMeasuredValue] = useState<number>(2.2);
  const [unit, setUnit] = useState('danger_mark_meters');
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // Approval Modal State
  const [approvingClaim, setApprovingClaim] = useState<ParametricClaimDisbursement | null>(null);
  const [damagePct, setDamagePct] = useState<number>(100);
  const [payoutMethod, setPayoutMethod] = useState<ClaimPayoutMethod>('BKASH');
  const [payoutTransactionRef, setPayoutTransactionRef] = useState<string>('');
  const [adminApprovalNotes, setAdminApprovalNotes] = useState<string>('');

  const [simulateTrigger, { isLoading: isSimulating }] = useSimulateWeatherTriggerMutation();
  const [approveDisbursement, { isLoading: isApproving }] = useApproveDisasterDisbursementMutation();

  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulationResult(null);

    try {
      const res = await simulateTrigger({
        district: district.trim(),
        upazila: upazila.trim(),
        stationName: stationName.trim(),
        triggerType,
        measuredValue: Number(measuredValue),
        unit,
      }).unwrap();

      setSimulationResult(res);
      refetchClaims();
      refetchEnr();
      refetchTelemetry();
    } catch (err: any) {
      alert(err?.data?.message || 'Simulation failed');
    }
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingClaim) return;

    try {
      await approveDisbursement({
        id: approvingClaim.id,
        data: {
          damagePct: Number(damagePct),
          payoutMethod,
          payoutTransactionRef: payoutTransactionRef.trim() || `MFS-MANUAL-${Date.now().toString().slice(-6)}`,
          adminApprovalNotes: adminApprovalNotes.trim() || 'Approved by Agricultural Insurance Board',
        },
      }).unwrap();

      setApprovingClaim(null);
    } catch (err: any) {
      alert(err?.data?.message || 'Approval failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-sky-600" />
            <span>{isBn ? 'জলবায়ু দুর্যোগ ও প্যারামেট্রিক শস্য বীমা নিয়ন্ত্রণ হাব' : 'Parametric Weather Disaster & Claims Hub'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isBn
              ? 'আবহাওয়া ট্রিগার সিমুলেশন, নদী পানির স্তর ট্র্যাকিং ও দ্রুত স্বয়ংক্রিয় ক্ষতিপূরণ বিতরণ।'
              : 'Meteorological telemetry breach detection, parametric smart triggers, and bulk MFS claim payouts.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            refetchClaims();
            refetchEnr();
            refetchTelemetry();
          }}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('SIMULATOR')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'SIMULATOR'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {isBn ? 'আবহাওয়া স্টেশন ট্রিগার সিমুলেটর' : 'Weather Trigger Simulator'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CLAIMS')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'CLAIMS'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {isBn ? `ক্ষতিপূরণ দাবি লেজার (${claims.length})` : `Claims & Disbursements (${claims.length})`}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ENROLLMENTS')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'ENROLLMENTS'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {isBn ? `বীমাকৃত জমি বহর (${enrollments.length})` : `Enrolled Acreage (${enrollments.length})`}
        </button>
      </div>

      {/* Tab 1: Simulator */}
      {activeTab === 'SIMULATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Play className="w-4 h-4 text-sky-600 fill-sky-600" />
              <span>{isBn ? 'প্যারামেট্রিক দুর্যোগ ট্রিগার সিমুলেটর' : 'Ingest Environmental Reading'}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              {isBn
                ? 'নদী পানির স্তর বিপদসীমা অতিক্রম বা অতিবৃষ্টির রিডিং প্রবেশ করান। থ্রেশহোল্ড অতিক্রম করলে আক্রান্ত সকল কৃষকের একাউন্টে স্বয়ংক্রিয় ক্ষতিপূরণ কার্যকর হবে।'
                : 'Simulate sensor data breaches to automatically execute instant batch compensation for all enrolled farmers in the affected region.'}
            </p>

            <form onSubmit={handleSimulateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Upazila</label>
                  <input
                    type="text"
                    required
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Station Name</label>
                <input
                  type="text"
                  required
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Trigger Type</label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value as ParametricTriggerType)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value="FLASH_FLOOD">Flash Flood (আকস্মিক বন্যা)</option>
                    <option value="EXCESS_RAINFALL">Excess Rainfall (অতিবৃষ্টি)</option>
                    <option value="CYCLONE_WIND">Cyclone Wind (ঘূর্ণিঝড়)</option>
                    <option value="PROLONGED_DROUGHT">Drought (খরা)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reading Value</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={measuredValue}
                    onChange={(e) => setMeasuredValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                {isSimulating ? (
                  <span>ট্রিগার প্রসেস হচ্ছে...</span>
                ) : (
                  <>
                    <Waves className="w-4 h-4" />
                    <span>ট্রিগার রিডিং জমা ও স্বয়ংক্রিয় ক্ষতিপূরণ কার্যকর করুন</span>
                  </>
                )}
              </button>
            </form>

            {/* Simulation Result Output */}
            {simulationResult && (
              <div className="mt-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs">
                <h4 className="font-black text-emerald-800 dark:text-emerald-300 text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Parametric Trigger Execution Result</span>
                </h4>
                <div className="space-y-1 text-slate-700 dark:text-slate-300">
                  <div>Breach Detected: <strong>{simulationResult.isBreachTriggered ? 'YES' : 'NO'}</strong></div>
                  <div>Matching District Policies: <strong>{simulationResult.affectedPoliciesCount}</strong></div>
                  <div>Auto-Generated Disbursements: <strong className="text-emerald-600 font-bold">{simulationResult.disbursementsGenerated} farmers</strong></div>
                  <div>Total Compensation Paid: <strong className="text-emerald-600 font-bold">৳{simulationResult.totalCompensationAmount.toLocaleString()}</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Telemetry Stream */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-sky-600" />
              <span>Recent Sensor Telemetry</span>
            </h3>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {telemetry.map((t) => (
                <div
                  key={t.id}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    t.isBreach
                      ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900'
                      : 'bg-slate-50 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700'
                  }`}
                >
                  <div>
                    <strong className="block text-slate-900 dark:text-white text-xs">{t.stationName}</strong>
                    <span className="text-[11px] text-slate-500">{t.upazila}, {t.district}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs">{t.measuredValue} {t.unit}</span>
                    <span className="block text-[10px] text-slate-400">
                      {new Date(t.recordedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Claims Ledger */}
      {activeTab === 'CLAIMS' && (
        <div className="space-y-3">
          {isClaimsLoading ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl">
              <p className="text-xs text-slate-500">Loading claims...</p>
            </div>
          ) : claims.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500">No claims submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-600">{claim.claimNumber}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {claim.enrollment?.farmerName} ({claim.enrollment?.farmerPhone})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          claim.disbursedAt
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}
                      >
                        {claim.disbursedAt ? 'DISBURSED' : 'PENDING'}
                      </span>
                      {claim.isAutomatedTrigger && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          SMART AUTO
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">Policy / Crop:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {claim.enrollment?.policy?.titleEn}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Damage Severity:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {claim.disasterSeverity} ({claim.damagePct}%)
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Compensation Amount:</span>
                      <strong className="text-emerald-600 font-bold text-sm">
                        ৳{claim.payoutAmount.toLocaleString()}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Payout Destination:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {claim.enrollment?.payoutMfsNumber} ({claim.payoutMethod})
                      </span>
                      {claim.payoutTransactionRef && (
                        <span className="block text-[11px] font-mono text-emerald-600 truncate">
                          Trx: {claim.payoutTransactionRef}
                        </span>
                      )}
                    </div>
                  </div>

                  {claim.farmerDamageNotes && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                      Note: {claim.farmerDamageNotes}
                    </p>
                  )}

                  {!claim.disbursedAt && (
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setApprovingClaim(claim);
                          setDamagePct(claim.damagePct);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                      >
                        অনুমোদন ও অর্থ ছাড় করুন
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Enrolled Acreage */}
      {activeTab === 'ENROLLMENTS' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                <th className="pb-3">Certificate Ref</th>
                <th className="pb-3">Farmer</th>
                <th className="pb-3">Plot Location</th>
                <th className="pb-3">Land Area</th>
                <th className="pb-3">Sum Insured</th>
                <th className="pb-3">Net Premium</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {enrollments.map((enr) => (
                <tr key={enr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 font-mono font-bold text-sky-600">{enr.enrollmentNumber}</td>
                  <td className="py-3">
                    <strong className="block text-slate-800 dark:text-slate-200">{enr.farmerName}</strong>
                    <span className="text-slate-400 font-mono">{enr.farmerPhone}</span>
                  </td>
                  <td className="py-3">{enr.plotUpazila}, {enr.plotDistrict}</td>
                  <td className="py-3 font-bold">{enr.landAreaBighas} Bighas</td>
                  <td className="py-3 font-bold text-emerald-600">৳{enr.totalSumInsured.toLocaleString()}</td>
                  <td className="py-3">৳{enr.netPremiumPaid}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {enr.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Approval Modal */}
      {approvingClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">
              Approve Disaster Claim Payout
            </h3>

            <form onSubmit={handleApproveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Damage Percentage (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={damagePct}
                  onChange={(e) => setDamagePct(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">MFS Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. BKASH-DISB-78219"
                  value={payoutTransactionRef}
                  onChange={(e) => setPayoutTransactionRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Approval Notes</label>
                <textarea
                  rows={2}
                  value={adminApprovalNotes}
                  onChange={(e) => setAdminApprovalNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isApproving}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  {isApproving ? 'প্রসেস হচ্ছে...' : 'অনুমোদন ও অর্থ ছাড় করুন'}
                </button>
                <button
                  type="button"
                  onClick={() => setApprovingClaim(null)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-600"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
