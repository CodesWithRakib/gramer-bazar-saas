'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Building2,
  TrendingUp,
  Coins,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  Scale,
  Calendar,
  Sparkles,
  ArrowRight,
  Truck,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  useGetFarmerContractAgreementsQuery,
  ContractFarmingAgreement,
  AgreementStatus,
  MilestoneStage,
} from '../contractFarmingApi';

export function FarmerContractsPortfolioView({ lang = 'en' }: { lang?: string }) {
  const isBn = lang === 'bn';

  const { data: agreements = [], isLoading, isFetching, refetch } = useGetFarmerContractAgreementsQuery();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Stats
  const totalAgreements = agreements.length;
  const totalBighas = agreements.reduce((acc, a) => acc + Number(a.landAreaBighas || 0), 0);
  const totalAdvanceReceived = agreements.reduce(
    (acc, a) => acc + Number(a.advanceWorkingCapitalDisbursed || 0),
    0
  );
  const totalDeliveredKg = agreements.reduce((acc, a) => acc + Number(a.deliveredTotalKg || 0), 0);
  const totalBalancePayable = agreements.reduce((acc, a) => acc + Number(a.balancePayable || 0), 0);

  const getStatusBadge = (status: AgreementStatus) => {
    switch (status) {
      case 'APPLIED':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {isBn ? 'আবেদন পর্যালোচনায়' : 'Applied / Under Review'}
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {isBn ? 'বায়ার অনুমোদিত' : 'Buyer Approved'}
          </span>
        );
      case 'ACTIVE_PLANTED':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {isBn ? 'বপন সম্পন্ন (২৫% অগ্রিম প্রাপ্ত)' : 'Planted (25% Advance Paid)'}
          </span>
        );
      case 'MILESTONES_VERIFIED':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            {isBn ? 'মাঠ পরিদর্শন উত্তীর্ণ' : 'Milestones Verified'}
          </span>
        );
      case 'DELIVERING':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {isBn ? 'ফসল সরবরাহ চলছে' : 'Delivering to Hub'}
          </span>
        );
      case 'SETTLED':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
            {isBn ? 'সম্পূর্ণ এসক্রো নিষ্পত্তি' : 'Final Escrow Settled'}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                {isBn ? 'কৃষক পোর্টফোলিও' : 'Farmer Dashboard'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              {isBn ? 'আমার চুক্তিভিত্তিক চাষাবাদ পোর্টফোলিও' : 'My Forward Farming Contracts Portfolio'}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              {isBn
                ? 'আপনার সকল স্বাক্ষরিত কর্পোরেট বাইব্যাক চুক্তি, ইনপুট মূলধন অগ্রিম ও ফসল সরবরাহের বিবরণ।'
                : 'Track your corporate forward agreements, advance disbursements, field audits, and weighbridge settlements.'}
            </p>
          </div>

          <Link
            href={`/${lang}/contract-farming`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition"
          >
            <Sparkles className="w-4 h-4" />
            {isBn ? 'নতুন চুক্তিতে যোগ দিন' : 'Enroll in New Contract'}
          </Link>
        </div>

        {/* Portfolio KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500">{isBn ? 'মোট সক্রিয় চুক্তি' : 'Active Contracts'}</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalAgreements}</p>
            <span className="text-[11px] text-slate-400">
              {totalBighas.toFixed(1)} {isBn ? 'বিঘা জমি' : 'Bighas total'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500">{isBn ? 'প্রাপ্ত ইনপুট নগদ অগ্রিম' : 'Advance Received'}</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              ৳{totalAdvanceReceived.toLocaleString()}
            </p>
            <span className="text-[11px] text-emerald-600/80">{isBn ? '২৫% বীজ ও সার মূলধন' : '25% input cash'}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500">{isBn ? 'সরবরাহকৃত মোট ফসল' : 'Delivered Yield'}</span>
            <p className="text-2xl font-black text-amber-500 mt-1">
              {totalDeliveredKg.toLocaleString()} <span className="text-xs font-normal text-slate-500">kg</span>
            </p>
            <span className="text-[11px] text-slate-400">{isBn ? 'ডিজিটাল ওয়েইব্রিজে গৃহীত' : 'Weighbridge intake'}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500">{isBn ? 'বকেয়া পাওনা ব্যালেন্স' : 'Escrow Balance Due'}</span>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              ৳{totalBalancePayable.toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-400">{isBn ? 'চূড়ান্ত নিষ্পত্তির পর প্রাপ্য' : 'Payable upon settlement'}</span>
          </div>
        </div>

        {/* Agreements List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500">
              {isBn ? 'চুক্তি লোড হচ্ছে...' : 'Loading contract portfolio...'}
            </p>
          </div>
        ) : agreements.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isBn ? 'আপনার এখনো কোনো চুক্তি নেই' : 'No Contract Farming Agreements Found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-6 max-w-md mx-auto">
              {isBn
                ? 'প্রাণ, স্কয়ার ও সুপারশপের সাথে চুক্তি করে নিশ্চিত মূল্যে ফসল উৎপাদন শুরু করুন এবং অগ্রিম ইনপুট মূলধন গ্রহণ করুন।'
                : 'Enroll your farmland into guaranteed corporate buyback campaigns to protect against price volatility.'}
            </p>
            <Link
              href={`/${lang}/contract-farming`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
            >
              {isBn ? 'ক্যাম্পেইন দেখুন' : 'Explore Buyback Campaigns'}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {agreements.map((agr) => {
              const isExpanded = expandedId === agr.id;
              const hasDeliveries = agr.deliveries && agr.deliveries.length > 0;
              const hasInspections = agr.inspections && agr.inspections.length > 0;

              return (
                <div
                  key={agr.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                >
                  {/* Agreement Card Header */}
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500">
                            {agr.agreementNumber}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-xs text-slate-400">
                            {new Date(agr.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                          {isBn ? agr.campaign?.titleBn : agr.campaign?.titleEn || 'Contract Crop Agreement'}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(agr.status)}
                      </div>
                    </div>

                    {/* Stats Grid for this Agreement */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 text-xs mb-4">
                      <div>
                        <span className="text-slate-400">{isBn ? 'চুক্তিভুক্ত জমি' : 'Land Enrolled'}:</span>
                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                          {agr.landAreaBighas} {isBn ? 'বিঘা' : 'Bighas'}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">{isBn ? 'প্রত্যাশিত ফলন' : 'Committed Yield'}:</span>
                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                          {Number(agr.committedEstProductionKg).toLocaleString()} kg
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">{isBn ? 'ফ্লোর প্রাইস' : 'Floor Price'}:</span>
                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                          ৳{agr.floorPricePerKg} / kg
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">{isBn ? 'মোট আনুমানিক মূল্য' : 'Total Agreement Value'}:</span>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          ৳{Number(agr.totalEstAgreementValue).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Financial Escrow Snapshot */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                        <span className="text-emerald-700 dark:text-emerald-300">
                          {isBn ? '২৫% ইনপুট নগদ অগ্রিম' : '25% Advance Paid'}:
                        </span>
                        <p className="text-base font-bold text-emerald-800 dark:text-emerald-200 mt-0.5">
                          ৳{Number(agr.advanceWorkingCapitalDisbursed).toLocaleString()}
                        </p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {agr.farmerPayoutMfsOrBank}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                        <span className="text-amber-700 dark:text-amber-300">
                          {isBn ? 'সরবরাহকৃত ফসল' : 'Delivered To Date'}:
                        </span>
                        <p className="text-base font-bold text-amber-800 dark:text-amber-200 mt-0.5">
                          {Number(agr.deliveredTotalKg).toLocaleString()} kg
                        </p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {isBn ? 'মোট নিষ্পত্তিকৃত মূল্য: ৳' : 'Value: ৳'}
                          {Number(agr.finalSettledValue).toLocaleString()}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
                        <span className="text-indigo-700 dark:text-indigo-300">
                          {isBn ? 'প্রাপ্য বকেয়া এসক্রো' : 'Balance Payable'}:
                        </span>
                        <p className="text-base font-bold text-indigo-800 dark:text-indigo-200 mt-0.5">
                          ৳{Number(agr.balancePayable).toLocaleString()}
                        </p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {agr.status === 'SETTLED'
                            ? isBn
                              ? 'পরিশোধিত'
                              : 'Disbursed'
                            : isBn
                            ? 'সরবরাহের পর প্রযোজ্য'
                            : 'On final delivery'}
                        </span>
                      </div>
                    </div>

                    {/* Milestone Progress Tracker */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        {isBn ? 'উৎপাদন ও পরিবীক্ষণ ধাপ' : 'Cultivation & Milestone Audit Roadmap'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div
                          className={`p-3 rounded-xl border text-xs ${
                            agr.status !== 'APPLIED'
                              ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800'
                              : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
                            <CheckCircle2
                              className={`w-4 h-4 ${
                                agr.status !== 'APPLIED' ? 'text-emerald-600' : 'text-slate-400'
                              }`}
                            />
                            <span>{isBn ? '১. বীজ বপন ও অগ্রিম ছাড়' : '1. Seeding & Advance'}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {agr.advanceWorkingCapitalDisbursed > 0
                              ? isBn
                                ? '২৫% অগ্রিম একাউন্টে ছাড় হয়েছে'
                                : '25% Advance disbursed'
                              : isBn
                              ? 'বায়ার অনুমোদনের অপেক্ষায়'
                              : 'Pending approval'}
                          </p>
                        </div>

                        <div
                          className={`p-3 rounded-xl border text-xs ${
                            ['MILESTONES_VERIFIED', 'DELIVERING', 'SETTLED'].includes(agr.status)
                              ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800'
                              : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
                            <CheckCircle2
                              className={`w-4 h-4 ${
                                ['MILESTONES_VERIFIED', 'DELIVERING', 'SETTLED'].includes(agr.status)
                                  ? 'text-emerald-600'
                                  : 'text-slate-400'
                              }`}
                            />
                            <span>{isBn ? '২. মাঠ পরিদর্শন ও অডিট' : '2. Field Agronomy Audit'}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {hasInspections
                              ? isBn
                                ? `${agr.inspections?.length}টি পরিদর্শন সম্পন্ন`
                                : `${agr.inspections?.length} audit records`
                              : isBn
                              ? 'ফসল পরিপক্কতায় অডিট হবে'
                              : 'Scheduled before harvest'}
                          </p>
                        </div>

                        <div
                          className={`p-3 rounded-xl border text-xs ${
                            agr.status === 'SETTLED'
                              ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800'
                              : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
                            <CheckCircle2
                              className={`w-4 h-4 ${
                                agr.status === 'SETTLED' ? 'text-emerald-600' : 'text-slate-400'
                              }`}
                            />
                            <span>{isBn ? '৩. ওয়েইব্রিজ ও চূড়ান্ত নিষ্পত্তি' : '3. Weighbridge Settlement'}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {agr.status === 'SETTLED'
                              ? isBn
                                ? '১০০% এসক্রো নিষ্পত্তি সম্পন্ন'
                                : '100% Escrow completed'
                              : isBn
                              ? 'ওয়্যারহাউসে সরবরাহ চলছে'
                              : 'Intake in progress'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Detailed Deliveries & Inspections */}
                  <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-500">
                      {agr.campaign?.intakeDropWarehouseName}
                    </span>
                    <button
                      onClick={() => toggleExpand(agr.id)}
                      className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                    >
                      <span>
                        {isExpanded
                          ? isBn
                            ? 'বিবরণ লুকান'
                            : 'Hide Vouchers'
                          : isBn
                          ? 'ওয়েইব্রিজ ভাউচার ও অডিট দেখুন'
                          : 'View Vouchers & Audits'}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expanded Section with Delivery Vouchers & Inspections */}
                  {isExpanded && (
                    <div className="p-6 bg-slate-100/50 dark:bg-slate-800/20 border-t border-slate-200 dark:border-slate-800 space-y-6">
                      {/* Delivery Vouchers Table */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                          <Truck className="w-4 h-4 text-emerald-600" />
                          {isBn ? 'ওয়্যারহাউস ওয়েইব্রিজ চালান ও ডেলিভারি ভাউচার' : 'Weighbridge Delivery Slips'}
                        </h4>
                        {!hasDeliveries ? (
                          <p className="text-xs text-slate-500 italic p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            {isBn
                              ? 'এখনো কোনো ফসল সরবরাহ রেকর্ড করা হয়নি। ফসল কাটার পর নির্দিষ্ট ওয়্যারহাউসে সরবরাহ করুন।'
                              : 'No harvest deliveries recorded yet. Bring produce to the designated aggregation hub.'}
                          </p>
                        ) : (
                          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                  <th className="p-3">{isBn ? 'চালান নং' : 'Voucher #'}</th>
                                  <th className="p-3">{isBn ? 'মোট ওজন' : 'Gross Wt'}</th>
                                  <th className="p-3">{isBn ? 'খালি গাড়ি' : 'Tare Wt'}</th>
                                  <th className="p-3">{isBn ? 'নিট ফসল' : 'Net Wt'}</th>
                                  <th className="p-3">{isBn ? 'গ্রেড' : 'Grade'}</th>
                                  <th className="p-3">{isBn ? 'চূড়ান্ত দর/কেজি' : 'Price/Kg'}</th>
                                  <th className="p-3">{isBn ? 'প্রাপ্য অর্থ' : 'Payable'}</th>
                                  <th className="p-3">{isBn ? 'অপারেটর' : 'Operator'}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {agr.deliveries?.map((d) => (
                                  <tr key={d.id}>
                                    <td className="p-3 font-mono font-medium text-slate-900 dark:text-white">
                                      {d.deliveryVoucherNo}
                                    </td>
                                    <td className="p-3">{d.grossWeightKg} kg</td>
                                    <td className="p-3">{d.tareWeightKg} kg</td>
                                    <td className="p-3 font-bold text-emerald-600">{d.netWeightKg} kg</td>
                                    <td className="p-3">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                                        {d.acceptedGrade}
                                      </span>
                                    </td>
                                    <td className="p-3 font-bold">৳{d.finalPricePerKg}</td>
                                    <td className="p-3 font-black text-emerald-600">
                                      ৳{Number(d.payableBatchAmount).toLocaleString()}
                                    </td>
                                    <td className="p-3 text-slate-500">{d.weighbridgeOperatorName}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Milestone Inspections Record */}
                      {hasInspections && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-teal-600" />
                            {isBn ? 'মাঠ পরিদর্শন ও কৃষিবিদ অডিট হিস্ট্রি' : 'Agronomist Field Inspection Logs'}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {agr.inspections?.map((insp) => (
                              <div
                                key={insp.id}
                                className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {insp.milestoneStage}
                                  </span>
                                  <span className="font-bold text-emerald-600">
                                    Score: {insp.cropHealthScore}/100
                                  </span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 mb-2">
                                  {insp.growthObservations}
                                </p>
                                {insp.recommendations && (
                                  <p className="text-amber-700 dark:text-amber-400 text-[11px] bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg">
                                    <strong>{isBn ? 'পরামর্শ: ' : 'Recommendation: '}</strong>
                                    {insp.recommendations}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
