'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Sprout,
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
  Droplets,
  Package,
} from 'lucide-react';
import {
  useGetMushroomOverviewStatsQuery,
  useGetMushroomSpawnBatchesQuery,
  useGetFruitingChambersQuery,
  useGetDehydratedMushroomLotsQuery,
} from '../mushroomFarmingApi';

interface AdminMushroomLabTraceabilityHubViewProps {
  lang: string;
}

export const AdminMushroomLabTraceabilityHubView: React.FC<AdminMushroomLabTraceabilityHubViewProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  const { data: statsData, isLoading: statsLoading } = useGetMushroomOverviewStatsQuery();
  const { data: spawnsData, isLoading: spawnsLoading } = useGetMushroomSpawnBatchesQuery();
  const { data: chambersData, isLoading: chambersLoading } = useGetFruitingChambersQuery();
  const { data: lotsData, isLoading: lotsLoading } = useGetDehydratedMushroomLotsQuery();

  const stats = statsData?.data;
  const spawns = spawnsData?.data || [];
  const chambers = chambersData?.data || [];
  const lots = lotsData?.data || [];

  const highCo2Chambers = chambers.filter((c) => c.co2Ppm > 1000.0);
  const totalSpawnPackets = spawns.reduce((acc, s) => acc + s.packetsCount, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold tracking-wide uppercase mb-2">
              <ShieldCheck className="w-4 h-4" />
              {isBn ? 'এনএমডিআই ও বারি মাশরুম ল্যাবরেটরি অডিট' : 'NMDI & BARI Mushroom Lab Audit Desk'}
            </div>
            <h1 className="text-3xl font-black">
              {isBn ? 'স্পন নির্বীজন, চেম্বার CO₂ ও ড্রাই মাশরুম মান নিয়ন্ত্রণ' : 'Mushroom Spawn & Dehydration Regulatory Audit'}
            </h1>
            <p className="text-emerald-100 text-sm mt-1">
              {isBn
                ? '১২১°C অটোক্লেভ নির্বীজন পরিদর্শন, ফ্রুটিং চেম্বারের CO₂ গ্যাস নজরদারি এবং ড্রাই মাশরুমের আর্দ্রতা ও বিটা-গ্লুকান প্রত্যয়ন'
                : 'Autoclave pressure audit, fruiting chamber CO2 hazard surveillance, and dehydrated moisture compliance'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/${lang}/mushroom-farming`}
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-950 font-bold hover:bg-emerald-50 transition shadow-sm inline-flex items-center gap-2 text-xs"
            >
              <Sprout className="w-4 h-4" />
              {isBn ? 'মার্কেটপ্লেস ক্যাটালগ' : 'Public Marketplace'}
            </Link>
          </div>
        </div>

        {/* Audit Metrics */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-xs text-emerald-200 uppercase font-semibold">
              {isBn ? 'অডিটকৃত স্পন প্যাকেট' : 'Audited Spawn Packets'}
            </div>
            <div className="text-xl font-black mt-0.5">{totalSpawnPackets.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-200/80 mt-0.5">
              {spawns.length} {isBn ? 'টি ল্যাবরেটরি ব্যাচ' : 'lab batches'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-xs text-emerald-200 uppercase font-semibold">
              {isBn ? 'উচ্চ CO₂ চেম্বার অ্যালার্ম' : 'High CO2 Chambers'}
            </div>
            <div
              className={`text-xl font-black mt-0.5 ${
                highCo2Chambers.length > 0 ? 'text-red-300' : 'text-emerald-300'
              }`}
            >
              {highCo2Chambers.length}
            </div>
            <div className="text-[11px] text-emerald-200/80 mt-0.5">
              {highCo2Chambers.length > 0 ? (isBn ? 'ড্যাম্পার ভেন্টিলেশন জরুরি' : 'Ventilation required') : (isBn ? 'সকল চেম্বার স্বাভাবিক' : 'All chambers normal')}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-xs text-emerald-200 uppercase font-semibold">
              {isBn ? 'প্রত্যয়িত ড্রাই স্টক' : 'Certified Dry Stock'}
            </div>
            <div className="text-xl font-black mt-0.5">
              {(stats?.totalDehydratedStockKg ?? 55.0)} kg
            </div>
            <div className="text-[11px] text-emerald-200/80 mt-0.5">{lots.length} {isBn ? 'টি ড্রাই লট' : 'lots'}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-xs text-emerald-200 uppercase font-semibold">
              {isBn ? 'গড় আর্দ্রতা কমপ্লায়েন্স' : 'Chamber Humidity'}
            </div>
            <div className="text-xl font-black mt-0.5">
              {stats?.averageChamberHumidityPercent ?? 86.0}%
            </div>
            <div className="text-[11px] text-emerald-200/80 mt-0.5">
              {isBn ? 'মানদণ্ড: ৮০–৯০%' : 'Target: 80–90%'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* High CO2 Hazard Warning Desk */}
        {highCo2Chambers.length > 0 && (
          <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-500 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-black text-lg">
              <AlertTriangle className="w-6 h-6 shrink-0 text-red-600" />
              <span>
                {isBn
                  ? 'জরুরি সতর্কবার্তা: ফ্রুটিং চেম্বারে উচ্চ কার্বন-ডাই-অক্সাইড (CO₂ > ১০০০ ppm) সনাক্ত!'
                  : 'Emergency Alert: High Carbon Dioxide (>1000 ppm) Detected in Chamber!'}
              </span>
            </div>
            <p className="text-xs text-red-700 dark:text-red-300">
              {isBn
                ? 'অতিরিক্ত CO₂ গ্যাসের কারণে মাশরুমের ফ্রুটিং বডির কাণ্ড লম্বা হয়ে যায় এবং ক্যাপ ছোট থাকে। তাজা বাতাসের ড্যাম্পার খুলে অক্সিজেন সঞ্চালন নিশ্চিত করুন।'
                : 'High CO2 level stunts pileus expansion and causes elongated stipes. Automated intake dampers have been commanded.'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {highCo2Chambers.map((hc) => (
                <div
                  key={hc.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{hc.farmName}</div>
                    <div className="text-xs text-slate-500">{hc.chamberCode} • {hc.district}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-red-600 dark:text-red-400">{hc.co2Ppm} ppm</div>
                    <div className="text-[11px] font-semibold text-emerald-600">Damper: {hc.freshAirDamperState}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 1: Spawn Autoclave Sterilization & NMDI Certification Audit */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              {isBn ? 'স্পন অটোক্লেভ নির্বীজন ও এনএমডিআই সনদ অডিট' : 'Spawn Autoclave & NMDI Certification Register'}
            </h3>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Batch Number</th>
                  <th className="px-4 py-3">Lab Name</th>
                  <th className="px-4 py-3">Variety</th>
                  <th className="px-4 py-3">Packets</th>
                  <th className="px-4 py-3">Autoclave Pressure</th>
                  <th className="px-4 py-3">NMDI Cert No</th>
                  <th className="px-4 py-3">Contamination Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {spawns.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {s.batchNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{s.labName}</div>
                      <div className="text-xs text-slate-400">{s.district} • {s.growerPhone}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {s.variety.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                      {s.packetsCount.toLocaleString()} pkts
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                      {s.autoclaveTempCelsius}°C @ {s.autoclavePressurePsi} psi
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {s.nmdiLabCertificationNo || 'PENDING'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Trichoderma Free
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Dehydrated Mushroom Lots Moisture & Beta-Glucan Audit */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-teal-600" />
              {isBn ? 'ড্রাই মাশরুম আর্দ্রতা ও বিটা-গ্লুকান মান নিয়ন্ত্রণ রেজিস্ট্রি' : 'Dehydrated Moisture & Beta-Glucan Audit'}
            </h3>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Lot Code</th>
                  <th className="px-4 py-3">Processor</th>
                  <th className="px-4 py-3">Product Form</th>
                  <th className="px-4 py-3">Dry Stock (kg)</th>
                  <th className="px-4 py-3">Moisture %</th>
                  <th className="px-4 py-3">Beta-Glucan %</th>
                  <th className="px-4 py-3">Packaging Status</th>
                  <th className="px-4 py-3">Rate / kg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lots.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 font-mono font-bold text-teal-600 dark:text-teal-400">
                      {l.lotCode}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{l.processorName}</div>
                      <div className="text-xs text-slate-400">{l.district}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-teal-100 text-teal-900 dark:bg-teal-900/40 dark:text-teal-200">
                        {l.productForm.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                      {l.availableStockKg} kg
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-600">
                      {l.moisturePercentage}% (Pass)
                    </td>
                    <td className="px-4 py-3 font-semibold text-teal-600">
                      {l.polysaccharideBetaGlucanPercent ? `${l.polysaccharideBetaGlucanPercent}%` : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Hermetic Nitrogen
                      </span>
                    </td>
                    <td className="px-4 py-3 font-black text-slate-900 dark:text-slate-100">
                      ৳{l.pricePerKgBdt}
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
