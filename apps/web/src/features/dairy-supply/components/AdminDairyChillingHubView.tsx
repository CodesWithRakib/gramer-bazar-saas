'use client';

import React, { useState } from 'react';
import {
  Droplets,
  Thermometer,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Wallet,
  Activity,
  Layers,
  Scale,
  Send,
  Building2,
  Clock,
} from 'lucide-react';
import {
  useGetChillingVatsQuery,
  useGetAllAdminCollectionsQuery,
  useGetFeedPoolsQuery,
  useCreateMilkCollectionEntryMutation,
  useDisburseMilkPaymentMutation,
  useRecordChillingTelemetryMutation,
  useCreateFeedPoolMutation,
  MilkType,
  MilkShift,
  FeedCategory,
  ChillingVatStatus,
} from '../dairySupplyApi';

interface AdminDairyChillingHubViewProps {
  lang: string;
}

export const AdminDairyChillingHubView: React.FC<AdminDairyChillingHubViewProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  // API Queries
  const { data: vatsData, refetch: refetchVats } = useGetChillingVatsQuery();
  const { data: collectionsData, refetch: refetchCollections } = useGetAllAdminCollectionsQuery();
  const { data: feedPoolsData, refetch: refetchPools } = useGetFeedPoolsQuery();

  // Mutations
  const [createCollection, { isLoading: isCreatingCollection }] = useCreateMilkCollectionEntryMutation();
  const [disbursePayment, { isLoading: isDisbursing }] = useDisburseMilkPaymentMutation();
  const [recordTelemetry, { isLoading: isRecordingTelemetry }] = useRecordChillingTelemetryMutation();
  const [createFeedPool, { isLoading: isCreatingPool }] = useCreateFeedPoolMutation();

  // Intake Form State
  const [farmerName, setFarmerName] = useState('রহিম বিশ্বাস');
  const [farmerPhone, setFarmerPhone] = useState('01712345678');
  const [centerId, setCenterId] = useState('baghabari-hub-01');
  const [centerName, setCenterName] = useState('বাঘাবাড়ি মিল্ক চিলিং প্ল্যান্ট');
  const [milkType, setMilkType] = useState<MilkType>('COW_MILK');
  const [collectionShift, setCollectionShift] = useState<MilkShift>('MORNING_SHIFT');
  const [volumeLiters, setVolumeLiters] = useState(25);
  const [clr, setClr] = useState(29.5);
  const [fat, setFat] = useState(4.2);
  const [intakeSuccess, setIntakeSuccess] = useState<string | null>(null);

  // Telemetry Modal/State
  const [selectedVatCode, setSelectedVatCode] = useState('BMC-BAG-01');
  const [telemetryTemp, setTelemetryTemp] = useState(4.0);
  const [telemetryVol, setTelemetryVol] = useState(4200);
  const [telemetryAgitator, setTelemetryAgitator] = useState(32);
  const [telemetryStatus, setTelemetryStatus] = useState<ChillingVatStatus>('OPTIMAL_CHILLED_4C');
  const [telemetrySuccess, setTelemetrySuccess] = useState<string | null>(null);

  // New Feed Pool Form State
  const [feedCategory, setFeedCategory] = useState<FeedCategory>('MUSTARD_OIL_CAKE');
  const [feedBrand, setFeedBrand] = useState('স্কয়ার এগ্রো মাস্টার্ড অয়েল মিল');
  const [targetKg, setTargetKg] = useState(5000);
  const [discountedPrice, setDiscountedPrice] = useState(48.0);
  const [retailPrice, setRetailPrice] = useState(65.0);
  const [deliveryHub, setDeliveryHub] = useState('শাহজাদপুর বাঘাবাড়ি ফিড ডিপো');
  const [poolClosingDate, setPoolClosingDate] = useState('2026-11-15');
  const [poolSuccess, setPoolSuccess] = useState<string | null>(null);

  const vats = vatsData?.data || [];
  const collections = collectionsData?.data || [];
  const feedPools = feedPoolsData?.data || [];

  // Handlers
  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createCollection({
        farmerName,
        farmerPhone,
        cooperativeCenterId: centerId,
        cooperativeName: centerName,
        milkType,
        collectionShift,
        volumeLiters: Number(volumeLiters),
        lactometerReadingCorrected: Number(clr),
        fatPercentage: Number(fat),
        collectionDate: new Date().toISOString().split('T')[0],
      }).unwrap();

      if (res.success) {
        setIntakeSuccess(
          isBn
            ? `দুধ সংগ্রহ সফল! ভাউচার নং: ${res.data.collectionVoucherNo} (৳${res.data.totalPayoutAmountBdt})`
            : `Intake recorded! Voucher #${res.data.collectionVoucherNo} (৳${res.data.totalPayoutAmountBdt})`
        );
        refetchCollections();
        setTimeout(() => setIntakeSuccess(null), 5000);
      }
    } catch {
      // Error handled
    }
  };

  const handleDisburse = async (id: string) => {
    try {
      const res = await disbursePayment(id).unwrap();
      if (res.success) {
        refetchCollections();
      }
    } catch {
      // Error handled
    }
  };

  const handleTelemetrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await recordTelemetry({
        vatCode: selectedVatCode,
        currentVolumeLiters: Number(telemetryVol),
        currentTemperatureCelsius: Number(telemetryTemp),
        agitatorRpm: Number(telemetryAgitator),
        vatStatus: telemetryStatus,
      }).unwrap();

      if (res.success) {
        setTelemetrySuccess(
          isBn
            ? `ভ্যাট ${selectedVatCode} এর আইওটি রিডিং সফলভাবে আপডেট হয়েছে!`
            : `IoT Telemetry for ${selectedVatCode} successfully updated!`
        );
        refetchVats();
        setTimeout(() => setTelemetrySuccess(null), 4000);
      }
    } catch {
      // Error handled
    }
  };

  const handleCreatePoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createFeedPool({
        feedCategory,
        feedBrandOrMillName: feedBrand,
        targetVolumeKg: Number(targetKg),
        discountedPricePerKgBdt: Number(discountedPrice),
        retailMarketPricePerKgBdt: Number(retailPrice),
        deliveryHubLocation: deliveryHub,
        poolClosingDate,
      }).unwrap();

      if (res.success) {
        setPoolSuccess(
          isBn
            ? `নতুন পশুখাদ্য সমবায় পুল ${res.data.poolCode} সফলভাবে তৈরি হয়েছে!`
            : `Feed pool #${res.data.poolCode} created successfully!`
        );
        refetchPools();
        setTimeout(() => setPoolSuccess(null), 4000);
      }
    } catch {
      // Error handled
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 text-xs font-semibold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>{isBn ? 'সমবায় অ্যাডমিন ও চিলিং সেন্টার' : 'Dairy Cooperative & IoT Hub'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {isBn
                ? 'দুধ সংগ্রহ ডেস্ক, আইওটি ভ্যাট নিয়ন্ত্রণ ও বাল্ক ফিড পুল'
                : 'Milk Intake Desk, Chilling Vat IoT & Feed Pooling'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
              {isBn
                ? 'খামারিদের কাছ থেকে দুধ গ্রহণ, ডিজিটাল ফ্যাট/এসএনএফ ক্যালকুলেশন, বাল্ক মিল্ক কুলার নজরদারি ও এমএফএস পে-আউট।'
                : 'Process daily farmer intake, manage 4.0°C BMC IoT telemetry, and disburse wallet payouts.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                refetchVats();
                refetchCollections();
                refetchPools();
              }}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
              title="Refresh all data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section 1: Milk Intake Desk & IoT Vat Telemetry Recorder */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left (7 cols): Milk Intake Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isBn ? 'দুধ সংগ্রহ চালান নথিভুক্ত করুন' : 'Record Milk Collection Intake'}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {isBn
                    ? 'ল্যাকটোমিটার রিডিং ও ফ্যাট দিলে স্বয়ংক্রিয়ভাবে এসএনএফ ও দর হিসাব হবে'
                    : 'Auto-calculates SNF% and fair price based on Richmonds formula'}
                </p>
              </div>
            </div>

            {intakeSuccess && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{intakeSuccess}</span>
              </div>
            )}

            <form onSubmit={handleIntakeSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'খামারির নাম' : 'Farmer Name'}
                  </label>
                  <input
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'মোবাইল নম্বর (বিকাশ/নগদ)' : 'Farmer Phone (MFS)'}
                  </label>
                  <input
                    type="tel"
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'চিলিং সেন্টার' : 'Chilling Center'}
                  </label>
                  <select
                    value={centerId}
                    onChange={(e) => {
                      setCenterId(e.target.value);
                      const opt = e.target.options[e.target.selectedIndex];
                      setCenterName(opt.text);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="baghabari-hub-01">বাঘাবাড়ি মিল্ক চিলিং প্ল্যান্ট</option>
                    <option value="bera-hub-02">বেড়া দুগ্ধ সমবায় পয়েন্ট</option>
                    <option value="gurudaspur-hub-03">গুরুদাসপুর চিলিং সেন্টার</option>
                    <option value="tala-hub-04">তালা মহিষের দুধ সংগ্রহ হাব</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      {isBn ? 'দুধের ধরন' : 'Milk Type'}
                    </label>
                    <select
                      value={milkType}
                      onChange={(e) => setMilkType(e.target.value as MilkType)}
                      className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="COW_MILK">গাভীর দুধ</option>
                      <option value="BUFFALO_MILK">মহিষের দুধ</option>
                      <option value="GOAT_MILK">ছাগলের দুধ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      {isBn ? 'শিফট' : 'Shift'}
                    </label>
                    <select
                      value={collectionShift}
                      onChange={(e) => setCollectionShift(e.target.value as MilkShift)}
                      className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="MORNING_SHIFT">সকাল (Morning)</option>
                      <option value="EVENING_SHIFT">সন্ধ্যা (Evening)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'পরিমাণ (L)' : 'Volume (L)'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={volumeLiters}
                    onChange={(e) => setVolumeLiters(parseFloat(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'CLR রিডিং' : 'CLR (20°C)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="36"
                    value={clr}
                    onChange={(e) => setClr(parseFloat(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'ফ্যাট %' : 'Fat %'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="2"
                    max="12"
                    value={fat}
                    onChange={(e) => setFat(parseFloat(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreatingCollection}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isCreatingCollection ? (
                  <span>{isBn ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...'}</span>
                ) : (
                  <>
                    <Droplets className="w-4 h-4" />
                    <span>{isBn ? 'চালান ইস্যু করুন' : 'Issue Milk Intake Voucher'}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right (5 cols): Ingest Chilling Vat IoT Sensor Telemetry */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300">
                <Thermometer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isBn ? 'আইওটি সেন্সর রিডিং সিমুলেটর' : 'IoT Vat Telemetry Ingest'}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {isBn ? 'তাপমাত্রা > ৭°C হলে স্বয়ংক্রিয় অ্যালার্ম সক্রিয় হবে' : 'Triggers critical alarm if T > 7.0°C'}
                </p>
              </div>
            </div>

            {telemetrySuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{telemetrySuccess}</span>
              </div>
            )}

            <form onSubmit={handleTelemetrySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'চিলিং ভ্যাট নির্বাচন' : 'Select Chilling Vat'}
                </label>
                <select
                  value={selectedVatCode}
                  onChange={(e) => setSelectedVatCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                >
                  {vats.map((v) => (
                    <option key={v.id} value={v.vatCode}>
                      {v.vatCode} ({v.chillingCenterName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'তাপমাত্রা (°C)' : 'Temperature (°C)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={telemetryTemp}
                    onChange={(e) => setTelemetryTemp(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    required
                  />
                  <p className="text-[10px] text-slate-700 dark:text-slate-300 mt-1 font-medium">
                    {isBn ? 'আদর্শ: ৪.০°C | বিপদসীমা: > ৭.০°C' : 'Optimal: 4.0°C | Alarm: > 7.0°C'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'বর্তমান ভলিউম (L)' : 'Current Volume (L)'}
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={telemetryVol}
                    onChange={(e) => setTelemetryVol(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'এজিটেটর RPM' : 'Agitator RPM'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={telemetryAgitator}
                    onChange={(e) => setTelemetryAgitator(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'স্ট্যাটাস' : 'Vat Status'}
                  </label>
                  <select
                    value={telemetryStatus}
                    onChange={(e) => setTelemetryStatus(e.target.value as ChillingVatStatus)}
                    className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="OPTIMAL_CHILLED_4C">আদর্শ ৪°C চিল্ড</option>
                    <option value="COOLING_IN_PROGRESS">কুলিং চলমান</option>
                    <option value="TEMPERATURE_ALARM_HIGH">উচ্চ তাপমাত্রা এলার্ম</option>
                    <option value="EMPTY_CLEANING_CIP">সিআইপি ওয়াশিং</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isRecordingTelemetry}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isRecordingTelemetry ? (
                  <span>{isBn ? 'আপডেট হচ্ছে...' : 'Updating...'}</span>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    <span>{isBn ? 'সেন্সর রিডিং পাঠান' : 'Push Telemetry Data'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Section 2: Nationwide Milk Intake Entries & One-Click Payout Disbursal */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {isBn ? 'দুগ্ধ সংগ্রহ খতিয়ান ও এমএফএস পে-আউট প্রদান' : 'Milk Collections & Wallet Settlement'}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {isBn
                    ? 'ন্যায্য দর নিশ্চিত করে এক ক্লিকে খামারির ওয়ালেটে সরাসরি টাকা পাঠান'
                    : 'Disburse instant mobile financial service payouts to registered dairy farmers'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {collections.length} {isBn ? 'টি এন্ট্রি' : 'Entries'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">{isBn ? 'ভাউচার নং' : 'Voucher'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'খামারির তথ্য' : 'Farmer & Phone'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'চিলিং সেন্টার' : 'Center'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'পরিমাণ (L)' : 'Volume'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'ফ্যাট / SNF %' : 'Fat / SNF %'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'দর / মোট পাওনা' : 'Rate & Total'}</th>
                  <th className="py-3.5 px-4 text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {collections.map((entry) => {
                  const isPaid = entry.paymentStatus === 'DISBURSED_MFS_WALLET';

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {entry.collectionVoucherNo}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {entry.farmerName}
                        </span>
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {entry.farmerPhone}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {entry.cooperativeName}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {entry.volumeLiters} L
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {entry.fatPercentage}%
                        </span>{' '}
                        / {entry.snfPercentage}%
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-xs text-slate-700 dark:text-slate-300 block font-medium">
                          ৳{entry.ratePerLiterBdt}/L
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ৳{entry.totalPayoutAmountBdt}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isBn ? 'পরিশোধিত' : 'Disbursed'}</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDisburse(entry.id)}
                            disabled={isDisbursing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isBn ? 'পে-আউট প্রদান' : 'Disburse MFS'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Launch New Livestock Feed Group Buy Pool */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isBn ? 'নতুন পশুখাদ্য সমবায় বাল্ক ক্রয় পুল খুলুন' : 'Launch Livestock Feed Bulk Pool'}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {isBn
                  ? 'খামারিদের যুক্ত করে মিল-গেট ডিসকাউন্টে সরাসরি খাদ্য সংগ্রহের সুযোগ তৈরি করুন'
                  : 'Aggregate dairy farmers for direct mill-gate bulk purchase at wholesale discount'}
              </p>
            </div>
          </div>

          {poolSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{poolSuccess}</span>
            </div>
          )}

          <form onSubmit={handleCreatePoolSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'খাদ্যের প্রকার' : 'Feed Category'}
                </label>
                <select
                  value={feedCategory}
                  onChange={(e) => setFeedCategory(e.target.value as FeedCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="MUSTARD_OIL_CAKE">সরিষার খৈল (Mustard Oil Cake)</option>
                  <option value="WHEAT_BRAN_COARSE">মোটা গমের ভুষি (Wheat Bran)</option>
                  <option value="CORN_SILAGE_FERMENTED">ফার্মেন্টেড সাইলেজ (Corn Silage)</option>
                  <option value="PELLETTED_DAIRY_FEED">প্যালেট ডেইরি ফিড (Pelleted Feed)</option>
                  <option value="CALCIUM_MINERAL_PREMIX">ক্যালসিয়াম ও মিনারেল প্রিমিক্স</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'মিল বা ব্র্যান্ডের নাম' : 'Brand or Feed Mill Name'}
                </label>
                <input
                  type="text"
                  value={feedBrand}
                  onChange={(e) => setFeedBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'টার্গেট ভলিউম (কেজি)' : 'Target Volume (kg)'}
                </label>
                <input
                  type="number"
                  step="500"
                  min="500"
                  value={targetKg}
                  onChange={(e) => setTargetKg(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'বাল্ক ডিসকাউন্ট দর (৳/কেজি)' : 'Bulk Discount Price (৳/kg)'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(parseFloat(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'খুচরা বাজার দর (৳/কেজি)' : 'Retail Market Price (৳/kg)'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={retailPrice}
                  onChange={(e) => setRetailPrice(parseFloat(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'ডেলিভারি হাব' : 'Delivery Hub'}
                </label>
                <input
                  type="text"
                  value={deliveryHub}
                  onChange={(e) => setDeliveryHub(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'পুল সমাপন তারিখ' : 'Closing Date'}
                </label>
                <input
                  type="date"
                  value={poolClosingDate}
                  onChange={(e) => setPoolClosingDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreatingPool}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isCreatingPool ? (
                <span>{isBn ? 'তৈরি করা হচ্ছে...' : 'Launching...'}</span>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  <span>{isBn ? 'ফিড গ্রুপ-বাই পুল প্রকাশ করুন' : 'Launch Feed Group-Buy Campaign'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
