'use client';

import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Calendar,
  Thermometer,
  Stethoscope,
  X,
  FileCheck2,
} from 'lucide-react';
import { useGetHealthPassportQuery } from '../livestockApi';

interface LivestockPassportModalProps {
  earTagNumber: string;
  onClose: () => void;
}

export const LivestockPassportModal: React.FC<LivestockPassportModalProps> = ({
  earTagNumber,
  onClose,
}) => {
  const { data, isLoading } = useGetHealthPassportQuery(earTagNumber);
  const passport = data?.data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-emerald-500/30 overflow-hidden my-8">
        {/* Header with Government & DLS styling */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl border border-white/20 backdrop-blur-xs">
              <ShieldCheck className="w-8 h-8 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                </span>
                <span className="text-xs bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  DLS Verified
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
                ডিজিটাল পশু স্বাস্থ্য পাসপোর্ট ও টিকাদান সনদ
              </h2>
              <p className="text-xs text-emerald-100/80">
                Department of Livestock Services (DLS) • Digital Veterinary Health Passport
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-12 text-center text-slate-500">
              <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
              ডিজিটাল পাসপোর্ট তথ্য লোড হচ্ছে...
            </div>
          ) : !passport ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800 rounded-xl">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-200">
                পাসপোর্ট তথ্য এখনও অনুমোদিত হয়নি
              </p>
              <p className="text-xs text-slate-500 mt-1">
                উপজেলা প্রাণিসম্পদ কর্মকর্তার শারীরিক পরীক্ষা ও সনদ প্রদান প্রক্রিয়াধীন রয়েছে।
              </p>
            </div>
          ) : (
            <>
              {/* Identity Barcode Card */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div>
                  <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    সরকারি কানট্যাগ নম্বর (Official Ear Tag)
                  </span>
                  <div className="text-2xl font-mono font-bold text-emerald-950 dark:text-emerald-100 tracking-wider">
                    {passport.earTagNumber}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> সনদ প্রদানের তারিখ:{' '}
                    {new Date(passport.certifiedAt).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                      passport.healthCertification === 'CERTIFIED_HEALTHY'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300'
                    }`}
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    {passport.healthCertification === 'CERTIFIED_HEALTHY'
                      ? 'সম্পূর্ণ সুস্থ ও বিক্রয়যোগ্য'
                      : passport.healthCertification}
                  </span>
                  <div className="flex items-center justify-center sm:justify-end gap-1 text-[11px] text-slate-500 mt-1.5">
                    <QrCode className="w-3.5 h-3.5" /> স্ক্যান যাচাইকৃত
                  </div>
                </div>
              </div>

              {/* Vitals & Certifying Authority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wide">
                    <Stethoscope className="w-4 h-4 text-emerald-600" /> প্রত্যয়নকারী প্রাণিসম্পদ কর্মকর্তা
                  </div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {passport.veterinaryOfficerName}
                  </div>
                  <div className="text-xs text-slate-500">
                    রেজিস্ট্রেশন: <span className="font-mono">{passport.veterinaryRegNumber}</span>
                  </div>
                  <div className="text-xs text-slate-500">{passport.upazilaHospital}</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wide">
                    <Thermometer className="w-4 h-4 text-emerald-600" /> স্বাস্থ্যগত লক্ষণ ও কৃমিনাশক
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">শরীরের স্বাভাবিক তাপমাত্রা:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {passport.bodyTemperatureCelsius} °C (স্বাভাবিক)
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">কৃমিনাশক দেওয়ার তারিখ:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {passport.dewormingDate || 'নিয়মিত ডোজ সম্পন্ন'}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200/50">
                    লক্ষণ: {passport.healthRemarks || 'কোনো ক্ষতিকর লক্ষণ নেই। স্বাস্থ্য চমৎকার।'}
                  </div>
                </div>
              </div>

              {/* Vaccination Ledger Table */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> সরকারি টিকাদান রেকর্ড (Vaccination Ledger)
                </h3>
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3">টিকার নাম (Disease)</th>
                        <th className="p-3">প্রদানের তারিখ</th>
                        <th className="p-3">পরবর্তী বুস্টার ডোজ</th>
                        <th className="p-3">ব্যাচ নম্বর</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {passport.vaccinationLedger && passport.vaccinationLedger.length > 0 ? (
                        passport.vaccinationLedger.map((v, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                              {v.vaccine === 'FOOT_AND_MOUTH_FMD'
                                ? 'ক্ষুরারোগ (FMD Vaccine)'
                                : v.vaccine === 'ANTHRAX'
                                ? 'তড়কা (Anthrax Spore)'
                                : v.vaccine === 'LUMPY_SKIN_DISEASE_LSD'
                                ? 'লাম্পি স্কিন ডিজিজ (LSD)'
                                : v.vaccine === 'BLACK_QUARTER_BQ'
                                ? 'বাদলা রোগ (BQ Vaccine)'
                                : v.vaccine === 'PPR_GOAT_PLAGUE'
                                ? 'পিপিআর (PPR Vaccine)'
                                : v.vaccine}
                            </td>
                            <td className="p-3 text-slate-600 dark:text-slate-300">{v.doseDate}</td>
                            <td className="p-3 text-emerald-600 dark:text-emerald-400 font-medium">
                              {v.nextDueDate}
                            </td>
                            <td className="p-3 font-mono text-slate-500">{v.batchNo}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-400">
                            কোনো ভ্যাকসিনের রেকর্ড নেই
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs text-slate-500">
          <span>ইন্টারনেট ছাড়া যেকোনো হাটে কানট্যাগ দিয়ে যাচাই করুন</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg font-semibold transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
