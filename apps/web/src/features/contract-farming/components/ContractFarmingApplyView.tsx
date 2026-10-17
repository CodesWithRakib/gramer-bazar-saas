'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Building2,
  TrendingUp,
  Coins,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Scale,
  Calendar,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import {
  useGetContractCampaignByIdQuery,
  useApplyContractAgreementMutation,
  ContractFarmingCampaign,
} from '../contractFarmingApi';

export function ContractFarmingApplyView({
  campaignId,
  lang = 'en',
}: {
  campaignId: string;
  lang?: string;
}) {
  const isBn = lang === 'bn';
  const router = useRouter();

  const { data: campaign, isLoading, isError } = useGetContractCampaignByIdQuery(campaignId);
  const [applyAgreement, { isLoading: isSubmitting }] = useApplyContractAgreementMutation();

  // Form State
  const [landAreaBighas, setLandAreaBighas] = useState<number>(3.0);
  const [farmerName, setFarmerName] = useState<string>('');
  const [farmerPhone, setFarmerPhone] = useState<string>('');
  const [farmerNid, setFarmerNid] = useState<string>('');
  const [plotAddress, setPlotAddress] = useState<string>('');
  const [plotDistrict, setPlotDistrict] = useState<string>('');
  const [plotUpazila, setPlotUpazila] = useState<string>('');
  const [plotUnion, setPlotUnion] = useState<string>('');
  const [plotVillage, setPlotVillage] = useState<string>('');
  const [plotDagNo, setPlotDagNo] = useState<string>('');
  const [farmerPayoutMfsOrBank, setFarmerPayoutMfsOrBank] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedAgreement, setConfirmedAgreement] = useState<{
    agreementNumber: string;
    totalValue: number;
    advanceDisbursed: number;
  } | null>(null);

  // Auto-fill district if campaign specifies one
  React.useEffect(() => {
    if (campaign?.targetDistrict && !plotDistrict) {
      setPlotDistrict(campaign.targetDistrict);
    }
    if (campaign?.targetUpazila && !plotUpazila) {
      setPlotUpazila(campaign.targetUpazila);
    }
  }, [campaign, plotDistrict, plotUpazila]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">
            {isBn ? 'ক্যাম্পেইন বিবরণ লোড হচ্ছে...' : 'Loading campaign terms...'}
          </p>
        </div>
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-red-200 dark:border-red-900 text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isBn ? 'ক্যাম্পেইন পাওয়া যায়নি' : 'Campaign Not Found'}
          </h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            {isBn
              ? 'অনুরোধকৃত চুক্তি ক্যাম্পেইনটি স্থগিত বা অস্তিত্বহীন।'
              : 'The requested contract campaign is currently unavailable or invalid.'}
          </p>
          <Link
            href={`/${lang}/contract-farming`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {isBn ? 'ক্যাম্পেইন তালিকায় ফিরে যান' : 'Back to Campaigns'}
          </Link>
        </div>
      </div>
    );
  }

  // Financial Live Projections
  const estimatedYieldTotalKg = Number(landAreaBighas) * Number(campaign.estimatedYieldPerBighaKg || 0);
  const floorPrice = Number(campaign.guaranteedFloorPricePerKg || 0);
  const totalEstAgreementValue = estimatedYieldTotalKg * floorPrice;
  const advanceWorkingCapital = (totalEstAgreementValue * Number(campaign.advanceInputCashPct || 25)) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!farmerName.trim() || !farmerPhone.trim() || !plotAddress.trim() || !farmerPayoutMfsOrBank.trim()) {
      setErrorMessage(
        isBn
          ? 'অনুগ্রহ করে সকল আবশ্যকীয় তথ্য (নাম, ফোন, ঠিকানা ও পেমেন্ট একাউন্ট) পূরণ করুন।'
          : 'Please fill in all required fields (Name, Phone, Plot Address, and Payout account).'
      );
      return;
    }

    if (!agreeTerms) {
      setErrorMessage(
        isBn
          ? 'চুক্তির শর্তাবলীতে সম্মতি প্রদান করুন।'
          : 'Please accept the forward agreement quality and buyback terms.'
      );
      return;
    }

    try {
      const res = await applyAgreement({
        campaignId: campaign.id,
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
        farmerPayoutMfsOrBank: farmerPayoutMfsOrBank.trim(),
      }).unwrap();

      setConfirmedAgreement({
        agreementNumber: res.agreementNumber,
        totalValue: Number(res.totalEstAgreementValue),
        advanceDisbursed: Number(res.advanceWorkingCapitalDisbursed),
      });
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message ||
          (isBn
            ? 'চুক্তি আবেদন প্রক্রিয়াকরণে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।'
            : 'Failed to submit agreement application. Please try again.')
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href={`/${lang}/contract-farming`}
            className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {isBn ? 'সকল চুক্তি ক্যাম্পেইনে ফিরে যান' : 'Back to Contract Campaigns'}
          </Link>
        </div>

        {/* Confirmation Modal */}
        {confirmedAgreement && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full border border-emerald-500 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isBn ? 'চুক্তি আবেদন সফলভাবে গৃহীত হয়েছে!' : 'Contract Agreement Enrolled!'}
              </h3>
              <p className="text-xs text-slate-500 mt-2 mb-6">
                {isBn
                  ? 'আপনার চুক্তি দলিল নম্বর জেনারেট হয়েছে। বায়ার অনুমোদন দেওয়ামাত্রই ২৫% ইনপুট মূলধন আপনার একাউন্টে জমা হবে।'
                  : 'Your forward purchase contract voucher has been generated. Upfront advance will be disbursed immediately upon buyer confirmation.'}
              </p>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-left space-y-2 mb-6 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isBn ? 'চুক্তি দলিল নং' : 'Agreement No'}:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {confirmedAgreement.agreementNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isBn ? 'বায়ার প্রতিষ্ঠান' : 'Buyer Corp'}:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {campaign.buyerCompanyName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isBn ? 'মোট প্রত্যাশিত মূল্য' : 'Total Est. Value'}:</span>
                  <span className="font-bold text-emerald-600">
                    ৳{confirmedAgreement.totalValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    {isBn ? 'প্রাক্কলিত ২৫% ইনপুট ক্যাশ' : 'Est. 25% Advance'}:
                  </span>
                  <span className="font-bold text-amber-500">
                    ৳{(confirmedAgreement.totalValue * 0.25).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={`/${lang}/customer/contract-farming`}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition text-center"
                >
                  {isBn ? 'আমার চুক্তি পোর্টফোলিও দেখুন' : 'View My Contracts'}
                </Link>
                <button
                  onClick={() => setConfirmedAgreement(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {isBn ? 'বন্ধ করুন' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Header Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {campaign.buyerCompanyName}
                </span>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  {isBn ? campaign.titleBn : campaign.titleEn}
                </h1>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
              {campaign.targetSeason}
            </span>
          </div>

          {/* Key Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 text-xs">
            <div>
              <span className="text-slate-400">{isBn ? 'গ্যারান্টিযুক্ত ফ্লোর মূল্য' : 'Floor Price'}:</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                ৳{campaign.guaranteedFloorPricePerKg} / kg
              </p>
            </div>
            <div>
              <span className="text-slate-400">{isBn ? 'বপনে নগদ অগ্রিম' : 'Upfront Advance'}:</span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {campaign.advanceInputCashPct}% Cash
              </p>
            </div>
            <div>
              <span className="text-slate-400">{isBn ? 'প্রত্যাশিত ফলন / বিঘা' : 'Est. Yield / Bigha'}:</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {campaign.estimatedYieldPerBighaKg} kg
              </p>
            </div>
            <div>
              <span className="text-slate-400">{isBn ? 'ডেলিভারি হাব' : 'Delivery Hub'}:</span>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate mt-0.5">
                {campaign.intakeDropWarehouseName}
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>{isBn ? 'মান স্পেসিফিকেশন: ' : 'Quality Standards: '}</strong>
              {campaign.qualityStandardSpecs}
            </span>
          </div>
        </div>

        {/* Application Form & Financial Calculator */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Callout */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Land Area & Real-Time Projections */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" />
              {isBn ? '১. জমি ও প্রত্যাশিত ফলন প্রাক্কলন' : '1. Farmland Area & Yield Projections'}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              {isBn
                ? 'চুক্তির আওতায় অন্তর্ভুক্ত করতে ইচ্ছুক জমির পরিমাণ নির্ধারণ করুন।'
                : 'Specify the amount of land (in Bighas) you want to dedicate to this contract farming campaign.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {isBn ? 'জমির পরিমাণ (বিঘা হিসেবে)' : 'Enrolled Farmland (Bighas)'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0.5"
                    max="100"
                    step="0.5"
                    value={landAreaBighas}
                    onChange={(e) => setLandAreaBighas(Math.max(0.5, Number(e.target.value)))}
                    className="w-32 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-500">
                    ({(landAreaBighas / 3).toFixed(2)} {isBn ? 'একর প্রায়' : 'Acres approx'})
                  </span>
                </div>
              </div>

              {/* Live Calculator Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-semibold mb-3">
                  <span>{isBn ? 'স্বয়ংক্রিয় আর্থিক হিসাব' : 'Calculated Value Projections'}</span>
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      {isBn ? 'মোট অনুমিত উৎপাদন' : 'Committed Yield'}:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {estimatedYieldTotalKg.toLocaleString()} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      {isBn ? 'মোট ন্যূনতম চুক্তি মূল্য' : 'Total Floor Value'}:
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      ৳{totalEstAgreementValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-emerald-200 dark:border-emerald-800/80">
                    <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                      {isBn ? '২৫% বীজ/সার ইনপুট নগদ অগ্রিম' : '25% Upfront Seed Capital'}:
                    </span>
                    <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                      ৳{advanceWorkingCapital.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Farmer & Plot Coordinates */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              {isBn ? '২. কৃষক ও জমির দাগ সংক্রান্ত তথ্য' : '2. Farmer Profile & Plot Ownership'}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              {isBn
                ? 'মাঠ পরিদর্শন ও এসক্রো চুক্তি যাচাইয়ের জন্য সঠিক তথ্য প্রদান করুন।'
                : 'Provide plot cadastral records to facilitate pre-harvest field inspections.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'কৃষকের পূর্ণ নাম *' : 'Farmer Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isBn ? 'যেমন: মো: রফিকুল ইসলাম' : 'e.g. Md. Rafiqul Islam'}
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'মোবাইল নম্বর *' : 'Contact Phone *'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="017xxxxxxxx"
                  value={farmerPhone}
                  onChange={(e) => setFarmerPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'জাতীয় পরিচয়পত্র নম্বর (ঐচ্ছিক)' : 'NID Card No (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="19xxxxxxxxxxxx"
                  value={farmerNid}
                  onChange={(e) => setFarmerNid(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'জমির দাগ / খতিয়ান নং' : 'Cadastral Dag / Khatian No'}
                </label>
                <input
                  type="text"
                  placeholder={isBn ? 'দাগ নং ১২০৩, খতিয়ান ৪৭' : 'Dag # 1203, Khatian # 47'}
                  value={plotDagNo}
                  onChange={(e) => setPlotDagNo(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'জমির সম্পূর্ণ ঠিকানা / মৌজা *' : 'Plot Address / Mouza *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isBn ? 'গ্রাম, মৌজা, ইউনিয়ন' : 'Village, Mouza, Union'}
                  value={plotAddress}
                  onChange={(e) => setPlotAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'জেলা *' : 'District *'}
                </label>
                <input
                  type="text"
                  required
                  value={plotDistrict}
                  onChange={(e) => setPlotDistrict(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'উপজেলা *' : 'Upazila *'}
                </label>
                <input
                  type="text"
                  required
                  value={plotUpazila}
                  onChange={(e) => setPlotUpazila(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Escrow Payout Account */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-600" />
              {isBn ? '৩. অগ্রিম ও চূড়ান্ত এসক্রো নিষ্পত্তি একাউন্ট' : '3. Escrow Disbursement Wallet / Bank'}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              {isBn
                ? 'বায়ার কর্তৃক ২৫% ইনপুট মূলধন ও ফসল সরবরাহের পর বাকি ৭৫% অর্থ এই একাউন্টে সরাসরি জমা হবে।'
                : 'Direct MFS or bank account where the 25% input advance and the final weighbridge balance will be wired.'}
            </p>

            <div className="max-w-md">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn
                  ? 'বিকাশ / নগদ ওয়ালেট অথবা ব্যাংক একাউন্ট নম্বর *'
                  : 'bKash / Nagad Wallet or Bank A/C *'}
              </label>
              <input
                type="text"
                required
                placeholder={isBn ? 'যেমন: বিকাশ 017xxxxxxxx অথবা ডাচ-বাংলা ব্যাংক...' : 'bKash 017xxxxxxxx or Bank details'}
                value={farmerPayoutMfsOrBank}
                onChange={(e) => setFarmerPayoutMfsOrBank(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Terms checkbox */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {isBn
                    ? 'আমি নিশ্চিত করছি যে উল্লিখিত জমিতে চুক্তির শর্তানুসারে ফসল চাষ করব, মানসম্মত বীজ ও বায়ারের নির্দেশিকা মেনে চলব এবং ফসল নির্ধারিত ডিজিটাল ওয়েইব্রিজে সরবরাহ করব।'
                    : 'I agree to cultivate produce complying with specified quality parameters, attend agronomist milestone audits, and deliver harvest to the designated collection weighbridge.'}
                </span>
              </label>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end gap-4">
            <Link
              href={`/${lang}/contract-farming`}
              className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isBn ? 'আবেদন পেশ হচ্ছে...' : 'Submitting Agreement...'}</span>
                </>
              ) : (
                <>
                  <span>{isBn ? 'চুক্তি আবেদন নিশ্চিত করুন' : 'Confirm Contract Enrollment'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
