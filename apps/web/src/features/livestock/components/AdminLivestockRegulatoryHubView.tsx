'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Stethoscope,
  Truck,
  Lock,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Thermometer,
} from 'lucide-react';
import {
  useGetLivestockListingsQuery,
  useRecordHealthPassportMutation,
  useAddVaccineRecordMutation,
  useGetAllTransportBookingsQuery,
  useUpdateTransportStatusMutation,
  useReleaseEscrowMutation,
  useRefundEscrowMutation,
  LivestockListing,
} from '../livestockApi';
import { LivestockPassportModal } from './LivestockPassportModal';

export const AdminLivestockRegulatoryHubView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'INSPECTIONS' | 'TRANSPORTS' | 'ESCROW'>('INSPECTIONS');
  const [selectedPassportTag, setSelectedPassportTag] = useState<string | null>(null);

  // Health Certification Modal
  const [inspectListing, setInspectListing] = useState<LivestockListing | null>(null);
  const [vetName, setVetName] = useState('Dr. Md. Nazmul Huda, Upazila Veterinary Surgeon (UVS)');
  const [vetReg, setVetReg] = useState('BVC-REG-10482');
  const [hospital, setHospital] = useState('Sherpur Upazila Livestock Hospital, Bogura');
  const [tempCelsius, setTempCelsius] = useState(38.6);
  const [deworming, setDeworming] = useState('2026-10-17 (Albendazole 10% bolus)');
  const [remarks, setRemarks] = useState('শারীরিক পরীক্ষা সম্পন্ন। ক্ষুরারোগ বা লাম্পি স্কিন লক্ষণমুক্ত, স্বাস্থ্যবান ও সম্পূর্ণ বিক্রয়যোগ্য।');
  const [certSuccess, setCertSuccess] = useState<string | null>(null);

  // Add Vaccine Modal
  const [vaccineTag, setVaccineTag] = useState<string | null>(null);
  const [vaccineType, setVaccineType] = useState('FOOT_AND_MOUTH_FMD');
  const [batchNo, setBatchNo] = useState('LRI-FMD-2608');
  const [doseDate, setDoseDate] = useState('2026-10-17');
  const [nextDueDate, setNextDueDate] = useState('2027-04-17');
  const [vaccineSuccess, setVaccineSuccess] = useState<string | null>(null);

  const { data: listingsData } = useGetLivestockListingsQuery();
  const listings = listingsData?.data || [];

  const { data: transportData } = useGetAllTransportBookingsQuery();
  const transports = transportData?.data || [];

  const [recordPassport, { isLoading: isCertifying }] = useRecordHealthPassportMutation();
  const [addVaccine, { isLoading: isAddingVaccine }] = useAddVaccineRecordMutation();
  const [updateTransport] = useUpdateTransportStatusMutation();
  const [releaseEscrow] = useReleaseEscrowMutation();
  const [refundEscrow] = useRefundEscrowMutation();

  const handleCertifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectListing) return;

    try {
      await recordPassport({
        earTagNumber: inspectListing.earTagNumber,
        livestockId: inspectListing.id,
        veterinaryOfficerName: vetName,
        veterinaryRegNumber: vetReg,
        upazilaHospital: hospital,
        healthCertification: 'CERTIFIED_HEALTHY',
        bodyTemperatureCelsius: tempCelsius,
        dewormingDate: deworming,
        healthRemarks: remarks,
      }).unwrap();

      setCertSuccess('ডিএলএস সরকারি স্বাস্থ্য পাসপোর্ট সফলভাবে ইস্যু হয়েছে!');
      setTimeout(() => {
        setCertSuccess(null);
        setInspectListing(null);
      }, 2500);
    } catch {
      alert('সনদ তৈরিতে সমস্যা হয়েছে।');
    }
  };

  const handleVaccineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineTag) return;

    try {
      await addVaccine({
        earTag: vaccineTag,
        vaccine: vaccineType,
        doseDate,
        nextDueDate,
        batchNo,
        administeredBy: vetName,
      }).unwrap();

      setVaccineSuccess('টিকার রেকর্ড পাসপোর্টে যুক্ত হয়েছে!');
      setTimeout(() => {
        setVaccineSuccess(null);
        setVaccineTag(null);
      }, 2500);
    } catch {
      alert('টিকা রেকর্ডে ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" /> প্রাণিসম্পদ অধিদপ্তর (DLS) ও ডিজিটাল হাট নিয়ন্ত্রণ কেন্দ্র
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            পশু স্বাস্থ্য পরীক্ষা, টিকাদান রেজিস্ট্রি, পরিবহন মনিটরিং ও এসক্রো নিষ্পত্তি ব্যবস্থা
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('INSPECTIONS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'INSPECTIONS'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            স্বাস্থ্য পরীক্ষা ও পাসপোর্ট
          </button>
          <button
            onClick={() => setActiveTab('TRANSPORTS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'TRANSPORTS'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            পশু পরিবহন বহর
          </button>
          <button
            onClick={() => setActiveTab('ESCROW')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ESCROW'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            এসক্রো বায়না ট্র্যাকার
          </button>
        </div>
      </div>

      {/* Tab 1: Inspections & Health Passports */}
      {activeTab === 'INSPECTIONS' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-600" /> খামারের পশু স্বাস্থ্য পরিদর্শন ও টিকাদান তালিকা
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">কানট্যাগ ও বিবরণ</th>
                  <th className="p-3">খামার ও উপজেলা</th>
                  <th className="p-3">ওজন ও বয়স</th>
                  <th className="p-3">স্বাস্থ্য অবস্থা</th>
                  <th className="p-3 text-right">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3">
                      <div className="font-mono font-bold text-emerald-600">{l.earTagNumber}</div>
                      <div className="text-slate-900 dark:text-slate-100 font-semibold mt-0.5">{l.title}</div>
                      <span className="text-[10px] text-slate-500">{l.breed}</span>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{l.sellerName}</div>
                      <div className="text-slate-500">{l.sellerUpazila}, {l.sellerDistrict}</div>
                    </td>
                    <td className="p-3">
                      <div>{l.liveWeightKg} কেজি</div>
                      <div className="text-slate-500">{l.teethCount} দাঁত • {l.ageMonths} মাস</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          l.healthStatus === 'CERTIFIED_HEALTHY'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {l.healthStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => setSelectedPassportTag(l.earTagNumber)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-semibold"
                      >
                        পাসপোর্ট
                      </button>
                      <button
                        onClick={() => setInspectListing(l)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                      >
                        সনদ দিন
                      </button>
                      <button
                        onClick={() => setVaccineTag(l.earTagNumber)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                      >
                        +টিকা
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Specialized Livestock Transports */}
      {activeTab === 'TRANSPORTS' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" /> পশু পরিবহন পিকআপ বহর ও বায়ো-সিকিউরিটি ট্র্যাকিং
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {transports.map((t) => (
              <div key={t.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="font-mono text-emerald-600">{t.bookingNumber}</span>
                    <span className="text-slate-400">•</span>
                    <span>কানট্যাগ: {t.earTagNumber}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    রুট: <strong>{t.pickupDistrict} ({t.pickupUpazila})</strong> ➔ <strong>{t.dropoffDistrict} ({t.dropoffAddress})</strong>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    গাড়ি: {t.vehicleType} {t.vehiclePlateNumber && `• প্লেট: ${t.vehiclePlateNumber}`} • চালক: {t.driverName || 'অপেক্ষমান'} ({t.driverPhone || '—'})
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      t.status === 'ARRIVED_INSPECTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : t.status === 'IN_TRANSIT'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {t.status}
                  </span>

                  {t.status === 'SCHEDULED' && (
                    <button
                      onClick={() => updateTransport({ id: t.id, status: 'IN_TRANSIT', driverName: 'Ratan Mia', driverPhone: '01718990011' })}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold"
                    >
                      ট্রাকে তুলুন
                    </button>
                  )}
                  {t.status === 'IN_TRANSIT' && (
                    <button
                      onClick={() => updateTransport({ id: t.id, status: 'ARRIVED_INSPECTED' })}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                    >
                      পৌঁছেছে নিশ্চিত করুন
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Escrow Holdings & Arbitration */}
      {activeTab === 'ESCROW' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" /> গবাদি পশু ক্রয়-বিক্রয় এসক্রো ফান্ড সালিশি ও নিষ্পত্তি
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {listings.filter((l) => l.escrowStatus).map((l) => (
              <div key={l.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {l.title} ({l.earTagNumber})
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    বিক্রেতা: {l.sellerName} • ক্রেতা: {l.buyerName} ({l.buyerPhone})
                  </div>
                  <div className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    এসক্রো ফান্ড: ৳{Number(l.escrowAmount || l.askingPrice).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      l.escrowStatus === 'HELD_IN_ESCROW'
                        ? 'bg-amber-100 text-amber-800'
                        : l.escrowStatus === 'RELEASED_TO_SELLER'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {l.escrowStatus}
                  </span>

                  {l.escrowStatus === 'HELD_IN_ESCROW' && (
                    <>
                      <button
                        onClick={() => releaseEscrow(l.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                      >
                        খামারিকে টাকা ছাড়ুন
                      </button>
                      <button
                        onClick={() => refundEscrow(l.id)}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold"
                      >
                        ক্রেতাকে ফেরত দিন
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certify Modal */}
      {inspectListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-emerald-500/30 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" /> সরকারি ডিএলএস স্বাস্থ্য সনদ প্রদান
              </h3>
              <button onClick={() => setInspectListing(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs">
              পশু: <span className="font-bold">{inspectListing.title}</span> ({inspectListing.earTagNumber})
            </div>

            {certSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                {certSuccess}
              </div>
            ) : (
              <form onSubmit={handleCertifySubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">প্রাণিসম্পদ কর্মকর্তার নাম ও পদবী</label>
                  <input
                    type="text"
                    required
                    value={vetName}
                    onChange={(e) => setVetName(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">বিভিসি রেজিস্ট্রেশন নং</label>
                    <input
                      type="text"
                      required
                      value={vetReg}
                      onChange={(e) => setVetReg(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">শরীরের তাপমাত্রা (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={tempCelsius}
                      onChange={(e) => setTempCelsius(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">হাসপাতালের নাম</label>
                  <input
                    type="text"
                    required
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">স্বাস্থ্যগত মন্তব্য</label>
                  <textarea
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCertifying}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  {isCertifying ? 'সনদ তৈরি হচ্ছে...' : 'স্বাস্থ্য সনদ অনুমোদন করুন'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Vaccine Modal */}
      {vaccineTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-blue-500/30 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" /> টিকাদান রেকর্ড অন্তর্ভুক্তি
              </h3>
              <button onClick={() => setVaccineTag(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-500">
              কানট্যাগ: <span className="font-mono font-bold text-emerald-600">{vaccineTag}</span>
            </div>

            {vaccineSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                {vaccineSuccess}
              </div>
            ) : (
              <form onSubmit={handleVaccineSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">টিকার ধরন</label>
                  <select
                    value={vaccineType}
                    onChange={(e) => setVaccineType(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="FOOT_AND_MOUTH_FMD">ক্ষুরারোগ (FMD)</option>
                    <option value="ANTHRAX">তড়কা (Anthrax)</option>
                    <option value="LUMPY_SKIN_DISEASE_LSD">লাম্পি স্কিন ডিজিজ (LSD)</option>
                    <option value="BLACK_QUARTER_BQ">বাদলা রোগ (Black Quarter)</option>
                    <option value="PPR_GOAT_PLAGUE">পিপিআর (PPR Goat Plague)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">প্রদানের তারিখ</label>
                    <input
                      type="date"
                      value={doseDate}
                      onChange={(e) => setDoseDate(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">পরবর্তী বুস্টার ডোজ</label>
                    <input
                      type="date"
                      value={nextDueDate}
                      onChange={(e) => setNextDueDate(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">টিকার ব্যাচ নম্বর</label>
                  <input
                    type="text"
                    required
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAddingVaccine}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  {isAddingVaccine ? 'যুক্ত হচ্ছে...' : 'পাসপোর্টে টিকা সংরক্ষণ করুন'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DLS Passport Modal */}
      {selectedPassportTag && (
        <LivestockPassportModal
          earTagNumber={selectedPassportTag}
          onClose={() => setSelectedPassportTag(null)}
        />
      )}
    </div>
  );
};
