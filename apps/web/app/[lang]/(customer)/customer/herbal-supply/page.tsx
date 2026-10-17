'use client';

import React from 'react';
import Link from 'next/link';
import {
  Flower2,
  FileText,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  Scale,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  useGetMyPharmaContractsQuery,
  SourcingContractStatus,
  PharmaSourcingContract,
} from '@/features/herbal-supply';

export default function CustomerHerbalSupplyPage() {
  const { data: contractsData, isLoading } = useGetMyPharmaContractsQuery();
  const contracts: PharmaSourcingContract[] = contractsData?.data || [];

  const getStatusBadge = (status: SourcingContractStatus) => {
    switch (status) {
      case 'CONTRACT_ACTIVE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <Clock className="w-3 h-3" /> সক্রিয় চুক্তি (Active)
          </span>
        );
      case 'FULFILLED_ACCEPTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> সম্পূর্ণ ও গৃহীত (Fulfilled)
          </span>
        );
      case 'INSPECTION_PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> ল্যাব নিরীক্ষা পেন্ডিং
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Flower2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>আমার প্রাতিষ্ঠানিক ভেষজ চুক্তি ও অর্ডার (Pharma Herbal Sourcing Portfolio)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            আয়ুর্বেদিক ও ইউনানী ফার্মাসিউটিক্যালস প্রাতিষ্ঠানিক কাঁচামাল সরবরাহ চুক্তি, এসক্রো ডিপোজিট ও ল্যাব মান নিয়ন্ত্রণ
          </p>
        </div>

        <Link
          href="/herbal-supply"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <span>ভেষজ মার্কেটপ্লেস ও ক্যালকুলেটর</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Sourcing Contracts List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          <span>ফার্মাসিউটিক্যালস ভেষজ সরবরাহ চুক্তি সমূহ ({contracts.length})</span>
        </h2>

        {isLoading ? (
          <div className="text-xs text-slate-400 py-6 text-center">তথ্য লোড হচ্ছে...</div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500 space-y-3">
            <Flower2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p>আপনার কোনো সক্রিয় প্রাতিষ্ঠানিক ভেষজ চুক্তি নেই।</p>
            <Link
              href="/herbal-supply"
              className="inline-block text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              ভেষজ মার্কেটপ্লেস থেকে ব্যাচ কোটেশন সংগ্রহ করুন →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
                      {contract.contractNumber}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <span>{contract.buyerCompanyName}</span>
                    </h3>
                  </div>
                  {getStatusBadge(contract.contractStatus)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block">প্রজাতি ও পরিমাণ</span>
                    <span className="font-semibold">{contract.species}</span> • {contract.targetWeightKg} কেজি
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">মোট চুক্তি মূল্য</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ৳{(contract.targetWeightKg * contract.agreedPricePerKgBdt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">নিরাপদ এসক্রো অগ্রিম (৩০%)</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      ৳{contract.escrowAdvanceAmountBdt.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">সর্বোচ্চ আর্দ্রতা সীমা</span>
                    <span className="font-semibold">{contract.maxAllowedMoisturePercentage}%</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span>ডেলিভারি গন্তব্য: <strong>{contract.destinationWarehouseDistrict}</strong></span>
                  <span className="text-emerald-600 font-semibold">{contract.cooperativeName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fresh-to-Dry Advantage Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> ড্রায়ার ও সোলার ডিহাইড্রেশন রূপান্তর
          </span>
          <h3 className="text-lg font-bold">কাঁচা বনাম রোদে শুকানো এ-গ্রেড ভেষজের মুনাফা ক্যালকুলেটর</h3>
          <p className="text-xs text-emerald-100 max-w-xl">
            কাঁচা পাতা বা শিকড় স্থানীয় বাজারে কম দামে বিক্রি না করে সোলার ড্রায়ারে আর্দ্রতা ১০%-এর নিচে নামিয়ে ফার্মা গ্রেডে সরবরাহ করলে নিট মুনাফা ৪০% থেকে ৬৫% বৃদ্ধি পায়।
          </p>
        </div>

        <Link
          href="/herbal-supply"
          className="inline-flex items-center gap-2 px-5 py-3 bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl font-bold text-xs shadow-lg transition-all shrink-0"
        >
          <Scale className="w-4 h-4 text-emerald-700" />
          <span>ড্রাই ওজন রূপান্তর গণনা করুন</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
