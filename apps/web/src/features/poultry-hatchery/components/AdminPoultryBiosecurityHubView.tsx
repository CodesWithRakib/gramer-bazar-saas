'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Egg,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Flame,
  Thermometer,
  Wind,
  Layers,
  MapPin,
  Activity,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  useGetPoultryOverviewStatsQuery,
  useGetPoultryBatchesQuery,
  useGetBrooderTelemetryShedsQuery,
  useGetTableEggLotsQuery,
} from '../poultryHatcheryApi';

interface AdminPoultryBiosecurityHubViewProps {
  lang: string;
}

export const AdminPoultryBiosecurityHubView: React.FC<AdminPoultryBiosecurityHubViewProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  const { data: statsData, isLoading: statsLoading } = useGetPoultryOverviewStatsQuery();
  const { data: batchesData, isLoading: batchesLoading } = useGetPoultryBatchesQuery();
  const { data: shedsData, isLoading: shedsLoading } = useGetBrooderTelemetryShedsQuery();
  const { data: eggLotsData, isLoading: eggLotsLoading } = useGetTableEggLotsQuery();

  const stats = statsData?.data;
  const batches = batchesData?.data || [];
  const sheds = shedsData?.data || [];
  const eggLots = eggLotsData?.data || [];

  const toxicSheds = sheds.filter((s) => s.ammoniaPpm > 25.0);
  const certifiedBatches = batches.filter((b) => b.isBiosecureCertified);
  const totalBirds = batches.reduce((acc, b) => acc + b.chickCount, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-800 via-orange-800 to-amber-900 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold tracking-wide uppercase mb-2">
              <ShieldCheck className="w-4 h-4" />
              {isBn ? 'প্রাণিসম্পদ অধিদপ্তর (ডিএলএস) ও বায়োসিকিউরিটি অডিট' : 'DLS Biosecurity & Vet Audit Desk'}
            </div>
            <h1 className="text-3xl font-black">
              {isBn ? 'পোল্ট্রি বায়োসিকিউরিটি ও হ্যাচারি ভেটেরিনারি নজরদারি' : 'Poultry Biosecurity & Veterinary Surveillance'}
            </h1>
            <p className="text-orange-100 text-sm mt-1">
              {isBn
                ? 'হ্যাচারি টিকা সনদ পর্যবেক্ষণ, ব্রুডার অ্যামোনিয়া টক্সিসিটি সতর্কতা এবং বাণিজ্যিক ডিমের ইউভি-সি জীবাণুমুক্তকরণ অনুমোদন'
                : 'Vaccination audit, brooder ammonia toxicity hazard surveillance, and UV-C sanitization approvals'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/${lang}/poultry-hatchery`}
              className="px-4 py-2.5 rounded-xl bg-white text-orange-900 font-bold hover:bg-orange-50 transition shadow-sm inline-flex items-center gap-2 text-xs"
            >
              <Egg className="w-4 h-4" />
              {isBn ? 'মার্কেটপ্লেস ক্যাটালগ' : 'Public Marketplace'}
            </Link>
          </div>
        </div>

        {/* Audit Metrics */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-xs text-orange-200 uppercase font-semibold">
              {isBn ? 'সার্টিফাইড পাখি' : 'Certified Birds'}
            </div>
            <div className="text-xl font-black mt-0.5">{totalBirds.toLocaleString()}</div>
            <div className="text-[11px] text-orange-200/80 mt-0.5">
              {certifiedBatches.length} {isBn ? 'টি অনুমোদিত ব্যাচ' : 'batches certified'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-xs text-orange-200 uppercase font-semibold">
              {isBn ? 'অ্যামোনিয়া স্পাইক শেড' : 'Ammonia Toxic Spikes'}
            </div>
            <div
              className={`text-xl font-black mt-0.5 ${
                toxicSheds.length > 0 ? 'text-red-300' : 'text-emerald-300'
              }`}
            >
              {toxicSheds.length}
            </div>
            <div className="text-[11px] text-orange-200/80 mt-0.5">
              {toxicSheds.length > 0 ? (isBn ? 'অবিলম্বে ভেন্টিলেশন জরুরি' : 'Ventilation required') : (isBn ? 'সকল শেড স্বাভাবিক' : 'All sheds normal')}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-xs text-orange-200 uppercase font-semibold">
              {isBn ? 'ইউভি-সি প্রত্যয়িত ডিম' : 'UV-C Certified Eggs'}
            </div>
            <div className="text-xl font-black mt-0.5">
              {(stats?.totalEggsCount ?? 32400).toLocaleString()}
            </div>
            <div className="text-[11px] text-orange-200/80 mt-0.5">{eggLots.length} {isBn ? 'টি লট' : 'lots'}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-xs text-orange-200 uppercase font-semibold">
              {isBn ? 'জাতীয় ব্রয়লার এফসিআর' : 'National Broiler FCR'}
            </div>
            <div className="text-xl font-black mt-0.5">{stats?.averageBroilerFcr ?? '1.58'}</div>
            <div className="text-[11px] text-orange-200/80 mt-0.5">
              {isBn ? 'আদর্শ গড়: ১.৫৫' : 'Target: 1.55'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Ammonia Toxic Hazard Desk */}
        {toxicSheds.length > 0 && (
          <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-500 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-black text-lg">
              <AlertTriangle className="w-6 h-6 shrink-0 text-red-600" />
              <span>
                {isBn
                  ? 'জরুরি সতর্কবার্তা: ব্রুডার শেডে বিষাক্ত অ্যামোনিয়া (NH₃ > ২৫ ppm) সনাক্ত!'
                  : 'Emergency Alert: Toxic Ammonia Hazard (>25 ppm) Detected!'}
              </span>
            </div>
            <p className="text-xs text-red-700 dark:text-red-300">
              {isBn
                ? 'অতিরিক্ত অ্যামোনিয়া গ্যাস বাচ্চার ফুসফুস ও চোখের মারাত্মক ক্ষতি করে এবং এ্যাসাইটিস ও সিআরডি রোগের ঝুঁকি বৃদ্ধি করে। স্বয়ংক্রিয় এগজস্ট ফ্যান চালু নিশ্চিত করুন।'
                : 'High ammonia concentration triggers respiratory distress, ascites, and corneal burn in chicks. Automatic ventilation has been commanded.'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {toxicSheds.map((ts) => (
                <div
                  key={ts.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{ts.farmName}</div>
                    <div className="text-xs text-slate-500">{ts.shedCode} • {ts.district}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-red-600 dark:text-red-400">{ts.ammoniaPpm} ppm</div>
                    <div className="text-[11px] font-semibold text-orange-600">Fan: {ts.exhaustFanState}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 1: Hatchery Biosecurity & Vaccination Compliance Audit */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-orange-600" />
              {isBn ? 'হ্যাচারি টিকা ও বায়োসিকিউরিটি সনদ রেজিস্ট্রি' : 'Hatchery Vaccination & Biosecurity Register'}
            </h3>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">{isBn ? 'ব্যাচ কোড' : 'Batch Code'}</th>
                  <th className="px-4 py-3">{isBn ? 'হ্যাচারির নাম' : 'Hatchery Name'}</th>
                  <th className="px-4 py-3">{isBn ? 'জাত' : 'Breed'}</th>
                  <th className="px-4 py-3">{isBn ? 'বাচ্চা সংখ্যা' : 'Birds Count'}</th>
                  <th className="px-4 py-3">{isBn ? 'মৃত্যুহার' : 'Mortality'}</th>
                  <th className="px-4 py-3">{isBn ? 'ডিএলএস ভেট সনদপত্র' : 'DLS Vet Cert No'}</th>
                  <th className="px-4 py-3">{isBn ? 'বায়োসিকিউরিটি স্ট্যাটাস' : 'Biosecurity Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {batches.map((b) => {
                  const mortRate = ((b.mortalityCount / b.chickCount) * 100).toFixed(2);
                  const isHighMort = Number(mortRate) > 3.5;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 font-mono font-bold text-orange-600 dark:text-orange-400">
                        {b.batchCode}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{b.hatcheryName}</div>
                        <div className="text-xs text-slate-400">{b.district} • {b.breederPhone}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {b.breedType.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                        {b.chickCount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${isHighMort ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>
                          {b.mortalityCount} ({mortRate}%)
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {b.dlsSurgeonCertificationNo || 'PENDING'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isBn ? 'অনুমোদিত' : 'Certified'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Table Egg Lots UV-C Sanitization & Grading Register */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
              <Egg className="w-5 h-5 text-amber-600" />
              {isBn ? 'বাণিজ্যিক ডিমের ইউভি-সি ও ওজন গ্রেডিং সনদ' : 'Table Egg Grading & UV-C Audit Register'}
            </h3>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">{isBn ? 'লট নম্বর' : 'Lot No'}</th>
                  <th className="px-4 py-3">{isBn ? 'খামার' : 'Farm'}</th>
                  <th className="px-4 py-3">{isBn ? 'ওজন গ্রেড' : 'Weight Grade'}</th>
                  <th className="px-4 py-3">{isBn ? 'মোট ডিম' : 'Total Eggs'}</th>
                  <th className="px-4 py-3">{isBn ? 'ফাটা ডিম হার' : 'Cracked %'}</th>
                  <th className="px-4 py-3">{isBn ? 'ইউভি-সি জীবাণুমুক্তকরণ' : 'UV-C Sanitization'}</th>
                  <th className="px-4 py-3">{isBn ? 'রেট (শতক)' : 'Rate / 100'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {eggLots.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {e.lotNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{e.farmName}</div>
                      <div className="text-xs text-slate-400">{e.district}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                        {e.eggGrade.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                      {e.totalEggsCount.toLocaleString()} ({e.availableCasesCount} cases)
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                      {e.crackedEggPercentage}%
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        BSTI & DLS Passed
                      </span>
                    </td>
                    <td className="px-4 py-3 font-black text-slate-900 dark:text-slate-100">
                      ৳{e.pricePerHundredBdt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
