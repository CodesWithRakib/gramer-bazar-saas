'use client';

import React, { useState } from 'react';
import {
  Tractor,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Wrench,
  ShieldCheck,
  TrendingDown,
  Layers,
  Fuel,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import {
  useGetOwnerMachineryItemsQuery,
  useGetOwnerMachineryBookingsQuery,
  useCreateMachineryItemMutation,
  useUpdateMachineryItemMutation,
  useUpdateMachineryBookingStatusMutation,
  useSubmitMachineryInspectionMutation,
  MachineryCategory,
  PricingBasis,
  FuelOption,
  OperatorOption,
  MachineryBooking,
  InspectionType,
} from '../machineryApi';

export function OwnerMachineryDashboardView({ lang = 'en' }: { lang?: string }) {
  const isBn = lang === 'bn';

  const [activeTab, setActiveTab] = useState<'FLEET' | 'BOOKINGS'>('FLEET');

  // Queries
  const { data: fleet = [], isLoading: isFleetLoading, refetch: refetchFleet } = useGetOwnerMachineryItemsQuery();
  const { data: bookings = [], isLoading: isBookingsLoading, refetch: refetchBookings } = useGetOwnerMachineryBookingsQuery();

  // Mutations
  const [createItem, { isLoading: isCreating }] = useCreateMachineryItemMutation();
  const [updateItem] = useUpdateMachineryItemMutation();
  const [updateBookingStatus] = useUpdateMachineryBookingStatusMutation();
  const [submitInspection, { isLoading: isInspecting }] = useSubmitMachineryInspectionMutation();

  // New Equipment Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [titleEn, setTitleEn] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [category, setCategory] = useState<MachineryCategory>('POWER_TILLER');
  const [pricingBasis, setPricingBasis] = useState<PricingBasis>('PER_BIGHA');
  const [baseRate, setBaseRate] = useState<number>(1200);
  const [securityDeposit, setSecurityDeposit] = useState<number>(1500);
  const [fuelOption, setFuelOption] = useState<FuelOption>('FUEL_INCLUDED');
  const [operatorOption, setOperatorOption] = useState<OperatorOption>('OPERATOR_INCLUDED');
  const [operatorDailyAllowance, setOperatorDailyAllowance] = useState<number>(400);
  const [division, setDivision] = useState('Rajshahi');
  const [district, setDistrict] = useState('Bogura');
  const [upazila, setUpazila] = useState('Sherpur');
  const [union, setUnion] = useState('');
  const [serviceRadiusKm, setServiceRadiusKm] = useState<number>(15);
  const [neighborClusterDiscountPct, setNeighborClusterDiscountPct] = useState<number>(10);
  const [modalError, setModalError] = useState<string | null>(null);

  // Inspection Modal State
  const [inspectingBooking, setInspectingBooking] = useState<MachineryBooking | null>(null);
  const [inspectionType, setInspectionType] = useState<InspectionType>('PRE_DISPATCH');
  const [meterHours, setMeterHours] = useState<number>(120.0);
  const [fuelLevelPct, setFuelLevelPct] = useState<number>(90);
  const [isEngineOperational, setIsEngineOperational] = useState<boolean>(true);
  const [isOperational, setIsOperational] = useState<boolean>(true);
  const [damageNotes, setDamageNotes] = useState<string>('');
  const [claimDamageDeduction, setClaimDamageDeduction] = useState<number>(0);

  const handleCreateMachineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    try {
      await createItem({
        titleEn: titleEn.trim(),
        titleBn: titleBn.trim(),
        category,
        pricingBasis,
        baseRate: Number(baseRate),
        securityDeposit: Number(securityDeposit),
        fuelOption,
        operatorOption,
        operatorDailyAllowance: Number(operatorDailyAllowance),
        division,
        district: district.trim(),
        upazila: upazila.trim(),
        union: union.trim() || undefined,
        serviceRadiusKm: Number(serviceRadiusKm),
        neighborClusterDiscountPct: Number(neighborClusterDiscountPct),
      }).unwrap();

      setShowAddModal(false);
      // Reset form
      setTitleEn('');
      setTitleBn('');
    } catch (err: any) {
      setModalError(err?.data?.message || 'Failed to add machinery item');
    }
  };

  const handleStatusChange = async (bookingId: string, status: any) => {
    try {
      await updateBookingStatus({ id: bookingId, status }).unwrap();
    } catch (err: any) {
      alert(err?.data?.message || 'Status transition failed');
    }
  };

  const handleInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingBooking) return;

    try {
      await submitInspection({
        id: inspectingBooking.id,
        data: {
          inspectionType,
          meterHours: Number(meterHours),
          fuelLevelPct: Number(fuelLevelPct),
          isEngineOperational,
          isOperational,
          damageNotes: damageNotes.trim() || undefined,
          claimDamageDeduction: Number(claimDamageDeduction),
        },
      }).unwrap();

      setInspectingBooking(null);
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to submit inspection');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {isBn ? 'কৃষি যন্ত্রপাতি মালিক ড্যাশবোর্ড' : 'Machinery Owner Fleet & Dispatch Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isBn
              ? 'আপনার কৃষি যন্ত্রপাতি তালিকাভুক্ত করুন, শিডিউল বুকিং পরিচালনা করুন এবং প্রি/পোস্ট চেকলিস্ট সম্পন্ন করুন।'
              : 'Register machinery for hire, coordinate neighbor cluster routes, and submit digital return inspections.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>{isBn ? 'নতুন যন্ত্রপাতি যুক্ত করুন' : 'Add New Equipment'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('FLEET')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'FLEET'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {isBn ? `যন্ত্রপাতি বহর (${fleet.length})` : `My Equipment Fleet (${fleet.length})`}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('BOOKINGS')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'BOOKINGS'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {isBn ? `ভাড়া বুকিং সমূহ (${bookings.length})` : `Rental Bookings (${bookings.length})`}
        </button>
      </div>

      {/* Tab 1: Equipment Fleet */}
      {activeTab === 'FLEET' && (
        <div className="space-y-4">
          {isFleetLoading ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">{isBn ? 'বহর লোড হচ্ছে...' : 'Loading fleet...'}</p>
            </div>
          ) : fleet.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Tractor className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
                {isBn ? 'কোনো যন্ত্রপাতি তালিকাভুক্ত নেই' : 'No machinery listed yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                {isBn
                  ? 'আপনার ট্রাক্টর, পাওয়ার টিলার বা সেচ পাম্প যুক্ত করে ভাড়া আয় শুরু করুন।'
                  : 'Add your tractors, tillers, pumps, or harvesters to start receiving rental requests.'}
              </p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
              >
                {isBn ? 'যন্ত্রপাতি যুক্ত করুন' : 'Add Equipment'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {fleet.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {item.category.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.status === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                    {isBn ? item.titleBn : item.titleEn}
                  </h3>

                  <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {item.upazila}, {item.district}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isBn ? 'ভাড়ার হার' : 'Rate'}:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        ৳{item.baseRate} / {item.pricingBasis.replace('PER_', '')}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isBn ? 'জামানত' : 'Deposit'}:</span>
                      <span>৳{item.securityDeposit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isBn ? 'সমবায় ছাড়' : 'Cluster Discount'}:</span>
                      <span>{item.neighborClusterDiscountPct}%</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateItem({
                          id: item.id,
                          data: { status: item.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE' },
                        })
                      }
                      className="w-full py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      {item.status === 'AVAILABLE'
                        ? isBn
                          ? 'রক্ষণাবেক্ষণে পাঠান'
                          : 'Set Maintenance'
                        : isBn
                          ? 'সক্রিয় করুন'
                          : 'Set Available'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Bookings & Inspection Sign-off */}
      {activeTab === 'BOOKINGS' && (
        <div className="space-y-4">
          {isBookingsLoading ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">{isBn ? 'বুকিং লোড হচ্ছে...' : 'Loading bookings...'}</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
                {isBn ? 'কোনো ভাড়া বুকিং নেই' : 'No rental bookings received yet'}
              </h3>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {booking.bookingReference}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {booking.renterName} ({booking.renterPhone})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {booking.status}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {booking.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 my-3 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">{isBn ? 'যন্ত্রপাতি' : 'Machine'}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {booking.machinery?.titleEn}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">{isBn ? 'জমির অবস্থান' : 'Plot'}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {booking.plotSizeValue} Units ({booking.plotUpazila}, {booking.plotDistrict})
                      </span>
                      <p className="text-[11px] text-slate-500">{booking.plotAddress}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">{isBn ? 'শিডিউল' : 'Dates'}</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">{isBn ? 'মোট ভাড়া ও ডিপোজিট' : 'Total & Escrow'}</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        ৳{booking.grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Dispatch Controls */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setInspectingBooking(booking);
                          setInspectionType('PRE_DISPATCH');
                        }}
                        className="px-3 py-1.5 rounded-lg border border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{isBn ? 'কাজের পূর্বে পরিদর্শন (Pre-Dispatch)' : 'Pre-Dispatch Check'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setInspectingBooking(booking);
                          setInspectionType('POST_RETURN');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isBn ? 'ফেরত পরিদর্শন ও জামানত ছাড়' : 'Return Check & Release'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {booking.status === 'CONFIRMED' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(booking.id, 'IN_PROGRESS')}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                        >
                          {isBn ? 'কাজ শুরু করুন' : 'Start Job'}
                        </button>
                      )}

                      {booking.status === 'IN_PROGRESS' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(booking.id, 'COMPLETED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                        >
                          {isBn ? 'কাজ সম্পন্ন চিহ্নিত করুন' : 'Mark Completed'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add New Machine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              {isBn ? 'নতুন কৃষি যন্ত্রপাতি যুক্ত করুন' : 'Register Agricultural Machinery for Hire'}
            </h2>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs mb-4">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateMachineSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kubota Combine Harvester DC-70"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Title (বাংলা)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: কুবাটো কম্বাইন্ড হারভেস্টার ডিসি-৭০"
                    value={titleBn}
                    onChange={(e) => setTitleBn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MachineryCategory)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value="POWER_TILLER">Power Tiller</option>
                    <option value="TRACTOR">Tractor</option>
                    <option value="COMBINE_HARVESTER">Combine Harvester</option>
                    <option value="IRRIGATION_PUMP_DIESEL">Diesel Irrigation Pump</option>
                    <option value="IRRIGATION_PUMP_SOLAR">Solar Irrigation Pump</option>
                    <option value="PADDY_THRESHER">Paddy Thresher</option>
                    <option value="SPRAYING_DRONE">Spraying Drone</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pricing Basis</label>
                  <select
                    value={pricingBasis}
                    onChange={(e) => setPricingBasis(e.target.value as PricingBasis)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value="PER_BIGHA">Per Bigha (প্রতি বিঘা)</option>
                    <option value="PER_HOUR">Per Hour (প্রতি ঘণ্টা)</option>
                    <option value="PER_DAY">Per Day (প্রতি দিন)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Base Rate (৳)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={baseRate}
                    onChange={(e) => setBaseRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Damage Deposit (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cluster Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={neighborClusterDiscountPct}
                    onChange={(e) => setNeighborClusterDiscountPct(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Upazila</label>
                  <input
                    type="text"
                    required
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Service Radius (km)</label>
                  <input
                    type="number"
                    min="1"
                    value={serviceRadiusKm}
                    onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center justify-center gap-2"
                >
                  {isCreating ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ ও তালিকাভুক্ত করুন'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Inspection Check-in Modal */}
      {inspectingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
              {inspectionType === 'PRE_DISPATCH'
                ? isBn ? 'কাজের পূর্বে পরিদর্শন সাইন-অফ (Pre-Dispatch)' : 'Pre-Dispatch Digital Inspection'
                : isBn ? 'কাজ শেষে পরিদর্শন ও জামানত সমন্বয় (Post-Return)' : 'Post-Return Inspection & Escrow Check'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Booking Ref: <strong className="font-mono text-emerald-600">{inspectingBooking.bookingReference}</strong>
            </p>

            <form onSubmit={handleInspectionSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Meter Reading (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={meterHours}
                    onChange={(e) => setMeterHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fuel Tank Level (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={fuelLevelPct}
                    onChange={(e) => setFuelLevelPct(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEngineOperational}
                    onChange={(e) => setIsEngineOperational(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Engine Running Smooth</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOperational}
                    onChange={(e) => setIsOperational(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Tillage / Cutter Intact</span>
                </label>
              </div>

              {inspectionType === 'POST_RETURN' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Damage Deduction Claim (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={claimDamageDeduction}
                    onChange={(e) => setClaimDamageDeduction(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-rose-600"
                  />
                  <span className="text-[11px] text-slate-400">
                    If 0, security deposit will be automatically released back to farmer.
                  </span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Inspection Notes & Observations
                </label>
                <textarea
                  rows={2}
                  value={damageNotes}
                  onChange={(e) => setDamageNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  placeholder="Note structural condition, blades sharpness, oil leak..."
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isInspecting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition"
                >
                  {isInspecting ? 'জমা হচ্ছে...' : 'পরিদর্শন রিপোর্ট জমা দিন'}
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingBooking(null)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
