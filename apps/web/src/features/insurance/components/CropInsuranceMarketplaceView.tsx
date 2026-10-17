'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  CloudRain,
  Waves,
  Wind,
  Sun,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calculator,
  Phone,
  User,
  MapPin,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  useGetCropInsurancePoliciesQuery,
  useEnrollCropInsuranceMutation,
  CropInsurancePolicy,
  CropType,
  ParametricTriggerType,
} from '../cropInsuranceApi';

const CROP_FILTERS: { key: CropType | 'ALL'; en: string; bn: string }[] = [
  { key: 'ALL', en: 'All Crops', bn: 'সকল শস্য' },
  { key: 'BORO_PADDY', en: 'Boro Paddy', bn: 'বোরো ধান' },
  { key: 'AMAN_PADDY', en: 'Aman Paddy', bn: 'আমন ধান' },
  { key: 'POTATO', en: 'Potato', bn: 'গোল আলু' },
  { key: 'ONION', en: 'Onion', bn: 'পেঁয়াজ' },
  { key: 'MUSTARD', en: 'Mustard', bn: 'সরিষা' },
  { key: 'WATERMELON', en: 'Watermelon', bn: 'তরমুজ' },
  { key: 'JUTE', en: 'Jute', bn: 'পাট' },
];

export function CropInsuranceMarketplaceView({ lang = 'en' }: { lang?: string }) {
  const isBn = lang === 'bn';

  const [selectedCrop, setSelectedCrop] = useState<CropType | 'ALL'>('ALL');
  const [districtFilter, setDistrictFilter] = useState<string>('');

  // Enrollment Modal State
  const [selectedPolicyForEnroll, setSelectedPolicyForEnroll] = useState<CropInsurancePolicy | null>(null);
  const [farmerName, setFarmerName] = useState<string>('');
  const [farmerPhone, setFarmerPhone] = useState<string>('');
  const [farmerNid, setFarmerNid] = useState<string>('');
  const [plotAddress, setPlotAddress] = useState<string>('');
  const [plotDistrict, setPlotDistrict] = useState<string>('');
  const [plotUpazila, setPlotUpazila] = useState<string>('');
  const [plotUnion, setPlotUnion] = useState<string>('');
  const [plotVillage, setPlotVillage] = useState<string>('');
  const [plotDagNo, setPlotDagNo] = useState<string>('');
  const [landAreaBighas, setLandAreaBighas] = useState<number>(2.0);
  const [payoutMfsNumber, setPayoutMfsNumber] = useState<string>('');
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [confirmedCertificate, setConfirmedCertificate] = useState<string | null>(null);

  const { data: responseData, isLoading, isFetching, refetch } = useGetCropInsurancePoliciesQuery({
    cropType: selectedCrop === 'ALL' ? undefined : selectedCrop,
    district: districtFilter ? districtFilter.trim() : undefined,
  });

  const policies = responseData?.items || [];

  const [enrollMutation, { isLoading: isEnrolling }] = useEnrollCropInsuranceMutation();

  const handleOpenEnrollModal = (policy: CropInsurancePolicy) => {
    setSelectedPolicyForEnroll(policy);
    setPlotDistrict(policy.targetDistrict);
    setPlotUpazila(policy.targetUpazila || '');
    setEnrollmentError(null);
    setConfirmedCertificate(null);
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicyForEnroll) return;

    if (!farmerName.trim() || !farmerPhone.trim() || !plotAddress.trim() || !payoutMfsNumber.trim()) {
      setEnrollmentError(
        isBn
          ? 'অনুগ্রহ করে কৃষক নাম, মোবাইল নম্বর, জমির ঠিকানা এবং ক্ষতিপূরণ প্রাপ্তির বিকাশ/নগদ নম্বর প্রদান করুন।'
          : 'Please complete name, phone, plot address, and payout MFS number.',
      );
      return;
    }

    setEnrollmentError(null);

    try {
      const res = await enrollMutation({
        policyId: selectedPolicyForEnroll.id,
        farmerName: farmerName.trim(),
        farmerPhone: farmerPhone.trim(),
        farmerNid: farmerNid.trim() || undefined,
        plotAddress: plotAddress.trim(),
        plotDistrict: plotDistrict.trim(),
        plotUpazila: plotUpazila.trim(),
        plotUnion: plotUnion.trim() || undefined,
        plotVillage: plotVillage.trim() || undefined,
        plotDagNo: plotDagNo.trim() || undefined,
        landAreaBighas: Number(landAreaBighas),
        payoutMfsNumber: payoutMfsNumber.trim(),
      }).unwrap();

      setConfirmedCertificate(res.enrollmentNumber);
    } catch (err: any) {
      setEnrollmentError(err?.data?.message || 'Failed to submit insurance enrollment');
    }
  };

  const getTriggerIcon = (type: ParametricTriggerType) => {
    switch (type) {
      case 'FLASH_FLOOD':
        return Waves;
      case 'EXCESS_RAINFALL':
        return CloudRain;
      case 'CYCLONE_WIND':
        return Wind;
      case 'PROLONGED_DROUGHT':
        return Sun;
      default:
        return ShieldAlert;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-sky-800/40">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 text-xs font-semibold mb-4">
            <ShieldAlert className="w-4 h-4 text-sky-300" />
            {isBn ? 'জলবায়ু ঝুঁকি সুরক্ষা ও দ্রুত ক্ষতিপূরণ' : 'Climate Risk Protection & Instant Relief'}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3">
            {isBn
              ? 'আবহাওয়া ও বন্যা/ঘূর্ণিঝড় প্যারামেট্রিক শস্য বীমা'
              : 'Parametric Weather Crop Insurance & Disaster Relief'}
          </h1>

          <p className="max-w-3xl text-sky-100/90 text-sm sm:text-base leading-relaxed">
            {isBn
              ? 'হাওরে আকস্মিক বন্যা, ৩ দিনের অতিবৃষ্টিতে আলুর পচন বা উপকূলে ঘূর্ণিঝড়ে শস্য নষ্ট হলে আর ক্ষতিপূরণের জন্য মাসের পর মাস অপেক্ষা করতে হবে না। আবহাওয়া ও নদী পরিমাপক স্টেশন বিপদসীমা অতিক্রম করলেই বিকাশ/নগদে স্বয়ংক্রিয় ক্ষতিপূরণ।'
              : 'Protect your harvest against Haor flash floods, excessive potato-rot waterlogging, and coastal cyclones. When objective river gauges or rainfall stations breach defined danger marks, compensation is disbursed directly to your bKash/Nagad wallet without loss assessor delays.'}
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-sky-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-700/40 flex items-center justify-center text-sky-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-sky-200/80">{isBn ? 'সরকারি সহায়তা' : 'Govt Subsidy'}</p>
                <p className="text-sm font-bold text-white">{isBn ? '৫০% প্রিমিয়াম ভর্তুকি' : '50% Premium Paid'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-700/40 flex items-center justify-center text-sky-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-sky-200/80">{isBn ? 'সর্বোচ্চ কভারেজ' : 'Max Sum Insured'}</p>
                <p className="text-sm font-bold text-white">{isBn ? '৳২০,০০০ / বিঘা' : 'Up to ৳20,000/Bigha'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-700/40 flex items-center justify-center text-sky-200">
                <Waves className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-sky-200/80">{isBn ? 'স্বয়ংক্রিয় ট্রিগার' : 'Smart Trigger'}</p>
                <p className="text-sm font-bold text-white">{isBn ? 'নদী বিপদসীমা ও বৃষ্টি' : 'River & Rain Sensors'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-700/40 flex items-center justify-center text-sky-200">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-sky-200/80">{isBn ? 'তাৎক্ষণিক অর্থায়ন' : 'Instant Payout'}</p>
                <p className="text-sm font-bold text-white">{isBn ? 'বিকাশ ও নগদ ওয়ালেট' : 'Direct to MFS'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Crop Filter Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {CROP_FILTERS.map((crop) => {
            const isSelected = selectedCrop === crop.key;
            return (
              <button
                key={crop.key}
                type="button"
                onClick={() => setSelectedCrop(crop.key)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shadow-sm ${
                  isSelected
                    ? 'bg-sky-600 text-white ring-2 ring-sky-500 shadow-sky-600/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {isBn ? crop.bn : crop.en}
              </button>
            );
          })}
        </div>

        {/* Filter and District Search */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder={isBn ? 'জেলা অনুসারে পলিসি খুঁজুন (যেমন: সুনামগঞ্জ, বগুড়া)...' : 'Filter by district (e.g. Sunamganj, Bogura)...'}
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Link
              href={`/${lang}/customer/insurance`}
              className="px-4 py-2.5 rounded-xl border border-sky-600 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/60 font-semibold text-xs sm:text-sm transition"
            >
              {isBn ? 'আমার বীমা সনদ সমূহ' : 'My Active Insurance'}
            </Link>

            <button
              type="button"
              onClick={() => refetch()}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-sky-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Policies Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 rounded-2xl bg-white dark:bg-slate-900 p-6 animate-pulse border border-slate-200 dark:border-slate-800"
              />
            ))}
          </div>
        ) : policies.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-4">
            <ShieldAlert className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
              {isBn ? 'কোনো বীমা পলিসি পাওয়া যায়নি' : 'No insurance policies found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {isBn
                ? 'অন্য কোনো ফসল বা জেলা নির্বাচন করে পুনরায় অনুসন্ধান করুন।'
                : 'Try clearing your district filter or choosing a different crop season.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCrop('ALL');
                setDistrictFilter('');
              }}
              className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold"
            >
              {isBn ? 'ফিল্টার রিসেট' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.map((policy) => {
              const TriggerIcon = getTriggerIcon(policy.triggerType);
              return (
                <div
                  key={policy.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                        {policy.cropType.replace(/_/g, ' ')}
                      </span>

                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {isBn ? `${policy.governmentSubsidyPct}% সরকারি ভর্তুকি` : `${policy.governmentSubsidyPct}% Subsidized`}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug mb-1">
                      {isBn ? policy.titleBn : policy.titleEn}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mb-3">Ref: {policy.policyCode}</p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-4">
                      <MapPin className="w-3.5 h-3.5 text-sky-600" />
                      <span>
                        {policy.targetDistrict} {policy.targetUpazila ? `(${policy.targetUpazila})` : ''} | Season: {policy.season}
                      </span>
                    </div>

                    {/* Coverage & Premium Calculation Box */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5 text-xs mb-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-500">{isBn ? 'সর্বোচ্চ বীমা ক্ষতিপূরণ' : 'Max Sum Insured'}:</span>
                        <strong className="text-sm font-black text-slate-900 dark:text-white">
                          ৳{policy.sumInsuredPerBigha.toLocaleString()} / {isBn ? 'বিঘা' : 'Bigha'}
                        </strong>
                      </div>

                      <div className="flex justify-between items-baseline pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">{isBn ? 'কৃষকের প্রদেয় প্রিমিয়াম' : 'Farmer Net Premium'}:</span>
                        <strong className="text-base font-black text-sky-600 dark:text-sky-400">
                          ৳{policy.farmerPayablePerBigha} / {isBn ? 'বিঘা' : 'Bigha'}
                        </strong>
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                        {isBn
                          ? `(মোট ৳${policy.premiumPerBigha} এর মধ্যে সরকার দিচ্ছে ৳${policy.premiumPerBigha - policy.farmerPayablePerBigha})`
                          : `(Total ৳${policy.premiumPerBigha}, Govt pays ৳${policy.premiumPerBigha - policy.farmerPayablePerBigha})`}
                      </div>
                    </div>

                    {/* Parametric Trigger Threshold Box */}
                    <div className="p-3.5 rounded-xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/60 text-xs">
                      <div className="flex items-center gap-2 font-bold text-sky-900 dark:text-sky-200 mb-1">
                        <TriggerIcon className="w-4 h-4 text-sky-600" />
                        <span>
                          {isBn ? 'স্বয়ংক্রিয় ক্ষতিপূরণ ট্রিগার' : 'Automated Parametric Trigger'}
                        </span>
                      </div>
                      <p className="text-[11px] text-sky-800/80 dark:text-sky-300/80 leading-relaxed">
                        {isBn ? 'স্টেশন রিডিং যখন ' : 'Triggered when station reads: '}
                        <strong>
                          ≥ {policy.triggerThresholdValue} {policy.triggerThresholdUnit}
                        </strong>
                      </p>
                    </div>
                  </div>

                  {/* Enroll CTA */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleOpenEnrollModal(policy)}
                      className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isBn ? 'জমি বীমাভুক্ত করুন (অনলাইন সাবস্ক্রিপশন)' : 'Enroll Plot in Policy'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Enrollment & Premium Calculation Modal */}
      {selectedPolicyForEnroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
            {confirmedCertificate ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                  {isBn ? 'শস্য বীমা পলিসি সক্রিয় হয়েছে!' : 'Crop Insurance Active!'}
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Certificate Ref:{' '}
                  <strong className="font-mono text-emerald-600 text-sm">{confirmedCertificate}</strong>
                </p>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-left text-xs space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span>{isBn ? 'বীমাকৃত জমি' : 'Insured Area'}:</span>
                    <strong>{landAreaBighas} {isBn ? 'বিঘা' : 'Bighas'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{isBn ? 'মোট বীমা কভারেজ' : 'Total Sum Insured'}:</span>
                    <strong className="text-emerald-600">
                      ৳{(selectedPolicyForEnroll.sumInsuredPerBigha * landAreaBighas).toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{isBn ? 'ক্ষতিপূরণ ওয়ালেট' : 'Payout Wallet'}:</span>
                    <strong className="font-mono">{payoutMfsNumber}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPolicyForEnroll(null)}
                  className="w-full py-3 px-4 rounded-xl bg-sky-600 text-white font-bold text-xs"
                >
                  {isBn ? 'সম্পন্ন করুন' : 'Done'}
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                  {isBn ? 'শস্য বীমা পলিসি আবেদন ও প্রিমিয়াম গণনা' : 'Crop Insurance Plot Enrollment'}
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  Policy: <strong className="text-sky-600">{selectedPolicyForEnroll.titleEn}</strong>
                </p>

                {enrollmentError && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs mb-4">
                    {enrollmentError}
                  </div>
                )}

                <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs">
                  {/* Land Area Slider / Input */}
                  <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900">
                    <label className="block font-bold text-sky-900 dark:text-sky-200 mb-2">
                      {isBn ? 'বীমাকৃত জমির পরিমাপ (বিঘা)' : 'Insured Land Area (Bighas)'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      required
                      value={landAreaBighas}
                      onChange={(e) => setLandAreaBighas(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800 rounded-xl text-base font-black text-sky-900 dark:text-white mb-3"
                    />

                    {/* Breakdown Ledger */}
                    <div className="space-y-1.5 pt-2 border-t border-sky-200/60 dark:border-sky-800/60 text-[11px]">
                      <div className="flex justify-between">
                        <span>{isBn ? 'মোট বীমা কভারেজ' : 'Total Sum Insured'}:</span>
                        <strong className="font-bold text-slate-900 dark:text-white">
                          ৳{(selectedPolicyForEnroll.sumInsuredPerBigha * landAreaBighas).toLocaleString()}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>{isBn ? 'মোট প্রিমিয়াম' : 'Gross Premium'}:</span>
                        <span>৳{(selectedPolicyForEnroll.premiumPerBigha * landAreaBighas).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>{isBn ? 'সরকারি ৫০% ভর্তুকি' : '50% Government Subsidy'}:</span>
                        <span>
                          -৳{((selectedPolicyForEnroll.premiumPerBigha - selectedPolicyForEnroll.farmerPayablePerBigha) * landAreaBighas).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-black text-sky-700 dark:text-sky-300 pt-1 border-t border-sky-200 dark:border-sky-800">
                        <span>{isBn ? 'কৃষকের প্রদেয় প্রিমিয়াম' : 'Net Farmer Premium Due'}:</span>
                        <span>
                          ৳{(selectedPolicyForEnroll.farmerPayablePerBigha * landAreaBighas).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Farmer Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isBn ? 'কৃষকের নাম' : 'Farmer Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={farmerName}
                        onChange={(e) => setFarmerName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isBn ? 'মোবাইল নম্বর' : 'Phone Number'}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="01XXXXXXXXX"
                        value={farmerPhone}
                        onChange={(e) => setFarmerPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Plot Address */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isBn ? 'উপজেলা' : 'Upazila'}
                      </label>
                      <input
                        type="text"
                        required
                        value={plotUpazila}
                        onChange={(e) => setPlotUpazila(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isBn ? 'ইউনিয়ন' : 'Union'}
                      </label>
                      <input
                        type="text"
                        value={plotUnion}
                        onChange={(e) => setPlotUnion(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isBn ? 'দাগ নম্বর' : 'Plot Dag No.'}
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: দাগ ১২৮"
                        value={plotDagNo}
                        onChange={(e) => setPlotDagNo(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isBn ? 'জমির অবস্থান ও ঠিকানা' : 'Field Address & Landmark'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: হাওর পাড়া মাঠ, পশ্চিম অংশ"
                      value={plotAddress}
                      onChange={(e) => setPlotAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>

                  {/* Payout MFS Wallet */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isBn ? 'ক্ষতিপূরণ জমা হওয়ার বিকাশ/নগদ নম্বর' : 'Payout bKash/Nagad Number'}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={payoutMfsNumber}
                      onChange={(e) => setPayoutMfsNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                    />
                    <span className="text-[11px] text-slate-400">
                      {isBn
                        ? 'বন্যা বা দুর্যোগে স্টেশন ট্রিগার অতিক্রম করলেই এই নম্বরে ক্ষতিপূরণ সরাসরি জমা হবে।'
                        : 'Disaster relief payouts are sent directly to this MFS wallet upon trigger breach.'}
                    </span>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="submit"
                      disabled={isEnrolling}
                      className="flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                    >
                      {isEnrolling ? 'সাবস্ক্রিপশন হচ্ছে...' : 'বীমা পলিসি নিশ্চিত করুন'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPolicyForEnroll(null)}
                      className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs"
                    >
                      বাতিল
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
