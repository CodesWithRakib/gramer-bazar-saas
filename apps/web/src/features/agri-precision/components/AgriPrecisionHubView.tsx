'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  ScanLine,
  Plane,
  FlaskConical,
  Sprout,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Info,
  Scale,
} from 'lucide-react';
import {
  useLazyVerifyAgriInputQuery,
  useReportCounterfeitInputMutation,
  useGetDroneUnitsQuery,
  useBookDroneSprayingMutation,
  useGenerateSoilHealthCardMutation,
  useGetPrecisionStatsQuery,
  InputVerificationStatus,
  DroneServiceType,
  SoilTextureType,
  CropTargetNutrient,
  InputVerificationResult,
  SoilHealthCardRecord,
} from '../agriPrecisionApi';

export function AgriPrecisionHubView({ lang = 'en' }: { lang?: string }) {
  const isBn = lang === 'bn';

  const [activeTab, setActiveTab] = useState<'VERIFY' | 'DRONES' | 'SOIL'>('VERIFY');

  // Stats Query
  const { data: stats } = useGetPrecisionStatsQuery();

  // --- Tab 1: Anti-Counterfeit Verification State ---
  const [codeInput, setCodeInput] = useState('CHEM-SYN-VIRTAKO-40WG');
  const [verifyTrigger, { data: verifyResult, isFetching: isVerifying }] =
    useLazyVerifyAgriInputQuery();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportShopName, setReportShopName] = useState('');
  const [reportDistrict, setReportDistrict] = useState('Bogura');
  const [reportUpazila, setReportUpazila] = useState('Shibganj');
  const [reportAddress, setReportAddress] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [reportSubmittedTicket, setReportSubmittedTicket] = useState<string | null>(null);

  const [submitReport, { isLoading: isSubmittingReport }] = useReportCounterfeitInputMutation();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim()) return;
    verifyTrigger(codeInput.trim());
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await submitReport({
        suspectedItemBarcode: codeInput.trim(),
        brandName: verifyResult?.item?.brandName || 'Suspected Fake Chemical',
        reporterName: reporterName || 'Anonymous Farmer',
        reporterPhone: reporterPhone || '01700000000',
        retailShopName: reportShopName,
        retailShopDistrict: reportDistrict,
        retailShopUpazila: reportUpazila,
        retailShopAddress: reportAddress,
        suspectedDefectDescription: reportDescription,
      }).unwrap();

      setReportSubmittedTicket(res.reportTicketNo);
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to submit counterfeit report');
    }
  };

  // --- Tab 2: Drone Spraying State ---
  const { data: droneData, isLoading: loadingDrones } = useGetDroneUnitsQuery();
  const droneUnits = droneData?.items || [];
  const [selectedDroneUnit, setSelectedDroneUnit] = useState<any | null>(null);
  const [droneServiceType, setDroneServiceType] =
    useState<DroneServiceType>('FUNGICIDE_BLIGHT_SPRAY');
  const [droneTargetCrop, setDroneTargetCrop] = useState('Potato (আলু)');
  const [droneInfestation, setDroneInfestation] = useState(
    'Late Blight Prevention (Mancozeb 75% WP)'
  );
  const [droneFarmerName, setDroneFarmerName] = useState('');
  const [droneFarmerPhone, setDroneFarmerPhone] = useState('');
  const [dronePlotAddress, setDronePlotAddress] = useState('');
  const [dronePlotDistrict, setDronePlotDistrict] = useState('Bogura');
  const [dronePlotUpazila, setDronePlotUpazila] = useState('Shibganj');
  const [droneLandAreaBighas, setDroneLandAreaBighas] = useState(3.0);
  const [droneDate, setDroneDate] = useState('2026-11-20');
  const [droneTimeSlot, setDroneTimeSlot] = useState('06:30 AM - 08:30 AM (Cool Morning)');
  const [droneConfirmedBooking, setDroneConfirmedBooking] = useState<string | null>(null);

  const [bookDrone, { isLoading: isBookingDrone }] = useBookDroneSprayingMutation();

  const handleDroneBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDroneUnit) return;
    try {
      const res = await bookDrone({
        droneUnitId: selectedDroneUnit.id,
        serviceType: droneServiceType,
        targetCrop: droneTargetCrop,
        targetInfestationOrFormula: droneInfestation,
        farmerName: droneFarmerName,
        farmerPhone: droneFarmerPhone,
        plotAddress: dronePlotAddress,
        plotDistrict: dronePlotDistrict,
        plotUpazila: dronePlotUpazila,
        landAreaBighas: Number(droneLandAreaBighas),
        scheduledDate: droneDate,
        scheduledTimeSlot: droneTimeSlot,
      }).unwrap();

      setDroneConfirmedBooking(res.bookingNumber);
      setSelectedDroneUnit(null);
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to book drone');
    }
  };

  // --- Tab 3: Soil Health Card State ---
  const [soilTargetCrop, setSoilTargetCrop] = useState<CropTargetNutrient>('POTATO');
  const [soilTexture, setSoilTexture] = useState<SoilTextureType>('CLAY_LOAM');
  const [soilAreaBighas, setSoilAreaBighas] = useState(1.0);
  const [soilPh, setSoilPh] = useState(5.4);
  const [soilN, setSoilN] = useState(125);
  const [soilP, setSoilP] = useState(9.2);
  const [soilK, setSoilK] = useState(0.14);
  const [soilOm, setSoilOm] = useState(1.2);
  const [soilZn, setSoilZn] = useState(0.8);
  const [soilFarmerName, setSoilFarmerName] = useState('Md. Zahidul Islam');
  const [soilFarmerPhone, setSoilFarmerPhone] = useState('01711223344');
  const [soilPlotAddress, setSoilPlotAddress] = useState('Village: Chandpur, Shibganj, Bogura');
  const [generatedCard, setGeneratedCard] = useState<SoilHealthCardRecord | null>(null);

  const [generateSoilCard, { isLoading: isGeneratingSoilCard }] =
    useGenerateSoilHealthCardMutation();

  const handleSoilCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await generateSoilCard({
        farmerName: soilFarmerName,
        farmerPhone: soilFarmerPhone,
        plotAddress: soilPlotAddress,
        plotDistrict: 'Bogura',
        plotUpazila: 'Shibganj',
        soilTexture,
        targetCrop: soilTargetCrop,
        landAreaBighas: Number(soilAreaBighas),
        phLevel: Number(soilPh),
        nitrogenKgPerHa: Number(soilN),
        phosphorusPpm: Number(soilP),
        potassiumMeqPer100g: Number(soilK),
        organicMatterPct: Number(soilOm),
        zincPpm: Number(soilZn),
      }).unwrap();

      setGeneratedCard(res);
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to generate soil health card');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white p-8 md:p-12 shadow-2xl border border-teal-700/30">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-4 border border-teal-400/30 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-teal-400" />
              {isBn
                ? 'স্মার্ট কৃষি প্রযুক্তি, রাসায়নিক সত্যতা ও মৃত্তিকা স্বাস্থ্য'
                : 'Smart Agri Precision, Input Authenticity & Soil Diagnostics'}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              {isBn
                ? 'ভেজাল সার ও কীটনাশক প্রতিরোধ, ড্রোন স্প্রে ও মৃত্তিকা পুষ্টি হাব'
                : 'Agri-Inputs Anti-Counterfeit Verification, Drone Spraying & Soil Health Hub'}
            </h1>
            <p className="text-base md:text-lg text-teal-100/90 mb-8 leading-relaxed">
              {isBn
                ? 'কিউআর কোড স্ক্যান করে অনুমোদিত সার ও কীটনাশকের আসল সত্যতা যাচাই করুন, মাত্র ১৮০ টাকা বিঘায় কৃষি ড্রোন স্প্রে বুকিং দিন এবং ডিজিটাল মৃত্তিকা স্বাস্থ্য কার্ডের মাধ্যমে সুষম সারের ডোজ জানুন।'
                : 'Scan chemical QR codes to prevent counterfeit fertilizers and fake seeds, book certified agricultural spraying drones (saving 90% water and 50% labor), and generate scientific SRDI soil nutrient dosage plans.'}
            </p>

            {/* Platform Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-teal-700/50">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
                <p className="text-xs text-teal-200">
                  {isBn ? 'যাচাইকৃত অনুমোদিত পণ্য' : 'Verified Products'}
                </p>
                <p className="text-xl md:text-2xl font-bold text-white mt-1">
                  {stats?.totalVerifiedInputs ?? 4}+
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
                <p className="text-xs text-teal-200">
                  {isBn ? 'নিবন্ধিত কৃষি ড্রোন বহর' : 'Active Drone Fleet'}
                </p>
                <p className="text-xl md:text-2xl font-bold text-white mt-1">
                  {stats?.totalDroneUnits ?? 3}
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
                <p className="text-xs text-teal-200">
                  {isBn ? 'ড্রোন স্প্রে করা জমি' : 'Acres Drone Sprayed'}
                </p>
                <p className="text-xl md:text-2xl font-bold text-emerald-400 mt-1">
                  {(stats?.totalAcresDroneSprayed ?? 535.5).toLocaleString()} {isBn ? 'একর' : 'Acres'}
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
                <p className="text-xs text-teal-200">
                  {isBn ? 'সাশ্রয়কৃত বিশুদ্ধ পানি' : 'Water Saved (Liters)'}
                </p>
                <p className="text-xl md:text-2xl font-bold text-cyan-300 mt-1">
                  {(stats?.totalWaterSavedLiters ?? 80300).toLocaleString()} L
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={() => setActiveTab('VERIFY')}
            className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeTab === 'VERIFY'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ScanLine className="w-4 h-4" />
            <span>{isBn ? '১. সার ও কীটনাশক সত্যতা যাচাই' : '1. Anti-Counterfeit Verification'}</span>
          </button>

          <button
            onClick={() => setActiveTab('DRONES')}
            className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeTab === 'DRONES'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>{isBn ? '২. কৃষি ড্রোন স্প্রে সেবা' : '2. Drone Spraying Fleet'}</span>
          </button>

          <button
            onClick={() => setActiveTab('SOIL')}
            className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeTab === 'SOIL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>{isBn ? '৩. ডিজিটাল মৃত্তিকা স্বাস্থ্য কার্ড' : '3. Soil Health & Nutrient Card'}</span>
          </button>
        </div>

        {/* TAB 1: ANTI-COUNTERFEIT VERIFICATION */}
        {activeTab === 'VERIFY' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="max-w-2xl mx-auto text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  {isBn
                    ? 'সরকারি ডিএই অনুমোদিত রাসায়নিক সত্যতা যাচাই'
                    : 'DAE Official Anti-Counterfeit Verification Registry'}
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  {isBn
                    ? 'কীটনাশক বোতল, সারের বস্তা বা বীজের প্যাকেটে থাকা বারকোড বা কিউআর কোড লিখে বা স্ক্যান করে প্রস্তুতকারক ও ব্যাচের আসল তথ্য নিশ্চিত করুন।'
                    : 'Verify genuine manufacturing records, active ingredient purity, expiry date, and official DAE license.'}
                </p>
              </div>

              {/* Barcode Search Form */}
              <form onSubmit={handleVerify} className="max-w-xl mx-auto mb-8">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ScanLine className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. CHEM-SYN-VIRTAKO-40WG, FERT-BCIC-UREA-01..."
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
                  >
                    {isVerifying ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>{isBn ? 'যাচাই করুন' : 'Verify'}</span>
                  </button>
                </div>
              </form>

              {/* Sample QR Codes quick select */}
              <div className="max-w-xl mx-auto flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 mb-8">
                <span>{isBn ? 'নমুনা কোড ক্লিক করুন:' : 'Sample Codes:'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setCodeInput('CHEM-SYN-VIRTAKO-40WG');
                    verifyTrigger('CHEM-SYN-VIRTAKO-40WG');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 font-mono"
                >
                  Virtako 40WG (Syngenta)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCodeInput('FERT-BCIC-UREA-01');
                    verifyTrigger('FERT-BCIC-UREA-01');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 font-mono"
                >
                  BCIC Granular Urea
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCodeInput('FAKE-BARCODE-999');
                    verifyTrigger('FAKE-BARCODE-999');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-mono"
                >
                  Fake/Counterfeit Test
                </button>
              </div>

              {/* Verification Result Card */}
              {verifyResult && (
                <div className="max-w-2xl mx-auto">
                  {verifyResult.isAuthentic ? (
                    <div className="bg-emerald-50/70 dark:bg-emerald-950/30 rounded-3xl p-6 md:p-8 border-2 border-emerald-500 shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                            DAE Certified Authentic
                          </span>
                          <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
                            {verifyResult.item?.brandName}
                          </h3>
                        </div>
                      </div>

                      <p className="text-xs text-emerald-900 dark:text-emerald-200 mb-6 font-medium">
                        {isBn ? verifyResult.messageBn : verifyResult.messageEn}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-xs mb-4">
                        <div>
                          <span className="text-slate-400">Manufacturer:</span>
                          <p className="font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                            {verifyResult.item?.manufacturerName}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400">DAE License #:</span>
                          <p className="font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                            {verifyResult.item?.daeRegistrationNo}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400">Standard Purity:</span>
                          <p className="font-bold text-emerald-600 mt-0.5">
                            {verifyResult.item?.standardPurityPct}%
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400">Batch Number:</span>
                          <p className="font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                            {verifyResult.item?.batchNumber}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400">Expiry Date:</span>
                          <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                            {verifyResult.item?.expiryDate}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400">Govt. MRP Cap:</span>
                          <p className="font-bold text-amber-500 mt-0.5">
                            ৳{verifyResult.item?.mrpPriceBdt}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                        <strong>Dosage & Safety Guide: </strong>
                        {verifyResult.item?.standardDosageGuide}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 dark:bg-red-950/40 rounded-3xl p-6 md:p-8 border-2 border-red-500 shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wide">
                            {verifyResult.status === 'EXPIRED' ? 'Expired Product' : 'Counterfeit Alert'}
                          </span>
                          <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
                            {verifyResult.status === 'EXPIRED'
                              ? 'মেয়াদোত্তীর্ণ রাসায়নিক (Expired)'
                              : 'অননুমোদিত বা ভেজাল রাসায়নিক সন্দেহ'}
                          </h3>
                        </div>
                      </div>

                      <p className="text-xs text-red-900 dark:text-red-200 mb-6 leading-relaxed">
                        {isBn ? verifyResult.messageBn : verifyResult.messageEn}
                      </p>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowReportModal(true)}
                          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 transition flex items-center gap-1.5"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>
                            {isBn
                              ? 'ডিএই ম্যাজিস্ট্রেটের কাছে ভেজাল রিপোর্ট করুন'
                              : 'Report Counterfeit to DAE Magistrate'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Counterfeit Report Modal */}
            {showReportModal && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-lg w-full border border-red-300 dark:border-red-900 shadow-2xl">
                  {reportSubmittedTicket ? (
                    <div className="text-center py-6">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {isBn ? 'অভিযোগ সফলভাবে জমা হয়েছে' : 'Counterfeit Complaint Lodged!'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 mb-4">
                        Complaint Ticket:{' '}
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {reportSubmittedTicket}
                        </span>
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                        {isBn
                          ? 'আপনার রিপোর্টটি কৃষি সম্প্রসারণ অধিদপ্তর (ডিএই) ভ্রাম্যমাণ আদালত মনিটরিং সেলে পাঠানো হয়েছে।'
                          : 'Forwarded to the Upazila Agriculture Officer and Mobile Court Inspection cell.'}
                      </p>
                      <button
                        onClick={() => {
                          setShowReportModal(false);
                          setReportSubmittedTicket(null);
                        }}
                        className="px-6 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-red-600" />
                        <span>{isBn ? 'ভেজাল বা নকল রাসায়নিক রিপোর্ট' : 'Report Counterfeit Pesticide/Seed'}</span>
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">
                        Provide retail store details where this suspicious item was purchased.
                      </p>

                      <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
                        <div>
                          <label className="block font-semibold mb-1">Retail Shop Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Hazi Agro Traders, Mokamtola"
                            value={reportShopName}
                            onChange={(e) => setReportShopName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold mb-1">District *</label>
                            <input
                              type="text"
                              required
                              value={reportDistrict}
                              onChange={(e) => setReportDistrict(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold mb-1">Upazila *</label>
                            <input
                              type="text"
                              required
                              value={reportUpazila}
                              onChange={(e) => setReportUpazila(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">Market / Bazar Address *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Mokamtola Bazar Road, Shop # 14"
                            value={reportAddress}
                            onChange={(e) => setReportAddress(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">Defect Symptoms *</label>
                          <textarea
                            rows={2}
                            required
                            placeholder="e.g. Abnormal white sediment, strange smell, no efficacy on target pests"
                            value={reportDescription}
                            onChange={(e) => setReportDescription(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold mb-1">Your Name</label>
                            <input
                              type="text"
                              placeholder="Md. Rahim"
                              value={reporterName}
                              onChange={(e) => setReporterName(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold mb-1">Your Phone</label>
                            <input
                              type="tel"
                              placeholder="017xxxxxxxx"
                              value={reporterPhone}
                              onChange={(e) => setReporterPhone(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => setShowReportModal(false)}
                            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmittingReport}
                            className="px-6 py-2 rounded-xl bg-red-600 text-white font-bold"
                          >
                            {isSubmittingReport ? 'Lodging Report...' : 'Submit to DAE'}
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AGRICULTURAL DRONE SPRAYING FLEET */}
        {activeTab === 'DRONES' && (
          <div className="space-y-6">
            {/* Booking confirmation banner */}
            {droneConfirmedBooking && (
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Drone Spraying Booking Confirmed!</strong> Booking #{droneConfirmedBooking}. Pilot will contact you prior to flight.
                  </span>
                </div>
                <button
                  onClick={() => setDroneConfirmedBooking(null)}
                  className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Drone Fleet Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loadingDrones ? (
                <div className="col-span-3 py-16 text-center">
                  <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Loading certified drone units...</p>
                </div>
              ) : (
                droneUnits.map((drone) => (
                  <div
                    key={drone.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          {drone.droneCode}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {drone.tankCapacityLiters}L Tank
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                        {drone.droneModel}
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">{drone.pilotName}</p>

                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1.5 text-xs mb-4">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Rate / Bigha:</span>
                          <span className="font-black text-teal-600 text-sm">
                            ৳{drone.serviceRatePerBigha}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Base Station:</span>
                          <span className="font-medium">{drone.baseDistrict}, {drone.baseUpazila}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Radius:</span>
                          <span className="font-medium">{drone.coverageRadiusKm} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Sprayed:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {drone.totalAcresSprayed} Acres
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedDroneUnit(drone)}
                      className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-1.5"
                    >
                      <Plane className="w-4 h-4" />
                      <span>{isBn ? 'ড্রোন স্প্রে শিডিউল বুক করুন' : 'Book Drone Spray'}</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Drone Booking Modal */}
            {selectedDroneUnit && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-lg w-full border border-teal-300 dark:border-teal-800 shadow-2xl max-h-[90vh] overflow-y-auto">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    Book Drone Spraying ({selectedDroneUnit.droneModel})
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Rate: ৳{selectedDroneUnit.serviceRatePerBigha} / Bigha • Pilot: {selectedDroneUnit.pilotName}
                  </p>

                  <form onSubmit={handleDroneBookingSubmit} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Service Type</label>
                        <select
                          value={droneServiceType}
                          onChange={(e) => setDroneServiceType(e.target.value as DroneServiceType)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          <option value="FUNGICIDE_BLIGHT_SPRAY">Fungicide (Blight/Blast)</option>
                          <option value="INSECTICIDE_SPRAY">Insecticide Spray</option>
                          <option value="LIQUID_FERTILIZER_TOPDRESS">Liquid Fertilizer / Zinc</option>
                          <option value="HERBICIDE_PRE_EMERGENCE">Herbicide Spray</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Target Crop</label>
                        <input
                          type="text"
                          required
                          value={droneTargetCrop}
                          onChange={(e) => setDroneTargetCrop(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Pesticide / Formula Name</label>
                      <input
                        type="text"
                        required
                        value={droneInfestation}
                        onChange={(e) => setDroneInfestation(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Land Area (Bighas)</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={droneLandAreaBighas}
                          onChange={(e) => setDroneLandAreaBighas(Math.max(0.5, Number(e.target.value)))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                        />
                      </div>
                      <div className="p-2.5 bg-teal-50 dark:bg-teal-950/40 rounded-xl">
                        <span className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold">Total Cost:</span>
                        <p className="text-base font-black text-teal-800 dark:text-teal-200">
                          ৳{(droneLandAreaBighas * selectedDroneUnit.serviceRatePerBigha).toFixed(0)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Farmer Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Md. Rahim"
                          value={droneFarmerName}
                          onChange={(e) => setDroneFarmerName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Farmer Phone *</label>
                        <input
                          type="tel"
                          required
                          placeholder="017xxxxxxxx"
                          value={droneFarmerPhone}
                          onChange={(e) => setDroneFarmerPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Plot Location & Mouza *</label>
                      <input
                        type="text"
                        required
                        placeholder="Village, Mouza, Union"
                        value={dronePlotAddress}
                        onChange={(e) => setDronePlotAddress(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Date</label>
                        <input
                          type="date"
                          value={droneDate}
                          onChange={(e) => setDroneDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Time Window</label>
                        <input
                          type="text"
                          value={droneTimeSlot}
                          onChange={(e) => setDroneTimeSlot(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setSelectedDroneUnit(null)}
                        className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isBookingDrone}
                        className="px-6 py-2 rounded-xl bg-teal-600 text-white font-bold"
                      >
                        {isBookingDrone ? 'Booking...' : 'Confirm Drone Spray'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DIGITAL SOIL HEALTH CARD */}
        {activeTab === 'SOIL' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Input Form */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-indigo-600" />
                  <span>{isBn ? 'মৃত্তিকা ল্যাব টেস্ট ইনপুট' : 'Enter Soil Diagnostic Lab Values'}</span>
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  {isBn
                    ? 'মৃত্তিকা সম্পদ উন্নয়ন ইনস্টিটিউট (SRDI) বা উপজেলা কৃষি অফিসের মাটি পরীক্ষার মান বসান।'
                    : 'Input soil test parameters to calculate exact Urea, TSP, MOP, Gypsum, and Zinc requirements.'}
                </p>

                <form onSubmit={handleSoilCardSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Target Crop</label>
                      <select
                        value={soilTargetCrop}
                        onChange={(e) => setSoilTargetCrop(e.target.value as CropTargetNutrient)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                      >
                        <option value="POTATO">Potato (গোল আলু)</option>
                        <option value="BORO_RICE">Boro Rice (বোরো ধান)</option>
                        <option value="AMAN_RICE">Aman Rice (আমন ধান)</option>
                        <option value="HYBRID_MAIZE">Hybrid Maize (ভুট্টা)</option>
                        <option value="MUSTARD">Mustard (সরিষা)</option>
                        <option value="WINTER_VEGETABLES">Winter Vegetables</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Soil Texture</label>
                      <select
                        value={soilTexture}
                        onChange={(e) => setSoilTexture(e.target.value as SoilTextureType)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="CLAY_LOAM">Clay Loam (এঁটেল দোআঁশ)</option>
                        <option value="SANDY_LOAM">Sandy Loam (বেলে দোআঁশ)</option>
                        <option value="SILTY_LOAM">Silty Loam (পলি দোআঁশ)</option>
                        <option value="COASTAL_SALINE">Coastal Saline (লবণাক্ত মাটি)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">pH Level (3-10)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={soilPh}
                        onChange={(e) => setSoilPh(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Nitrogen (kg/ha)</label>
                      <input
                        type="number"
                        value={soilN}
                        onChange={(e) => setSoilN(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Phosphorus (ppm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={soilP}
                        onChange={(e) => setSoilP(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Potassium (meq/100g)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={soilK}
                        onChange={(e) => setSoilK(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Organic Matter (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={soilOm}
                        onChange={(e) => setSoilOm(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Zinc (ppm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={soilZn}
                        onChange={(e) => setSoilZn(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isGeneratingSoilCard}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isGeneratingSoilCard ? 'Analyzing...' : 'Generate Soil Health Card'}</span>
                  </button>
                </form>
              </div>

              {/* Right: Output Certificate */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {generatedCard ? generatedCard.soilCardNumber : 'SOIL-DIAGNOSTIC-SRDI'}
                      </span>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                        {isBn ? 'সুষম সার প্রয়োগ নির্দেশিকা' : 'Scientific Fertilizer Prescription'}
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      Per Bigha (৩৩ শতক)
                    </span>
                  </div>

                  {/* Dosages Breakdown Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                      <span className="text-[11px] text-slate-400">ইউরিয়া (Urea)</span>
                      <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                        {generatedCard ? generatedCard.calculatedUreaKgPerBigha : '38.5'} kg
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                      <span className="text-[11px] text-slate-400">টিএসপি (TSP)</span>
                      <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                        {generatedCard ? generatedCard.calculatedTspKgPerBigha : '32.0'} kg
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                      <span className="text-[11px] text-slate-400">এমওপি / পটাশ (MOP)</span>
                      <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                        {generatedCard ? generatedCard.calculatedMopKgPerBigha : '35.0'} kg
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                      <span className="text-[11px] text-slate-400">জিপসাম (Gypsum)</span>
                      <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                        {generatedCard ? generatedCard.calculatedGypsumKgPerBigha : '14.0'} kg
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                      <span className="text-[11px] text-slate-400">জিংক সালফেট (Zinc)</span>
                      <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                        {generatedCard ? generatedCard.calculatedZincKgPerBigha : '1.5'} kg
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                      <span className="text-[11px] text-slate-400">জৈব কম্পোস্ট সার</span>
                      <p className="text-lg font-black text-emerald-600 mt-0.5">
                        {generatedCard ? generatedCard.calculatedOrganicCompostKgPerBigha : '250'} kg
                      </p>
                    </div>
                  </div>

                  {/* Acidic Soil Lime Advice Callout */}
                  {(generatedCard?.phCorrectionAdvice || soilPh < 5.5) && (
                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl text-xs text-amber-900 dark:text-amber-200 mb-4 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>অম্লীয় মাটি সংশোধনের পরামর্শ: </strong>
                        {generatedCard?.phCorrectionAdvice ||
                          'মাটি তীব্র অম্লীয় (pH < 5.5)। সারের অপচয় রোধ ও শোষণ বাড়াতে জমি তৈরির ১৫ দিন আগে প্রতি বিঘায় ৪০ কেজি কৃষি ডলোমাইট চুন (Dolomite Lime) ভালোভাবে ছিটিয়ে দিন।'}
                      </span>
                    </div>
                  )}

                  {/* Application Timing */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs text-slate-600 dark:text-slate-300">
                    <strong className="block text-slate-900 dark:text-white mb-1">
                      সার প্রয়োগের সময়সূচি (Application Schedule):
                    </strong>
                    {generatedCard?.fertilizerApplicationSchedule ||
                      'জমি তৈরিতে: সমস্ত টিএসপি, জিপসাম, জিংক, অর্ধেক পটাশ ও অর্ধেক ইউরিয়া। বাকি ইউরিয়া ও পটাশ রোপণের ৩০-৩৫ দিন পর মাটির ভেল তোলার সময় উপরিপ্রয়োগ।'}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6 flex justify-between items-center text-xs">
                  <span className="text-slate-400">SRDI Bangladesh Diagnostic Standard</span>
                  <button
                    onClick={() => window.print()}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Print Soil Card</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
