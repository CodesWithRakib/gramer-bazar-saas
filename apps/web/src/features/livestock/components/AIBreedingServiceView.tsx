'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  useGetMyAIBookingsQuery,
  useCreateAIBookingMutation,
  useGetAIWindowCalcQuery,
} from '../livestockApi';

export const AIBreedingServiceView: React.FC = () => {
  const [heatTime, setHeatTime] = useState<string>('2026-10-17 06:30 AM');
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [farmerDistrict, setFarmerDistrict] = useState('Bogura');
  const [farmerUpazila, setFarmerUpazila] = useState('Sherpur');
  const [targetDamEarTag, setTargetDamEarTag] = useState('');
  const [targetDamBreed, setTargetDamBreed] = useState('LOCAL_DESHI');
  const [desiredSireBreed, setDesiredSireBreed] = useState('HOLSTEIN_FRIESIAN_CROSS');
  const [strawSource, setStrawSource] = useState('Central Cattle Breeding & Dairy Farm (CCBDF), Savar');
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const { data: windowData } = useGetAIWindowCalcQuery({ heatObservedAt: heatTime });
  const aiWindow = windowData?.data;

  const { data: myBookingsData, isLoading } = useGetMyAIBookingsQuery();
  const bookings = myBookingsData?.data || [];

  const [createBooking, { isLoading: isBooking }] = useCreateAIBookingMutation();

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBooking({
        farmerName,
        farmerPhone,
        farmerDistrict,
        farmerUpazila,
        targetDamEarTag,
        targetDamBreed,
        desiredSireBreed,
        strawSource,
        heatObservationDate: heatTime,
      }).unwrap();

      setBookingSuccess('কৃত্রিম প্রজনন (AI) টেকনিশিয়ান সফলভাবে বুক হয়েছে! আপনার নির্ধারিত সময়ে সার্টিফাইড টেকনিশিয়ান তরল নাইট্রোজেন ও সিমেন স্ট্র নিয়ে উপস্থিত হবেন।');
      setTimeout(() => {
        setBookingSuccess(null);
        setTargetDamEarTag('');
      }, 4000);
    } catch {
      alert('বুকিং ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-10 shadow-lg border border-blue-500/20">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" /> উন্নত জাত উন্নয়ন ও দুগ্ধ উৎপাদন বিপ্লব
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            দোরগোড়ায় কৃত্রিম প্রজনন (AI) ও বিশুদ্ধ জাতের সিমেন সেবা
          </h1>
          <p className="text-blue-100/80 text-xs sm:text-sm leading-relaxed">
            সাভার কেন্দ্রীয় গো-প্রজনন ও দুগ্ধ খামার এবং ব্র্যাক কৃত্রিম প্রজনন এন্টারপ্রাইজের শতভাগ বিশুদ্ধ ও পরীক্ষিত সিমেন স্ট্র। অভিজ্ঞ ও সরকারি সনদপ্রাপ্ত ফিল্ড টেকনিশিয়ান দ্বারা বাড়ি বা খামারে সেবা।
          </p>
        </div>
      </div>

      {/* AM/PM Heat Timing Calculator & Pedigree Lineage Straws */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timing Matrix */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" /> সকাল-সন্ধ্যা এআই টাইমিং ক্যালকুলেটর
            </h3>
            <span className="text-[11px] bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md font-bold">
              AM/PM Rule
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                গাভীতে গরম (Standing Heat) লক্ষণ প্রথম দেখার সময়:
              </label>
              <input
                type="text"
                value={heatTime}
                onChange={(e) => setHeatTime(e.target.value)}
                placeholder="উদাঃ 2026-10-17 06:30 AM"
                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            {aiWindow && (
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 space-y-3">
                <div className="text-xs text-blue-900 dark:text-blue-200 font-semibold leading-relaxed">
                  {aiWindow.ruleDescriptionBn}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-blue-100 dark:border-blue-900">
                    <span className="text-slate-500 text-[10px] block">ইনসেমিনেশন শুরুর উপযুক্ত সময়:</span>
                    <strong className="text-blue-700 dark:text-blue-300 font-bold">{aiWindow.windowStart}</strong>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-blue-100 dark:border-blue-900">
                    <span className="text-slate-500 text-[10px] block">সর্বোচ্চ সুযোগের শেষ সময়:</span>
                    <strong className="text-blue-700 dark:text-blue-300 font-bold">{aiWindow.windowEnd}</strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                  সঠিক সময়ে প্রজনন করালে গর্ভধারণের সম্ভাবনা ৭৫% এর উপরে পৌঁছায়।
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Straw Catalog */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> সার্টিফাইড জাত ও সিমেন উৎস
          </h3>

          <div className="space-y-3">
            {[
              {
                breed: '১০০% হলস্টাইন ফ্রিজিয়ান (HF-100)',
                yield: 'প্রত্যাশিত কন্যা বাছুরের দৈনিক দুধ: ২৫-৩২ লিটার',
                source: 'সাভার কেন্দ্রীয় কৃত্রিম প্রজনন গবেষণাগার',
                color: 'border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20',
              },
              {
                breed: '৭৫% শাহীওয়াল ক্রস (Sahiwal-75)',
                yield: 'রোগ প্রতিরোধ ক্ষমতা ও উচ্চ চর্বিযুক্ত (৪.৫%) দুধ',
                source: 'ডিএলএস ও বাংলাদেশ কৃষি বিশ্ববিদ্যালয়',
                color: 'border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20',
              },
              {
                breed: 'রেড চিটাগাং ক্যাটল (RCC খাঁটি দেশি)',
                yield: 'চরম আবহাওয়া সহনশীল ও কম খরচে লালনযোগ্য জাত',
                source: 'চট্টগ্রাম সরকারি জাত সংরক্ষণাগার',
                color: 'border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20',
              },
            ].map((s, i) => (
              <div key={i} className={`p-3.5 rounded-xl border ${s.color} space-y-1 text-xs`}>
                <div className="font-bold text-slate-900 dark:text-slate-100">{s.breed}</div>
                <div className="text-emerald-700 dark:text-emerald-400 font-medium">{s.yield}</div>
                <div className="text-[11px] text-slate-500">উৎস: {s.source}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" /> দোরগোড়ায় এআই টেকনিশিয়ান সেবা বুকিং
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            সিমেন স্ট্র সহ উপজেলা প্রাণিসম্পদ অধিদপ্তরের সনদপ্রাপ্ত এআই কর্মী খামারে পৌঁছাবেন
          </p>
        </div>

        {bookingSuccess ? (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            {bookingSuccess}
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">খামারির নাম</label>
                <input
                  type="text"
                  required
                  placeholder="উদাঃ আনোয়ার হোসেন"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">মোবাইল নম্বর</label>
                <input
                  type="text"
                  required
                  placeholder="০১৭xxxxxxxx"
                  value={farmerPhone}
                  onChange={(e) => setFarmerPhone(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">জেলা</label>
                <input
                  type="text"
                  required
                  value={farmerDistrict}
                  onChange={(e) => setFarmerDistrict(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">উপজেলা</label>
                <input
                  type="text"
                  required
                  value={farmerUpazila}
                  onChange={(e) => setFarmerUpazila(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">গাভীর সরকারি কানট্যাগ (Ear Tag)</label>
                <input
                  type="text"
                  required
                  placeholder="উদাঃ BAN-LIV-892101"
                  value={targetDamEarTag}
                  onChange={(e) => setTargetDamEarTag(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">গাভীর বর্তমান জাত</label>
                <select
                  value={targetDamBreed}
                  onChange={(e) => setTargetDamBreed(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                >
                  <option value="LOCAL_DESHI">দেশি জাত (Local Deshi)</option>
                  <option value="HOLSTEIN_FRIESIAN_CROSS">হলস্টাইন ফ্রিজিয়ান ক্রস</option>
                  <option value="SAHIWAL_CROSS">শাহীওয়াল ক্রস</option>
                  <option value="RED_CHITTAGONG_CATTLE_RCC">রেড চিটাগাং ক্যাটল (RCC)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">কাঙ্ক্ষিত ষাঁড়ের সিমেন জাত</label>
                <select
                  value={desiredSireBreed}
                  onChange={(e) => setDesiredSireBreed(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                >
                  <option value="HOLSTEIN_FRIESIAN_CROSS">১০০% হলস্টাইন ফ্রিজিয়ান (উচ্চ দুধ)</option>
                  <option value="SAHIWAL_CROSS">৭৫% শাহীওয়াল (উচ্চ চর্বি ও রোগ প্রতিরোধ)</option>
                  <option value="RED_CHITTAGONG_CATTLE_RCC">খাঁটি রেড চিটাগাং (RCC)</option>
                  <option value="BRAHMAN_CROSS">ব্রাহমান ক্রস (মাংসের ষাঁড় উৎপাদন)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-xs">
              <div>
                <span className="font-bold text-blue-950 dark:text-blue-100 block">
                  সরকারি ভর্তুকিপ্রাপ্ত সিমেন স্ট্র ও সার্ভিস চার্জ
                </span>
                <span className="text-slate-500">টেকনিশিয়ান ভিজিট ও তরল নাইট্রোজেন কন্টেইনার চার্জ অন্তর্ভুক্ত</span>
              </div>
              <div className="text-xl font-black text-blue-600 dark:text-blue-400">৳৬৫০</div>
            </div>

            <button
              type="submit"
              disabled={isBooking}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm shadow-md transition-all"
            >
              {isBooking ? 'বুকিং হচ্ছে...' : 'এআই টেকনিশিয়ান ভিজিট নিশ্চিত করুন'}
            </button>
          </form>
        )}
      </div>

      {/* Previous AI Services History */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" /> আমার কৃত্রিম প্রজনন অনুরোধ ও গর্ভধারণ ট্র্যাকিং
        </h3>

        {isLoading ? (
          <div className="text-slate-400 text-xs py-4">লোড হচ্ছে...</div>
        ) : bookings.length === 0 ? (
          <div className="text-slate-500 text-xs py-4 text-center">আপনার কোনো পূর্ববর্তী এআই বুকিং নেই।</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {bookings.map((b) => (
              <div key={b.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {b.bookingNumber} • কানট্যাগ: <span className="font-mono text-emerald-600">{b.targetDamEarTag}</span>
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    সিমেন: {b.desiredSireBreed.replace(/_/g, ' ')} • উৎস: {b.strawSource}
                  </div>
                  {b.technicianName && (
                    <div className="text-blue-600 dark:text-blue-400 mt-0.5 font-medium">
                      টেকনিশিয়ান: {b.technicianName} ({b.technicianPhone})
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      b.status === 'INSEMINATION_COMPLETED' || b.status === 'PREGNANCY_CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {b.status}
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">ফি: ৳{Number(b.fee).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
