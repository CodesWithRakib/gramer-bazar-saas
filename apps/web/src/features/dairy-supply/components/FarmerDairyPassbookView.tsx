'use client';

import React from 'react';
import {
  Droplets,
  Wallet,
  Award,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  ArrowDownLeft,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import {
  useGetMyMilkCollectionsQuery,
  useGetDairyOverviewStatsQuery,
  DairyMilkCollectionEntry,
} from '../dairySupplyApi';

interface FarmerDairyPassbookViewProps {
  lang: string;
}

export const FarmerDairyPassbookView: React.FC<FarmerDairyPassbookViewProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  const { data: collectionsData, isLoading } = useGetMyMilkCollectionsQuery();
  const { data: statsData } = useGetDairyOverviewStatsQuery();

  const collections: DairyMilkCollectionEntry[] = collectionsData?.data || [];
  const stats = statsData?.data;

  const totalVolume = collections.reduce((acc, c) => acc + Number(c.volumeLiters), 0);
  const totalPayout = collections.reduce((acc, c) => acc + Number(c.totalPayoutAmountBdt), 0);
  const avgFat =
    collections.length > 0
      ? (collections.reduce((acc, c) => acc + Number(c.fatPercentage), 0) / collections.length).toFixed(1)
      : '4.2';
  const avgSnf =
    collections.length > 0
      ? (collections.reduce((acc, c) => acc + Number(c.snfPercentage), 0) / collections.length).toFixed(1)
      : '8.4';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-semibold mb-2">
              <Droplets className="w-3.5 h-3.5" />
              <span>{isBn ? 'খামারি দুগ্ধ পাসবুক' : 'Dairy Farmer Passbook'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {isBn ? 'দৈনিক দুধ সরবরাহ খতিয়ান ও ওয়ালেট পে-আউট' : 'Daily Milk Intake & MFS Payout Ledger'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
              {isBn
                ? 'ল্যাকটোমিটার পরীক্ষা, ফ্যাট-এসএনএফ গ্রেডিং এবং বিকাশ/নগদ ওয়ালেটে তাৎক্ষণিক পেমেন্ট বিবরণী।'
                : "Real-time lactometer testing, fat/SNF inspection grades, and instant MFS wallet settlement records."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{isBn ? 'স্মার্ট ওয়ালেট সক্রিয়' : 'MFS Wallet Active'}</span>
            </span>
          </div>
        </div>

        {/* Farmer Summary Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-400">
                {isBn ? 'মোট সরবরাহকৃত দুধ' : 'Total Milk Delivered'}
              </span>
              <Droplets className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {totalVolume.toFixed(1)}{' '}
              <span className="text-xs font-normal text-slate-700 dark:text-slate-300">
                {isBn ? 'লিটার' : 'L'}
              </span>
            </p>
            <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-1 font-semibold">
              {collections.length} {isBn ? 'টি চালান ভাউচার' : 'Intake Vouchers'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-400">
                {isBn ? 'মোট সংগৃহীত পাওনা' : 'Total Earnings'}
              </span>
              <Wallet className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ৳{totalPayout.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-semibold">
              {isBn ? 'সরাসরি বিকাশ/নগদে প্রদেয়' : 'Instant MFS Payout'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-400">
                {isBn ? 'গড় ফ্যাট মাত্রা' : 'Average Fat %'}
              </span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {avgFat}%
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 font-semibold">
              {isBn ? 'বেস ৩.৫% এর চেয়ে উচ্চ' : 'Above standard baseline'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-400">
                {isBn ? 'গড় এসএনএফ (SNF)' : 'Average SNF %'}
              </span>
              <Droplets className="w-4 h-4 text-cyan-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {avgSnf}%
            </p>
            <p className="text-[11px] text-cyan-700 dark:text-cyan-400 mt-1 font-semibold">
              {isBn ? 'রিচমন্ডস ফর্মুলায় সার্টিফাইড' : "Richmond's Certified"}
            </p>
          </div>
        </div>

        {/* Milk Collection Entries Ledger Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {isBn ? 'দুধ সরবরাহ ভাউচার তালিকা' : 'Milk Collection Intake Ledger'}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {isBn
                    ? 'প্রতিটি দোহন শিফটের ল্যাব টেস্ট রিপোর্ট ও পে-আউট স্ট্যাটাস'
                    : 'Shift-wise quality metrics and transaction settlements'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {collections.length} {isBn ? 'টি এন্ট্রি' : 'Records'}
            </span>
          </div>

          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-12">
              <Droplets className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                {isBn
                  ? 'আপনার কোনো দুধ সরবরাহ রেকর্ড এখনো নথিভুক্ত হয়নি।'
                  : 'No milk intake records found in your passbook.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">{isBn ? 'ভাউচার ও তারিখ' : 'Voucher & Date'}</th>
                    <th className="py-3.5 px-4">{isBn ? 'চিলিং সেন্টার' : 'Center & Shift'}</th>
                    <th className="py-3.5 px-4">{isBn ? 'পরিমাণ (L)' : 'Volume (L)'}</th>
                    <th className="py-3.5 px-4">{isBn ? 'CLR / ফ্যাট / SNF' : 'CLR / Fat / SNF'}</th>
                    <th className="py-3.5 px-4">{isBn ? 'গ্রেড' : 'Grade'}</th>
                    <th className="py-3.5 px-4">{isBn ? 'দর / মোট পাওনা' : 'Rate & Payout'}</th>
                    <th className="py-3.5 px-4">{isBn ? 'পেমেন্ট অবস্থা' : 'Payment Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {collections.map((entry) => {
                    const isMorning = entry.collectionShift === 'MORNING_SHIFT';
                    const isPaid = entry.paymentStatus === 'DISBURSED_MFS_WALLET';

                    return (
                      <tr
                        key={entry.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <span className="font-mono font-bold text-slate-900 dark:text-white block">
                            {entry.collectionVoucherNo}
                          </span>
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                            {entry.collectionDate}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {entry.cooperativeName}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 font-medium">
                            {isMorning ? (
                              <Sun className="w-3 h-3 text-amber-500" />
                            ) : (
                              <Moon className="w-3 h-3 text-indigo-400" />
                            )}
                            {isMorning ? (isBn ? 'সকাল' : 'Morning') : (isBn ? 'সন্ধ্যা' : 'Evening')}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                          {entry.volumeLiters} L
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                              CLR: {entry.lactometerReadingCorrected} | Fat: {entry.fatPercentage}%
                            </span>
                            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                              SNF: {entry.snfPercentage}%
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              entry.qualityGrade === 'GRADE_A_PREMIUM_CHILLED'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : entry.qualityGrade === 'GRADE_B_STANDARD'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {entry.qualityGrade.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="text-xs text-slate-700 dark:text-slate-300 block font-medium">
                            ৳{entry.ratePerLiterBdt} / L
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            ৳{entry.totalPayoutAmountBdt}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isPaid
                                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {isPaid ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-500" />
                            )}
                            <span>
                              {isPaid
                                ? isBn
                                  ? 'বিকাশ/নগদ পরিশোধিত'
                                  : 'MFS Disbursed'
                                : isBn
                                ? 'বকেয়া'
                                : 'Pending'}
                            </span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
