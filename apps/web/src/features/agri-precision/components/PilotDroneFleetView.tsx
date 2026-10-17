'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plane,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Sparkles,
  Droplets,
  Calendar,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  useGetPilotDroneBookingsQuery,
  useGetDroneUnitsQuery,
  useRegisterDroneUnitMutation,
  useUpdateDroneBookingStatusMutation,
  DroneBookingStatus,
} from '../agriPrecisionApi';

export function PilotDroneFleetView({ lang = 'en' }: { lang?: string }) {
  const isBn = lang === 'bn';

  const [activeTab, setActiveTab] = useState<'MISSIONS' | 'UNITS'>('MISSIONS');

  // Queries
  const { data: pilotBookings = [], isLoading: loadingBookings, refetch: refetchBookings } =
    useGetPilotDroneBookingsQuery();
  const { data: unitsData, isLoading: loadingUnits, refetch: refetchUnits } = useGetDroneUnitsQuery();
  const units = unitsData?.items || [];

  // Mutations
  const [registerDrone, { isLoading: isRegistering }] = useRegisterDroneUnitMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateDroneBookingStatusMutation();

  // New Drone Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [droneModel, setDroneModel] = useState('DJI Agras T40 (40L Tank)');
  const [pilotName, setPilotName] = useState('Engr. Tanvir Ahmed');
  const [pilotPhone, setPilotPhone] = useState('01719887766');
  const [licenseNo, setLicenseNo] = useState('CAAB-RPAS-2026-091');
  const [tankCapacity, setTankCapacity] = useState(40.0);
  const [ratePerBigha, setRatePerBigha] = useState(180.0);
  const [district, setDistrict] = useState('Bogura');
  const [upazila, setUpazila] = useState('Shibganj');
  const [coverageRadius, setCoverageRadius] = useState(35);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerDrone({
        droneModel,
        pilotName,
        pilotPhone,
        pilotLicenseNo: licenseNo,
        tankCapacityLiters: Number(tankCapacity),
        serviceRatePerBigha: Number(ratePerBigha),
        baseDistrict: district,
        baseUpazila: upazila,
        coverageRadiusKm: Number(coverageRadius),
      }).unwrap();

      setShowAddModal(false);
      refetchUnits();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to register drone unit');
    }
  };

  const handleStatusAdvance = async (bookingId: string, currentStatus: DroneBookingStatus) => {
    let nextStatus: DroneBookingStatus = 'CONFIRMED_DISPATCH';
    let duration: number | undefined;

    if (currentStatus === 'REQUESTED') {
      nextStatus = 'CONFIRMED_DISPATCH';
    } else if (currentStatus === 'CONFIRMED_DISPATCH') {
      nextStatus = 'IN_FLIGHT_SPRAYING';
    } else if (currentStatus === 'IN_FLIGHT_SPRAYING') {
      nextStatus = 'COMPLETED';
      duration = 20; // 20 mins flight
    }

    try {
      await updateStatus({
        id: bookingId,
        body: {
          status: nextStatus,
          flightDurationMinutes: duration,
          pilotMissionNotes: 'Mission completed with zero wind drift and uniform droplet coverage.',
        },
      }).unwrap();

      refetchBookings();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to update flight mission status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 text-xs font-bold border border-teal-300 dark:border-teal-800">
                {isBn ? 'কৃষি ড্রোন পাইলট কন্ট্রোল হাব' : 'Agri Drone Pilot Station'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              {isBn ? 'ড্রোন স্প্রে বহর ও মিশন পরিচালনা' : 'Drone Spraying Fleet & Mission Control'}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              {isBn
                ? 'অন-ডিমান্ড এরিয়াল স্প্রে বুকিং গ্রহণ করুন, ফ্লাইটের অবস্থা আপডেট করুন এবং পানির সাশ্রয় হিসাব করুন।'
                : 'Accept on-demand agricultural spraying missions, dispatch drone flights, and log precision coverage.'}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md shadow-teal-600/30 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isBn ? 'নতুন ড্রোন ইউনিট যোগ করুন' : 'Register Drone Unit'}</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('MISSIONS')}
            className={`px-5 py-3 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'MISSIONS'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>
              {isBn ? 'স্প্রে মিশন কিউ' : 'Spraying Mission Queue'} ({pilotBookings.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('UNITS')}
            className={`px-5 py-3 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'UNITS'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>
              {isBn ? 'নিবন্ধিত ড্রোন বহর' : 'Active Drone Fleet'} ({units.length})
            </span>
          </button>
        </div>

        {/* TAB 1: MISSIONS QUEUE */}
        {activeTab === 'MISSIONS' && (
          <div className="space-y-4">
            {loadingBookings ? (
              <div className="py-20 text-center">
                <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading missions...</p>
              </div>
            ) : pilotBookings.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
                <Plane className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isBn ? 'বর্তমানে কোনো মিশন নির্ধারিত নেই' : 'No Scheduled Drone Missions'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {isBn
                    ? 'কৃষকরা আপনার ড্রোন ইউনিটে স্প্রে বুকিং দিলে তা এখানে রিয়েল-টাইমে প্রদর্শিত হবে।'
                    : 'When farmers request aerial spraying in your district, booking requests will appear here.'}
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-4">Booking #</th>
                        <th className="p-4">Farmer & Phone</th>
                        <th className="p-4">Crop & Infestation</th>
                        <th className="p-4">Area & Cost</th>
                        <th className="p-4">Date & Slot</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Flight Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {pilotBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                            {b.bookingNumber}
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-slate-900 dark:text-white">{b.farmerName}</p>
                            <p className="text-[11px] text-slate-500">{b.farmerPhone}</p>
                          </td>
                          <td className="p-4">
                            <span className="font-bold">{b.targetCrop}</span>
                            <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                              {b.targetInfestationOrFormula}
                            </p>
                          </td>
                          <td className="p-4">
                            <span className="font-bold">{b.landAreaBighas} Bighas</span>
                            <p className="text-[11px] text-teal-600 font-bold">৳{b.totalBookingCost}</p>
                          </td>
                          <td className="p-4">
                            <span>{b.scheduledDate}</span>
                            <p className="text-[10px] text-slate-400">{b.scheduledTimeSlot}</p>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                              {b.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {b.status === 'REQUESTED' && (
                              <button
                                onClick={() => handleStatusAdvance(b.id, b.status)}
                                disabled={isUpdatingStatus}
                                className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[11px]"
                              >
                                Accept & Dispatch
                              </button>
                            )}
                            {b.status === 'CONFIRMED_DISPATCH' && (
                              <button
                                onClick={() => handleStatusAdvance(b.id, b.status)}
                                disabled={isUpdatingStatus}
                                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px]"
                              >
                                Launch Spraying
                              </button>
                            )}
                            {b.status === 'IN_FLIGHT_SPRAYING' && (
                              <button
                                onClick={() => handleStatusAdvance(b.id, b.status)}
                                disabled={isUpdatingStatus}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]"
                              >
                                Complete Flight
                              </button>
                            )}
                            {b.status === 'COMPLETED' && (
                              <span className="text-emerald-600 font-bold text-[11px]">✓ Completed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACTIVE DRONE FLEET */}
        {activeTab === 'UNITS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {units.map((u) => (
              <div
                key={u.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-xs text-slate-400">{u.droneCode}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                    {u.tankCapacityLiters}L
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  {u.droneModel}
                </h3>
                <p className="text-xs text-slate-500 mb-4">{u.pilotName} ({u.pilotLicenseNo})</p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rate:</span>
                    <span className="font-bold text-teal-600">৳{u.serviceRatePerBigha}/bigha</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Sprayed:</span>
                    <span className="font-bold">{u.totalAcresSprayed} Acres</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Water Saved:</span>
                    <span className="font-bold text-cyan-600">{u.waterSavedLitersEstimated} L</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Register Drone Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-lg w-full border border-teal-300 dark:border-teal-800 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Register Precision Agricultural Drone
              </h3>
              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Drone Model *</label>
                  <input
                    type="text"
                    required
                    value={droneModel}
                    onChange={(e) => setDroneModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Pilot Name *</label>
                    <input
                      type="text"
                      required
                      value={pilotName}
                      onChange={(e) => setPilotName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Pilot Phone *</label>
                    <input
                      type="tel"
                      required
                      value={pilotPhone}
                      onChange={(e) => setPilotPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Pilot License No *</label>
                    <input
                      type="text"
                      required
                      value={licenseNo}
                      onChange={(e) => setLicenseNo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Tank Capacity (Liters)</label>
                    <input
                      type="number"
                      value={tankCapacity}
                      onChange={(e) => setTankCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Rate (৳/bigha)</label>
                    <input
                      type="number"
                      value={ratePerBigha}
                      onChange={(e) => setRatePerBigha(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Upazila</label>
                    <input
                      type="text"
                      value={upazila}
                      onChange={(e) => setUpazila(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="px-6 py-2 rounded-xl bg-teal-600 text-white font-bold"
                  >
                    {isRegistering ? 'Registering...' : 'Register Drone'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
