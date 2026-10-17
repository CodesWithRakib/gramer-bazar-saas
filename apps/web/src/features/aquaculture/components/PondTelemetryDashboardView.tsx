'use client';

import React, { useState } from 'react';
import {
  Droplets,
  Wind,
  Thermometer,
  Activity,
  AlertTriangle,
  PlusCircle,
  CheckCircle2,
  Scale,
  Sparkles,
} from 'lucide-react';
import {
  useGetFarmerLatestTelemetryQuery,
  useIngestPondTelemetryMutation,
  useGetFarmerFcrLogsQuery,
  useRecordFeedFcrMutation,
} from '../aquacultureApi';

export const PondTelemetryDashboardView: React.FC = () => {
  const [showAddReading, setShowAddReading] = useState(false);
  const [showAddFcr, setShowAddFcr] = useState(false);

  // Sensor Form
  const [pondId, setPondId] = useState('pond-01');
  const [pondName, setPondName] = useState('Pond 01 - Tilapia Intensive');
  const [doMgL, setDoMgL] = useState(5.4);
  const [tempC, setTempC] = useState(28.5);
  const [waterPh, setWaterPh] = useState(7.5);
  const [ammoniaPpm, setAmmoniaPpm] = useState(0.02);
  const [salinityPpt, setSalinityPpt] = useState(0.0);
  const [sensorSuccess, setSensorSuccess] = useState<string | null>(null);

  // FCR Form
  const [fcrPondId, setFcrPondId] = useState('pond-01');
  const [fcrSpecies, setFcrSpecies] = useState('MONOSEX_TILAPIA');
  const [feedBrand, setFeedBrand] = useState('Mega Feed Floating Grower');
  const [feedKg, setFeedKg] = useState(1500);
  const [biomassKg, setBiomassKg] = useState(1150);
  const [avgWeightGrams, setAvgWeightGrams] = useState(260);
  const [fcrSuccess, setFcrSuccess] = useState<string | null>(null);

  const { data: telemData, isLoading: isTelemLoading } = useGetFarmerLatestTelemetryQuery();
  const telemetryList = telemData?.data || [];

  const { data: fcrData, isLoading: isFcrLoading } = useGetFarmerFcrLogsQuery();
  const fcrLogs = fcrData?.data || [];

  const [ingestTelemetry, { isLoading: isIngesting }] = useIngestPondTelemetryMutation();
  const [recordFcr, { isLoading: isRecordingFcr }] = useRecordFeedFcrMutation();

  const handleSensorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ingestTelemetry({
        pondId,
        pondName,
        dissolvedOxygenMgL: doMgL,
        waterTemperatureCelsius: tempC,
        waterPh,
        ammoniaNh3Ppm: ammoniaPpm,
        salinityPpt,
      }).unwrap();

      setSensorSuccess('আইওটি সেন্সর রিডিং সংরক্ষিত হয়েছে! অ্যালগরিদম স্বয়ংক্রিয়ভাবে হাইপোক্সিয়া চেক করেছে।');
      setTimeout(() => {
        setSensorSuccess(null);
        setShowAddReading(false);
      }, 2500);
    } catch {
      alert('সেন্সর ডেটা সংরক্ষণে সমস্যা হয়েছে।');
    }
  };

  const handleFcrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recordFcr({
        pondId: fcrPondId,
        species: fcrSpecies as any,
        stockingDate: '2026-07-01',
        feedBrand,
        cumulativeFeedKg: feedKg,
        estimatedBiomassKg: biomassKg,
        averageBodyWeightGrams: avgWeightGrams,
        recordedDate: new Date().toISOString().split('T')[0],
      }).unwrap();

      setFcrSuccess('এফসিআর ও বায়োমাস গ্রোথ সফলভাবে সংরক্ষিত হয়েছে!');
      setTimeout(() => {
        setFcrSuccess(null);
        setShowAddFcr(false);
      }, 2500);
    } catch {
      alert('এফসিআর ডেটা সংরক্ষণে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Droplets className="w-6 h-6 text-cyan-600" /> পুকুরের পানির আইওটি সেন্সর ও এফসিআর ট্র্যাকার
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            দ্রবীভূত অক্সিজেন (DO), অ্যামোনিয়া, পিএইচ, স্বয়ংক্রিয় এয়ারেটর ও খাদ্য রূপান্তর অনুপাত (FCR)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddReading(true)}
            className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> পানি সেন্সর ডেটা যোগ
          </button>
          <button
            onClick={() => setShowAddFcr(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <Scale className="w-4 h-4" /> এফসিআর হিসেব যোগ
          </button>
        </div>
      </div>

      {/* Real-time Telemetry Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-600" /> আমার পুকুর ও ঘেরের সাম্প্রতিক সেন্সর টেলিমেট্রি
        </h2>

        {isTelemLoading ? (
          <div className="text-xs text-slate-400 py-6 text-center">লোড হচ্ছে...</div>
        ) : telemetryList.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            কোনো সেন্সর রিডিং পাওয়া যায়নি। নতুন রিডিং যোগ করুন।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {telemetryList.map((t) => {
              const isHypoxia = t.dissolvedOxygenMgL < 4.0;
              return (
                <div
                  key={t.id}
                  className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
                    isHypoxia
                      ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {t.pondName}
                      </h3>
                      <span className="text-[11px] text-slate-500">
                        আইডি: {t.pondId} • {new Date(t.recordedAt).toLocaleTimeString('bn-BD')}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                        isHypoxia
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {t.waterQualityStatus}
                    </span>
                  </div>

                  {/* Vitals Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <span className="text-slate-400 text-[10px] block">অক্সিজেন (DO)</span>
                      <strong className={`font-black text-sm ${isHypoxia ? 'text-rose-600' : 'text-cyan-600'}`}>
                        {t.dissolvedOxygenMgL} mg/L
                      </strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <span className="text-slate-400 text-[10px] block">তাপমাত্রা</span>
                      <strong className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {t.waterTemperatureCelsius} °C
                      </strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <span className="text-slate-400 text-[10px] block">পিএইচ (pH)</span>
                      <strong className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {t.waterPh}
                      </strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <span className="text-slate-400 text-[10px] block">অ্যামোনিয়া</span>
                      <strong className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {t.ammoniaNh3Ppm} ppm
                      </strong>
                    </div>
                  </div>

                  {t.alertMessage && (
                    <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl text-xs text-rose-800 dark:text-rose-300 border border-rose-200/50 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" /> {t.alertMessage}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                    <span>স্বয়ংক্রিয় এয়ারেটর স্ট্যাটাস:</span>
                    <span className={`font-bold ${t.aeratorsActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {t.aeratorsActive ? 'ঘূর্ণায়মান (Active)' : 'বন্ধ (Standby)'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FCR Efficiency Logs */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Scale className="w-5 h-5 text-indigo-600" /> খাদ্য রূপান্তর অনুপাত (FCR) ও বায়োমাস গ্রোথ রেকর্ড
        </h2>

        {isFcrLoading ? (
          <div className="text-xs text-slate-400 py-6 text-center">লোড হচ্ছে...</div>
        ) : fcrLogs.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            কোনো এফসিআর রেকর্ড নেই। খাদ্য প্রয়োগ ও বায়োমাস স্যাম্পলিং যোগ করুন।
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">পুকুর ও প্রজাতি</th>
                  <th className="p-3">মোট খাদ্য প্রয়োগ (কেজি)</th>
                  <th className="p-3">মোট বায়োমাস (কেজি)</th>
                  <th className="p-3">গড় ওজন (গ্রাম)</th>
                  <th className="p-3">এফসিআর (FCR)</th>
                  <th className="p-3">তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {fcrLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{log.species}</div>
                      <div className="text-slate-500 text-[11px]">{log.pondId} • {log.feedBrand}</div>
                    </td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      {log.cumulativeFeedKg.toLocaleString()} কেজি
                    </td>
                    <td className="p-3 font-semibold text-emerald-600">
                      {log.estimatedBiomassKg.toLocaleString()} কেজি
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {log.averageBodyWeightGrams} গ্রাম
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-sm">
                        {log.calculatedFcr}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">{log.recordedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Reading Modal */}
      {showAddReading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Droplets className="w-5 h-5 text-cyan-600" /> নতুন পানি সেন্সর ডেটা এন্ট্রি
              </h3>
              <button onClick={() => setShowAddReading(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {sensorSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                {sensorSuccess}
              </div>
            ) : (
              <form onSubmit={handleSensorSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300">পুকুরের নাম</label>
                  <input
                    type="text"
                    required
                    value={pondName}
                    onChange={(e) => setPondName(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">অক্সিজেন (DO mg/L)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={doMgL}
                      onChange={(e) => setDoMgL(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">তাপমাত্রা (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={tempC}
                      onChange={(e) => setTempC(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">পিএইচ (pH)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={waterPh}
                      onChange={(e) => setWaterPh(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">অ্যামোনিয়া (ppm)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={ammoniaPpm}
                      onChange={(e) => setAmmoniaPpm(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isIngesting}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs shadow-md mt-2"
                >
                  {isIngesting ? 'সংরক্ষণ হচ্ছে...' : 'সেন্সর রিডিং সংরক্ষণ করুন'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add FCR Modal */}
      {showAddFcr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" /> এফসিআর ও স্যাম্পলিং হিসাব
              </h3>
              <button onClick={() => setShowAddFcr(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {fcrSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                {fcrSuccess}
              </div>
            ) : (
              <form onSubmit={handleFcrSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300">খাদ্যের ব্র্যান্ড</label>
                  <input
                    type="text"
                    required
                    value={feedBrand}
                    onChange={(e) => setFeedBrand(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">মোট খাদ্য প্রয়োগ (কেজি)</label>
                    <input
                      type="number"
                      required
                      value={feedKg}
                      onChange={(e) => setFeedKg(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300">মাছের মোট বায়োমাস (কেজি)</label>
                    <input
                      type="number"
                      required
                      value={biomassKg}
                      onChange={(e) => setBiomassKg(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300">নমুনা মাছের গড় ওজন (গ্রাম)</label>
                  <input
                    type="number"
                    required
                    value={avgWeightGrams}
                    onChange={(e) => setAvgWeightGrams(Number(e.target.value))}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isRecordingFcr}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md mt-2"
                >
                  {isRecordingFcr ? 'হিসাব হচ্ছে...' : 'এফসিআর সংরক্ষণ করুন'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
