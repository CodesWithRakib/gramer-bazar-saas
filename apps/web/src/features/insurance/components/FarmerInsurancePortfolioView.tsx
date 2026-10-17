'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  CloudRain,
  Waves,
  Wind,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Plus,
  RefreshCw,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  useGetMyCropInsuranceEnrollmentsQuery,
  useGetRecentTelemetryQuery,
  useFileDisasterClaimMutation,
  FarmerInsuranceEnrollment,
  ClaimDisasterSeverity,
} from '../cropInsuranceApi';

export function FarmerInsurancePortfolioView({ lang = 'en' }: { lang?: string }) {
  const isBn = lang === 'bn';

  const { data: enrollments = [], isLoading, refetch } = useGetMyCropInsuranceEnrollmentsQuery();
  const { data: telemetry = [] } = useGetRecentTelemetryQuery();

  const [claimEnrollment, setClaimEnrollment] = useState<FarmerInsuranceEnrollment | null>(null);
  const [triggerBreachValue, setTriggerBreachValue] = useState<number>(160);
  const [disasterSeverity, setDisasterSeverity] = useState<ClaimDisasterSeverity>('TOTAL_LOSS');
  const [farmerDamageNotes, setFarmerDamageNotes] = useState<string>('');
  const [claimError, setClaimError] = useState<string | null>(null);

  const [fileClaim, { isLoading: isFiling }] = useFileDisasterClaimMutation();

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimEnrollment) return;

    try {
      await fileClaim({
        id: claimEnrollment.id,
        data: {
          triggerBreachValue: Number(triggerBreachValue),
          disasterSeverity,
          farmerDamageNotes: farmerDamageNotes.trim(),
        },
      }).unwrap();

      setClaimEnrollment(null);
      setFarmerDamageNotes('');
    } catch (err: any) {
      setClaimError(err?.data?.message || 'Failed to submit disaster claim');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {isBn ? 'সক্রিয় কভারেজ' : 'Active Coverage'}
          </span>
        );
      case 'CLAIM_IN_REVIEW':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse">
            {isBn ? 'দাবি তদন্তাধীন' : 'Claim In Review'}
          </span>
        );
      case 'CLAIM_PAID':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
            {isBn ? 'ক্ষতিপূরণ পরিশোধিত' : 'Compensation Paid'}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-sky-600" />
            <span>{isBn ? 'আমার শস্য বীমা ও দুর্যোগ ক্ষতিপূরণ সনদ' : 'My Crop Insurance & Disaster Portfolio'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isBn
              ? 'আপনার বীমাকৃত জমির কভারেজ, আঞ্চলিক আবহাওয়া ঝুঁকি ব্যরোমিটার এবং ক্ষতিপূরণ ট্র্যাকিং।'
              : 'Track insured plots, regional meteorological threat levels, and emergency compensation payouts.'}
          </p>
        </div>

        <Link
          href={`/${lang}/insurance`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>{isBn ? 'নতুন শস্য বীমা গ্রহণ করুন' : 'Enroll New Plot'}</span>
        </Link>
      </div>

      {/* Regional Telemetry Barometer Feed */}
      {telemetry.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <CloudRain className="w-4 h-4 text-sky-600" />
              <span>{isBn ? 'আঞ্চলিক স্টেশন লাইভ আবহাওয়া রিডিং' : 'Regional Station Live Meteorological Telemetry'}</span>
            </div>
            <span className="text-[11px] text-slate-400">BMD / River Water Gauge</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {telemetry.slice(0, 3).map((t) => (
              <div
                key={t.id}
                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  t.isBreach
                    ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-300'
                    : 'bg-slate-50 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700'
                }`}
              >
                <div>
                  <strong className="block text-slate-900 dark:text-white text-xs">{t.stationName}</strong>
                  <span className="text-[11px] text-slate-500">{t.upazila}, {t.district}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black font-mono block">
                    {t.measuredValue} {t.unit}
                  </span>
                  {t.isBreach && (
                    <span className="text-[10px] font-bold text-rose-600 animate-pulse">
                      BREACH
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enrollments Cards */}
      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading insurance portfolio...</p>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
            {isBn ? 'কোনো বীমা পলিসি সক্রিয় নেই' : 'No active crop insurance policies'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {isBn
              ? 'বন্যা বা অকাল অতিবৃষ্টিতে শস্যহানি থেকে বাঁচতে এখনই সরকারি ৫০% ভর্তুকিতে পলিসি গ্রহণ করুন।'
              : 'Secure your harvest against flash floods and unseasonal rainfall with 50% government subsidy.'}
          </p>
          <Link
            href={`/${lang}/insurance`}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold"
          >
            {isBn ? 'পলিসি ব্রাউজ করুন' : 'Browse Policies'}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enr) => (
            <div
              key={enr.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-600">{enr.enrollmentNumber}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {enr.policy?.titleEn} ({enr.policy?.cropType.replace(/_/g, ' ')})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(enr.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">{isBn ? 'বীমাকৃত জমি' : 'Insured Area'}</span>
                  <strong className="text-slate-800 dark:text-slate-200 text-sm">
                    {enr.landAreaBighas} {isBn ? 'বিঘা' : 'Bighas'}
                  </strong>
                  <span className="text-[11px] text-slate-500 block truncate">{enr.plotAddress}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">{isBn ? 'মোট কভারেজ' : 'Total Coverage'}</span>
                  <strong className="text-emerald-600 text-sm">
                    ৳{enr.totalSumInsured.toLocaleString()}
                  </strong>
                  <span className="text-[11px] text-slate-500 block">
                    Paid: ৳{enr.netPremiumPaid} (Subsidized: ৳{enr.subsidyAmount})
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">{isBn ? 'ক্ষতিপূরণ ওয়ালেট' : 'Payout Wallet'}</span>
                  <strong className="font-mono text-slate-700 dark:text-slate-300">
                    {enr.payoutMfsNumber}
                  </strong>
                  <span className="text-[11px] text-emerald-600 block">Direct MFS Credit</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">{isBn ? 'ট্রিগার শর্ত' : 'Trigger Condition'}</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {enr.policy?.triggerType}: ≥ {enr.policy?.triggerThresholdValue} {enr.policy?.triggerThresholdUnit}
                  </span>
                </div>
              </div>

              {/* Claims & Disaster Action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div>
                  {enr.claims && enr.claims.length > 0 ? (
                    <div className="text-xs space-y-1">
                      {enr.claims.map((claim) => (
                        <div key={claim.id} className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-emerald-600">
                            {claim.claimNumber}: ৳{claim.payoutAmount.toLocaleString()} ({claim.damagePct}% loss)
                          </span>
                          {claim.payoutTransactionRef && (
                            <span className="text-[10px] font-mono bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                              Trx: {claim.payoutTransactionRef}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      {isBn ? 'এখনো কোনো দুর্যোগ দাবি নেই (শস্য নিরাপদ)' : 'No disaster claims recorded (Crop Safe)'}
                    </span>
                  )}
                </div>

                {enr.status === 'ACTIVE' && (
                  <button
                    type="button"
                    onClick={() => {
                      setClaimEnrollment(enr);
                      setClaimError(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{isBn ? 'জরুরি দুর্যোগ দাবি দায়ের করুন' : 'File Emergency Claim'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Emergency Claim Modal */}
      {claimEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>{isBn ? 'দুর্যোগ শস্যহানি ক্ষতিপূরণ দাবি' : 'Disaster Crop Loss Claim'}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Certificate: <strong className="font-mono text-sky-600">{claimEnrollment.enrollmentNumber}</strong>
            </p>

            {claimError && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs mb-3">
                {claimError}
              </div>
            )}

            <form onSubmit={handleClaimSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Disaster Severity Assessment
                </label>
                <select
                  value={disasterSeverity}
                  onChange={(e) => setDisasterSeverity(e.target.value as ClaimDisasterSeverity)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                >
                  <option value="TOTAL_LOSS">100% Total Loss (সম্পূর্ণ বিনষ্ট - ৳{claimEnrollment.totalSumInsured})</option>
                  <option value="SEVERE_HIGH">75% Severe Damage (৳{claimEnrollment.totalSumInsured * 0.75})</option>
                  <option value="PARTIAL_MEDIUM">50% Medium Waterlogging (৳{claimEnrollment.totalSumInsured * 0.5})</option>
                  <option value="PARTIAL_LOW">25% Low Damage (৳{claimEnrollment.totalSumInsured * 0.25})</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Recorded Environmental Reading / Water Level
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={triggerBreachValue}
                  onChange={(e) => setTriggerBreachValue(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Farmer Field Damage Observations
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe flood depth, river breach, or waterlogged days..."
                  value={farmerDamageNotes}
                  onChange={(e) => setFarmerDamageNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isFiling}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition"
                >
                  {isFiling ? 'দাবি জমা হচ্ছে...' : 'ক্ষতিপূরণ দাবি জমা দিন'}
                </button>
                <button
                  type="button"
                  onClick={() => setClaimEnrollment(null)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600"
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
