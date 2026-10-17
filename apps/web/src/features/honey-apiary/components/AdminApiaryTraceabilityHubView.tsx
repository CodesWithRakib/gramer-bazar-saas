'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Snowflake,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText,
  Building2,
  Compass,
  Award,
  Sparkles,
} from 'lucide-react';
import {
  useGetHoneyLotsQuery,
  useGetSuperfoodBatchesQuery,
  useGetApiaryBoxesQuery,
  useCreateSuperfoodBatchMutation,
  SuperfoodProductType,
} from '../honeyApiaryApi';

interface AdminApiaryTraceabilityHubViewProps {
  lang: string;
}

export const AdminApiaryTraceabilityHubView: React.FC<AdminApiaryTraceabilityHubViewProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  // API Queries
  const { data: lotsData, refetch: refetchLots } = useGetHoneyLotsQuery();
  const { data: superfoodsData, refetch: refetchSuperfoods } = useGetSuperfoodBatchesQuery();
  const { data: boxesData, refetch: refetchBoxes } = useGetApiaryBoxesQuery();

  // Mutations
  const [createSuperfood, { isLoading: isCreatingSuperfood }] = useCreateSuperfoodBatchMutation();

  // New Superfood Form State
  const [superfoodType, setSuperfoodType] = useState<SuperfoodProductType>('FRESH_FROZEN_ROYAL_JELLY');
  const [producerName, setProducerName] = useState('সুন্দরবন এপিয়ারি অ্যান্ড বায়োটেক');
  const [harvestLocation, setHarvestLocation] = useState('সুন্দরবন পশ্চিম রেঞ্জ');
  const [weightGrams, setWeightGrams] = useState(100);
  const [tenHda, setTenHda] = useState(1.9);
  const [tempCelsius, setTempCelsius] = useState(-18.0);
  const [priceBdt, setPriceBdt] = useState(2800);
  const [stockCount, setStockCount] = useState(20);
  const [superfoodSuccess, setSuperfoodSuccess] = useState<string | null>(null);

  const lots = lotsData?.data || [];
  const superfoods = superfoodsData?.data || [];
  const boxes = boxesData?.data || [];

  const handleCreateSuperfood = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createSuperfood({
        productType: superfoodType,
        producerName,
        harvestLocation,
        weightGrams: Number(weightGrams),
        tenHdaPercentage: Number(tenHda),
        storageTemperatureCelsius: Number(tempCelsius),
        priceBdt: Number(priceBdt),
        availableStockCount: Number(stockCount),
      }).unwrap();

      if (res.success) {
        setSuperfoodSuccess(
          isBn
            ? `সুপারফুড ব্যাচ #${res.data.batchNumber} (${res.data.productType}) সফলভাবে নিবন্ধিত হয়েছে!`
            : `Superfood batch #${res.data.batchNumber} registered successfully!`
        );
        refetchSuperfoods();
        setTimeout(() => setSuperfoodSuccess(null), 4000);
      }
    } catch {
      // Handled
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>{isBn ? 'বন বিভাগ ও বিএসটিআই নিরীক্ষা কেন্দ্র' : 'Forest Dept & BSTI Audit Center'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {isBn
                ? 'মধু ল্যাব নিরীক্ষা, বুনো মৌয়াল পারমিট ও সুপারফুড কোল্ড-চেইন'
                : 'Honey Lab Audits, Forest Permits & Superfood Vault'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
              {isBn
                ? 'সুন্দরবনের পাশ পারমিট যাচাই, C4 কর্ন সিরাপ ভেজাল স্ক্রিনিং এবং -১৮°C তাজা রয়্যাল জেলি নিয়ন্ত্রণ।'
                : 'Sundarbans Forest Department pass permits, C4 HFCS screening, and sub-zero royal jelly vault governance.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                refetchLots();
                refetchSuperfoods();
                refetchBoxes();
              }}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section 1: Register New Royal Jelly / Superfood Batch */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300">
              <Snowflake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isBn ? 'রয়্যাল জেলি ও সুপারফুড কোল্ড-চেইন ব্যাচ নিবন্ধন' : 'Register Sub-Zero Superfood Batch'}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {isBn
                  ? 'তাজা রয়্যাল জেলি -১৮°C ডিপ ফ্রিজার ও 10-HDA বায়োঅ্যাসিড শতাংশ যাচাই'
                  : 'Sub-zero cold chain (-18°C) and 10-HDA bioactive acid percentage validation'}
              </p>
            </div>
          </div>

          {superfoodSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{superfoodSuccess}</span>
            </div>
          )}

          <form onSubmit={handleCreateSuperfood} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'সুপারফুড পণ্য' : 'Superfood Product'}
                </label>
                <select
                  value={superfoodType}
                  onChange={(e) => setSuperfoodType(e.target.value as SuperfoodProductType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                >
                  <option value="FRESH_FROZEN_ROYAL_JELLY">তাজা ফ্রোজেন রয়্যাল জেলি (-১৮°C)</option>
                  <option value="BEE_PROPOLIS_RESIN">মৌ-আঠা প্রোপোলিস নির্যাস</option>
                  <option value="RAW_BEE_POLLEN_GRANULES">কাঁচা মৌ-পরাগ রেনু (Pollen)</option>
                  <option value="COMB_HONEY_IN_FRAME">ফ্রেমসহ চাকের মধু</option>
                  <option value="BEE_VENOM_EXTRACT">মৌ-বিষ নির্যাস (Venom)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'উৎপাদনকারী বা ল্যাব' : 'Producer Lab'}
                </label>
                <input
                  type="text"
                  value={producerName}
                  onChange={(e) => setProducerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'সংগ্রহের স্থান' : 'Harvest Location'}
                </label>
                <input
                  type="text"
                  value={harvestLocation}
                  onChange={(e) => setHarvestLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'ওজন (গ্রাম)' : 'Weight (Grams)'}
                </label>
                <input
                  type="number"
                  step="10"
                  min="10"
                  value={weightGrams}
                  onChange={(e) => setWeightGrams(parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? '10-HDA % (রয়্যাল জেলি)' : '10-HDA %'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.0"
                  max="5.0"
                  value={tenHda}
                  onChange={(e) => setTenHda(parseFloat(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'তাপমাত্রা (°C)' : 'Storage Temp (°C)'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={tempCelsius}
                  onChange={(e) => setTempCelsius(parseFloat(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'মূল্য (৳)' : 'Price (৳)'}
                </label>
                <input
                  type="number"
                  step="50"
                  min="100"
                  value={priceBdt}
                  onChange={(e) => setPriceBdt(parseFloat(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'মজুত সংখ্যা' : 'Stock Units'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={stockCount}
                  onChange={(e) => setStockCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreatingSuperfood}
              className="w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isCreatingSuperfood ? (
                <span>{isBn ? 'নিবন্ধন করা হচ্ছে...' : 'Registering...'}</span>
              ) : (
                <>
                  <Snowflake className="w-4 h-4" />
                  <span>{isBn ? 'সুপারফুড ব্যাচ যুক্ত করুন' : 'Register Superfood Batch'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Section 2: Honey Harvest Lots Lab Audit Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {isBn ? 'দেশব্যাপী মধু আহরণ লট ও ল্যাব নিরীক্ষা রেজিস্ট্রি' : 'Nationwide Honey Harvest Lots & Lab Audits'}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {isBn
                    ? 'C4 আইসোটোপ ও আর্দ্রতা ভিত্তিতে বিএসটিআই মান যাচাই এবং বন বিভাগের পারমিট ট্র্যাকিং'
                    : 'Purity grade verification, C4 isotope analysis, and Forest Department permit registry'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lots.length} {isBn ? 'টি লট' : 'Lots'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">{isBn ? 'লট নম্বর' : 'Lot No'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'মৌয়াল ও জেলা' : 'Beekeeper & District'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'ফুলের উৎস' : 'Floral Source'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'ভলিউম (kg)' : 'Volume'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'আর্দ্রতা / C4 / HMF' : 'Moisture / C4 / HMF'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'ল্যাব গ্রেড' : 'Grade'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'অনুমোদন ও পারমিট' : 'Permits'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lots.map((lot) => (
                  <tr
                    key={lot.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {lot.lotNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {lot.beekeeperName}
                      </span>
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {lot.district} ({lot.beekeeperPhone})
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      {lot.floralSource.replace(/_/g, ' ')}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {lot.grossVolumeKg} kg
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {lot.moisturePercentage}% M
                      </span>{' '}
                      | {lot.c4SugarIsotopeRatioPermil}‰ | {lot.hmfFreshnessMgPerKg} mg
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          lot.purityGrade === 'GRADE_A_RAW_UNPROCESSED'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : lot.purityGrade === 'GRADE_B_DOMESTIC_STANDARD'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {lot.purityGrade.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {lot.forestDeptPermitNo ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold block">
                          বন পারমিট: {lot.forestDeptPermitNo}
                        </span>
                      ) : null}
                      {lot.labCertificateNo ? (
                        <span className="text-blue-600 dark:text-blue-400 block">
                          ল্যাব: {lot.labCertificateNo}
                        </span>
                      ) : null}
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
