'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Tractor,
  Calendar,
  MapPin,
  ShieldCheck,
  TrendingDown,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Phone,
  User,
  Fuel,
  Info,
} from 'lucide-react';
import {
  useGetMachineryItemByIdQuery,
  useCalculateQuoteMutation,
  useCreateMachineryBookingMutation,
  FuelOption,
  OperatorOption,
  QuoteResult,
} from '../machineryApi';

interface MachineryBookingViewProps {
  id: string;
  lang?: string;
}

export function MachineryBookingView({ id, lang = 'en' }: MachineryBookingViewProps) {
  const isBn = lang === 'bn';
  const router = useRouter();

  const { data: item, isLoading: isItemLoading, error: itemError } = useGetMachineryItemByIdQuery(id);

  // Form State
  const [plotSizeValue, setPlotSizeValue] = useState<number>(3);
  const [startDate, setStartDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0] || '';
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const inTwoDays = new Date();
    inTwoDays.setDate(inTwoDays.getDate() + 2);
    return inTwoDays.toISOString().split('T')[0] || '';
  });

  const [plotDistrict, setPlotDistrict] = useState<string>('');
  const [plotUpazila, setPlotUpazila] = useState<string>('');
  const [plotUnion, setPlotUnion] = useState<string>('');
  const [plotVillage, setPlotVillage] = useState<string>('');
  const [plotAddress, setPlotAddress] = useState<string>('');

  const [fuelOption, setFuelOption] = useState<FuelOption>('FUEL_INCLUDED');
  const [operatorOption, setOperatorOption] = useState<OperatorOption>('OPERATOR_INCLUDED');

  const [renterName, setRenterName] = useState<string>('');
  const [renterPhone, setRenterPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBookingRef, setConfirmedBookingRef] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-fill location from equipment defaults
  useEffect(() => {
    if (item) {
      setPlotDistrict(item.district || '');
      setPlotUpazila(item.upazila || '');
      setPlotUnion(item.union || '');
      setPlotVillage(item.village || '');
      setFuelOption(item.fuelOption);
      setOperatorOption(item.operatorOption);
    }
  }, [item]);

  const [calculateQuoteMutation, { isLoading: isQuoting }] = useCalculateQuoteMutation();
  const [createBookingMutation] = useCreateMachineryBookingMutation();

  // Trigger quotation calculation whenever key inputs change
  useEffect(() => {
    if (!item || !plotSizeValue || plotSizeValue <= 0 || !startDate || !endDate || !plotDistrict || !plotUpazila) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await calculateQuoteMutation({
          machineryId: item.id,
          plotSizeValue,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          plotDistrict,
          plotUpazila,
          plotUnion,
          plotVillage,
          fuelOption,
          operatorOption,
        }).unwrap();

        setQuote(res);
      } catch (err: any) {
        console.error('Quotation error:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    item,
    plotSizeValue,
    startDate,
    endDate,
    plotDistrict,
    plotUpazila,
    plotUnion,
    plotVillage,
    fuelOption,
    operatorOption,
    calculateQuoteMutation,
  ]);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    if (!renterName.trim() || !renterPhone.trim() || !plotAddress.trim()) {
      setErrorMessage(
        isBn
          ? 'অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর এবং জমির সঠিক ঠিকানা প্রদান করুন।'
          : 'Please provide your full name, phone number, and plot field address.',
      );
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await createBookingMutation({
        machineryId: item.id,
        plotSizeValue,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        plotDistrict,
        plotUpazila,
        plotUnion,
        plotVillage,
        plotAddress,
        fuelOption,
        operatorOption,
        renterName: renterName.trim(),
        renterPhone: renterPhone.trim(),
        notes: notes.trim(),
      }).unwrap();

      setConfirmedBookingRef(res.bookingReference);
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message ||
          (isBn ? 'বুকিং সম্পন্ন করা সম্ভব হয়নি। পুনরায় চেষ্টা করুন।' : 'Failed to confirm booking. Please try again.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isItemLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">
            {isBn ? 'যন্ত্রপাতির তথ্য লোড হচ্ছে...' : 'Loading equipment details...'}
          </p>
        </div>
      </div>
    );
  }

  if (itemError || !item) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
            {isBn ? 'যন্ত্রপাতি পাওয়া যায়নি' : 'Equipment Not Found'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {isBn ? 'অনুরোধকৃত কৃষি যন্ত্রপাতির তথ্য ডাটাবেজে নেই।' : 'The requested equipment listing could not be found.'}
          </p>
          <Link
            href={`/${lang}/machinery`}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
          >
            {isBn ? 'যন্ত্রপাতির তালিকায় ফিরুন' : 'Back to Machinery Hub'}
          </Link>
        </div>
      </div>
    );
  }

  // Booking Confirmation Success View
  if (confirmedBookingRef) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-emerald-500/30 shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50 dark:ring-emerald-900/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
            {isBn ? 'বুকিং নিশ্চিত হয়েছে (এসক্রো সংরক্ষিত)' : 'Booking Confirmed (Escrow Secured)'}
          </span>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-3 mb-2">
            {isBn ? 'যন্ত্রপাতি বুকিং সফল হয়েছে!' : 'Equipment Booking Confirmed!'}
          </h2>

          <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">{isBn ? 'বুকিং রেফারেন্স' : 'Booking Ref'}</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {confirmedBookingRef}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">{isBn ? 'যন্ত্রপাতি' : 'Equipment'}</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                {isBn ? item.titleBn : item.titleEn}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">{isBn ? 'জমির পরিমাপ' : 'Plot / Hours'}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                {plotSizeValue} {item.pricingBasis === 'PER_BIGHA' ? (isBn ? 'বিঘা' : 'Bighas') : (isBn ? 'ঘণ্টা' : 'Hours')}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{isBn ? 'মোট পরিশোধযোগ্য' : 'Total Hold'}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                ৳{quote?.grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            {isBn
              ? 'মেশিন মালিক আপনার নির্ধারিত তারিখে যন্ত্রপাতি ও চালক নিয়ে উপস্থিত হবেন। কাজ সম্পন্ন হওয়ার পর ডিজিটাল চেকলিস্ট যাচাইয়ের মাধ্যমে নিরাপত্তা জামানত তাৎক্ষণিক রিফান্ড হবে।'
              : 'The equipment owner has received your schedule. Upon job completion and damage clearance inspection, your security deposit will be automatically released.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/${lang}/customer/machinery-bookings`}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition"
            >
              {isBn ? 'আমার বুকিং সমূহে যান' : 'View My Bookings'}
            </Link>
            <Link
              href={`/${lang}/machinery`}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition"
            >
              {isBn ? 'মার্কেটপ্লেসে ফিরুন' : 'Back to Machinery'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <Link
          href={`/${lang}/machinery`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {isBn ? 'কৃষি যন্ত্রপাতি তালিকায় ফিরুন' : 'Back to Equipment Listings'}
        </Link>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form & Schedule */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Tractor className="w-4 h-4" />
              {isBn ? 'জমির পরিমাপ ও বুকিং শিডিউল' : 'Plot Dimension & Dispatch Schedule'}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-6">
              {isBn ? item.titleBn : item.titleEn}
            </h1>

            <form onSubmit={handleSubmitBooking} className="space-y-6">
              {/* Plot Size Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {item.pricingBasis === 'PER_BIGHA'
                    ? isBn
                      ? 'জমির পরিমাপ (বিঘা)'
                      : 'Plot Dimension (Bighas - 1 Bigha ≈ 33 Decimals)'
                    : item.pricingBasis === 'PER_HOUR'
                    ? isBn
                      ? 'প্রয়োজনীয় সময় (ঘণ্টা)'
                      : 'Required Operating Duration (Hours)'
                    : isBn
                      ? 'প্রয়োজনীয় সময় (দিন)'
                      : 'Required Operating Duration (Days)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={plotSizeValue}
                    onChange={(e) => setPlotSizeValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 uppercase">
                    {item.pricingBasis.replace('PER_', '')}
                  </span>
                </div>
              </div>

              {/* Date Schedule Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {isBn ? 'শুরুর তারিখ' : 'Dispatch Start Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {isBn ? 'সমাপ্তির তারিখ' : 'Target Completion Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Fuel and Operator Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    {isBn ? 'জ্বালানি ব্যবস্থা' : 'Fuel Provision'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFuelOption('FUEL_INCLUDED')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                        fuelOption === 'FUEL_INCLUDED'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isBn ? 'জ্বালানি সহ' : 'Fuel Included'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFuelOption('FUEL_EXCLUDED')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                        fuelOption === 'FUEL_EXCLUDED'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isBn ? 'নিজস্ব জ্বালানি' : 'Fuel Excluded'}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    {isBn ? 'চালক/অপারেটর' : 'Operator Option'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOperatorOption('OPERATOR_INCLUDED')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                        operatorOption === 'OPERATOR_INCLUDED'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isBn ? 'চালক সহ' : 'Operator Inc.'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOperatorOption('SELF_OPERATED')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                        operatorOption === 'SELF_OPERATED'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isBn ? 'নিজস্ব চালক' : 'Self Operated'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Plot Location Coordinates */}
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-3">
                  {isBn ? 'জমির অবস্থান ও ঠিকানা' : 'Plot Geographic Location'}
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">{isBn ? 'জেলা' : 'District'}</label>
                    <input
                      type="text"
                      required
                      value={plotDistrict}
                      onChange={(e) => setPlotDistrict(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">{isBn ? 'উপজেলা' : 'Upazila'}</label>
                    <input
                      type="text"
                      required
                      value={plotUpazila}
                      onChange={(e) => setPlotUpazila(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">{isBn ? 'ইউনিয়ন' : 'Union'}</label>
                    <input
                      type="text"
                      value={plotUnion}
                      onChange={(e) => setPlotUnion(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">{isBn ? 'গ্রাম' : 'Village'}</label>
                    <input
                      type="text"
                      value={plotVillage}
                      onChange={(e) => setPlotVillage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">
                    {isBn ? 'জমির বিস্তারিত ঠিকানা / দাগ নম্বর / ল্যান্ডমার্ক' : 'Field Address / Plot Dag No. / Landmark'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isBn ? 'যেমন: উত্তর পাড়া মাঠ, দাগ নং ১২৮' : 'e.g. North Para Field, Plot Dag No. 128'}
                    value={plotAddress}
                    onChange={(e) => setPlotAddress(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              {/* Renter Contact */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-3">
                  {isBn ? 'কৃষক / ভাড়া গ্রহীতার তথ্য' : 'Farmer Contact Details'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">{isBn ? 'আপনার পূর্ণ নাম' : 'Full Name'}</label>
                    <input
                      type="text"
                      required
                      value={renterName}
                      onChange={(e) => setRenterName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">{isBn ? 'মোবাইল নম্বর' : 'Mobile Number'}</label>
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={renterPhone}
                      onChange={(e) => setRenterPhone(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">{isBn ? 'বিশেষ নির্দেশনা (যদি থাকে)' : 'Special Dispatch Instructions'}</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                    placeholder={isBn ? 'জমির কাদামাটির অবস্থা বা প্রবেশপথ...' : 'Soil condition, mud depth, or bridge accessibility...'}
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || !quote}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-base shadow-lg shadow-emerald-600/20 transition active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isBn ? 'বুকিং সম্পন্ন হচ্ছে...' : 'Processing Escrow Booking...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>
                      {isBn
                        ? `৳${quote ? quote.grandTotal.toLocaleString() : '---'} এসক্রো বুকিং নিশ্চিত করুন`
                        : `Confirm & Hold ৳${quote ? quote.grandTotal.toLocaleString() : '---'} in Escrow`}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Live Quotation & Cluster Card */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Quotation Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {isBn ? 'লাইভ ভাড়ার কোটেশন' : 'Real-time Rental Quote'}
                </h3>
                {isQuoting && (
                  <span className="text-[11px] text-emerald-600 font-medium animate-pulse">
                    {isBn ? 'হিসাব হচ্ছে...' : 'Recalculating...'}
                  </span>
                )}
              </div>

              {quote ? (
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>
                      {isBn ? 'মূল ভাড়ার হার' : 'Base Rate'} (৳{quote.baseRate} × {quote.plotSizeValue})
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      ৳{quote.totalRentalFee.toLocaleString()}
                    </span>
                  </div>

                  {quote.fuelSurcharge > 0 && (
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>{isBn ? 'জ্বালানি সম্পূরক চার্জ' : 'Supplemental Fuel Fee'}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-200">
                        +৳{quote.fuelSurcharge.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {quote.operatorFee > 0 && (
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>{isBn ? 'দক্ষ চালক ভাতা' : 'Certified Operator Fee'}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-200">
                        +৳{quote.operatorFee.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Neighbor Cluster Pooling Discount */}
                  {quote.isClusterDiscountApplied && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80">
                      <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 font-bold mb-1">
                        <span className="flex items-center gap-1.5">
                          <TrendingDown className="w-4 h-4 text-amber-600" />
                          {isBn ? 'প্রতিবেশী জমি সমবায় ছাড়' : 'Neighbor Cluster Discount'}
                        </span>
                        <span>-৳{quote.clusterDiscountAmount.toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-amber-700/90 dark:text-amber-400">
                        {isBn
                          ? 'আপনার ইউনিয়ন ও তারিখে প্রতিবেশী প্লট বুকিং একত্রিত হওয়ায় পরিবহন জ্বালানি সাশ্রয় হচ্ছে।'
                          : 'Neighboring plots in your union are grouped within the dispatch route, saving machinery transport costs.'}
                      </p>
                    </div>
                  )}

                  {quote.securityDeposit > 0 && (
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                        {isBn ? 'নিরাপত্তা জামানত (ফেরতযোগ্য)' : 'Refundable Damage Deposit'}
                      </span>
                      <span className="font-semibold text-teal-700 dark:text-teal-400">
                        ৳{quote.securityDeposit.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Grand Total */}
                  <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800 flex items-baseline justify-between">
                    <div>
                      <span className="text-sm font-black text-slate-900 dark:text-white block">
                        {isBn ? 'সর্বমোট এসক্রো জামানত' : 'Grand Total (Escrow Hold)'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {isBn ? 'কাজ শেষে জামানত ফেরত' : 'Deposit returned post-inspection'}
                      </span>
                    </div>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      ৳{quote.grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">
                  {isBn ? 'জমির পরিমাপ ও ঠিকানা প্রদান করুন...' : 'Enter plot size and location to view quote...'}
                </p>
              )}
            </div>

            {/* Escrow Guarantee Policy Note */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl p-6 border border-emerald-200 dark:border-emerald-800/60">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {isBn ? 'গ্রামের বাজার সমবায় গ্যারান্টি' : 'Gramer Bazar Escrow Guarantee'}
              </div>
              <ul className="text-xs text-emerald-900/80 dark:text-emerald-300/80 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    {isBn
                      ? 'টাকা নিরাপদ এসক্রোতে জমা থাকে; কাজ সন্তোষজনকভাবে সম্পন্ন না হওয়া পর্যন্ত মালিকের কাছে ছাড় করা হয় না।'
                      : 'Funds remain locked in neutral escrow until work is physically verified on your plot.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    {isBn
                      ? 'মেশিন নষ্ট বা ব্রেকডাউনের কারণে কাজ ব্যাহত হলে অবশিষ্টাংশ তাৎক্ষণিক ফেরত দেওয়া হবে।'
                      : 'In case of machinery breakdown or bad weather, unworked hours are immediately refunded.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    {isBn
                      ? 'ডিজিটাল চেকলিস্ট দ্বারা কাজ শুরু ও শেষের সময় মিটার রিডিং যাচাই করা হয়।'
                      : 'Digital hour-meter and fuel level readings protect both farmer and machine owner.'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
