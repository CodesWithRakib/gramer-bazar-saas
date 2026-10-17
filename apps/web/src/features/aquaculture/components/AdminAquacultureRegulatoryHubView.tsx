'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Droplets,
  Activity,
  Wind,
  Search,
  Filter,
  Layers,
  FileCheck2,
  Check,
  X,
  Phone,
  MapPin,
  Calendar,
  Gauge,
  Sparkles,
} from 'lucide-react';
import {
  useGetAquacultureOverviewStatsQuery,
  useGetHatcheryBatchesQuery,
  useUpdateHatcheryBatchMutation,
  useGetAllTankerBookingsQuery,
  useUpdateTankerStatusMutation,
  useGetFarmerLatestTelemetryQuery,
  HatcheryBatch,
  LiveFishTransportBooking,
} from '../aquacultureApi';

export const AdminAquacultureRegulatoryHubView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PCR_VERIFICATION' | 'TANKER_DISPATCH' | 'IOT_SURVEILLANCE'>('PCR_VERIFICATION');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Tanker Dispatch Modal
  const [selectedTanker, setSelectedTanker] = useState<LiveFishTransportBooking | null>(null);
  const [driverName, setDriverName] = useState<string>('');
  const [driverPhone, setDriverPhone] = useState<string>('');
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState<string>('');
  const [targetStatus, setTargetStatus] = useState<LiveFishTransportBooking['waterTankerStatus']>('IN_TRANSIT_LIVE');

  const { data: statsData } = useGetAquacultureOverviewStatsQuery();
  const { data: batchesData, isLoading: isBatchesLoading } = useGetHatcheryBatchesQuery();
  const { data: tankersData, isLoading: isTankersLoading } = useGetAllTankerBookingsQuery();
  const { data: telemetryData } = useGetFarmerLatestTelemetryQuery();

  const [updateBatch] = useUpdateHatcheryBatchMutation();
  const [updateTanker, { isLoading: isUpdatingTanker }] = useUpdateTankerStatusMutation();

  const stats = statsData?.data;
  const batches = batchesData?.data || [];
  const tankers = tankersData?.data || [];
  const telemetry = telemetryData?.data || [];

  // Filtered Batches
  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.hatcheryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.pcrTestReportNumber && b.pcrTestReportNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return b.pcrTestStatus === statusFilter;
  });

  const handleVerifyPcr = async (batchId: string, approved: boolean) => {
    try {
      await updateBatch({
        id: batchId,
        pcrTestStatus: approved ? 'PCR_TESTED_NEGATIVE_SPF' : 'REJECTED_INFECTED',
        testingLab: approved ? 'DoF Central Shrimp & Fish Health Laboratory, Dhaka' : 'DoF Mobile Diagnostic Unit',
      }).unwrap();
    } catch (err) {
      console.error('Failed to update PCR status', err);
    }
  };

  const handleUpdateTanker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTanker) return;

    try {
      await updateTanker({
        id: selectedTanker.id,
        waterTankerStatus: targetStatus,
        driverName: driverName.trim() ? driverName : selectedTanker.driverName,
        driverPhone: driverPhone.trim() ? driverPhone : selectedTanker.driverPhone,
        vehiclePlateNumber: vehiclePlateNumber.trim() ? vehiclePlateNumber : selectedTanker.vehiclePlateNumber,
        departureTime: targetStatus === 'IN_TRANSIT_LIVE' ? new Date().toISOString() : selectedTanker.departureTime,
      }).unwrap();

      setSelectedTanker(null);
    } catch (err) {
      console.error('Failed to update tanker booking', err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-blue-950 rounded-2xl p-6 lg:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-teal-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>DoF Regulatory &amp; Live Logistics Control Hub (মৎস্য অধিদপ্তর নিয়ন্ত্রণ কেন্দ্র)</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Aquaculture Surveillance &amp; Tanker Dispatch Control
          </h1>
          <p className="mt-2 text-sm lg:text-base text-teal-100/80 max-w-2xl">
            Department of Fisheries (DoF) PCR health audit certification, nationwide IoT pond hypoxia &amp; toxic ammonia
            monitoring, and 3-ton live fish oxygen tanker logistics dispatch.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center min-w-[130px]">
            <div className="text-xs text-teal-200">SPF Certification</div>
            <div className="text-2xl font-black text-white">{stats?.spfCertifiedPercentage ?? 92.5}%</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center min-w-[130px]">
            <div className="text-xs text-teal-200">Monitored Ponds</div>
            <div className="text-2xl font-black text-emerald-400">{stats?.activeMonitoredPonds ?? 124}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 space-x-2">
        <button
          onClick={() => setActiveTab('PCR_VERIFICATION')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'PCR_VERIFICATION'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Hatchery PCR Health Audit ({batches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TANKER_DISPATCH')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'TANKER_DISPATCH'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Live Fish Tanker Fleet ({tankers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('IOT_SURVEILLANCE')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'IOT_SURVEILLANCE'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>IoT Pond Water Telemetry Grid</span>
        </button>
      </div>

      {/* TAB 1: PCR VERIFICATION */}
      {activeTab === 'PCR_VERIFICATION' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search species, hatchery, or PCR report..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
              >
                <option value="ALL">All PCR Statuses</option>
                <option value="PCR_PENDING">Pending PCR Inspection</option>
                <option value="PCR_TESTED_NEGATIVE_SPF">SPF Certified Negative</option>
                <option value="REJECTED_INFECTED">Rejected / Pathogen Detected</option>
              </select>
            </div>
          </div>

          {/* Batches List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {isBatchesLoading ? (
              <div className="p-12 text-center text-gray-500">Loading PCR certification batches...</div>
            ) : filteredBatches.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No batches match the selected criteria.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-gray-700">
                    <tr>
                      <th className="px-5 py-3">Batch &amp; Facility</th>
                      <th className="px-5 py-3">Species &amp; Quantity</th>
                      <th className="px-5 py-3">PCR Lab Report</th>
                      <th className="px-5 py-3">Health Status</th>
                      <th className="px-5 py-3 text-right">Regulatory Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 font-medium">
                    {filteredBatches.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30">
                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900 dark:text-white">{b.hatcheryName}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">{b.batchNumber}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span>{b.hatcheryDistrict}, {b.hatcheryUpazila}</span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-gray-900 dark:text-white font-semibold">{b.species}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {b.fingerlingCount.toLocaleString()} pcs • {b.averageLengthCm} cm
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200">
                            {b.pcrTestReportNumber || 'Report Pending'}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {b.testingLab || 'Department of Fisheries Testing Center'}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {b.pcrTestStatus === 'PCR_TESTED_NEGATIVE_SPF' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200">
                              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                              <span>SPF Certified</span>
                            </span>
                          )}
                          {b.pcrTestStatus === 'PCR_PENDING' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pending Verification</span>
                            </span>
                          )}
                          {b.pcrTestStatus === 'REJECTED_INFECTED' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200">
                              <X className="w-3.5 h-3.5 text-red-600" />
                              <span>Pathogen Detected (Quarantine)</span>
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleVerifyPcr(b.id, true)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve SPF</span>
                            </button>
                            <button
                              onClick={() => handleVerifyPcr(b.id, false)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-950/50 hover:bg-red-200 text-red-700 dark:text-red-300 text-xs font-bold transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TANKER DISPATCH */}
      {activeTab === 'TANKER_DISPATCH' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="text-xs font-semibold text-gray-500">AERATED TANKERS ON HIGHWAY</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                {tankers.filter((t) => t.waterTankerStatus === 'IN_TRANSIT_LIVE').length} Units
              </div>
              <div className="text-xs text-gray-500 mt-1">Dissolved oxygen maintained &gt; 7.0 mg/L</div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="text-xs font-semibold text-gray-500">PENDING DISPATCH PREP</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
                {tankers.filter((t) => t.waterTankerStatus === 'REQUESTED' || t.waterTankerStatus === 'AERATION_PREPPED').length} Units
              </div>
              <div className="text-xs text-gray-500 mt-1">Awaiting driver assignment &amp; aeration pre-fill</div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="text-xs font-semibold text-gray-500">DELIVERED ZERO-MORTALITY</div>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">
                {tankers.filter((t) => t.waterTankerStatus === 'DELIVERED_ZERO_MORTALITY').length} Shipments
              </div>
              <div className="text-xs text-gray-500 mt-1">100% live arrival at Karwan Bazar &amp; Fishery Ghat</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {isTankersLoading ? (
              <div className="p-12 text-center text-gray-500">Loading tanker transport bookings...</div>
            ) : tankers.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No live fish transport bookings found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-gray-700">
                    <tr>
                      <th className="px-5 py-3">Booking ID</th>
                      <th className="px-5 py-3">Route (Origin &rarr; Arat)</th>
                      <th className="px-5 py-3">Species &amp; Weight</th>
                      <th className="px-5 py-3">Driver &amp; Tanker</th>
                      <th className="px-5 py-3">Transit Status</th>
                      <th className="px-5 py-3 text-right">Dispatch Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 font-medium">
                    {tankers.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30">
                        <td className="px-5 py-4">
                          <div className="font-mono font-bold text-gray-900 dark:text-white">{t.bookingNumber}</div>
                          <div className="text-xs text-gray-500 mt-0.5 font-medium">{t.vehicleType.replace(/_/g, ' ')}</div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {t.pickupDistrict} ({t.pickupUpazila})
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">&rarr; {t.dropoffMarket}</div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold text-gray-900 dark:text-white">{t.species}</div>
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                            {t.approximateFishKg.toLocaleString()} kg (৳{t.estimatedLivePriceBdt.toLocaleString()})
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {t.driverName ? (
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">{t.driverName}</div>
                              <div className="text-xs text-gray-500 font-mono">{t.vehiclePlateNumber}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-amber-600 font-semibold">Unassigned Driver</span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                              t.waterTankerStatus === 'IN_TRANSIT_LIVE'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : t.waterTankerStatus === 'DELIVERED_ZERO_MORTALITY'
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {t.waterTankerStatus.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedTanker(t);
                              setDriverName(t.driverName || 'MD. Rafiqul Islam');
                              setDriverPhone(t.driverPhone || '01712998877');
                              setVehiclePlateNumber(t.vehiclePlateNumber || 'DHAKA-METRO-SH-11-2094');
                              setTargetStatus(t.waterTankerStatus);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-xs font-bold text-teal-700 dark:text-teal-300 transition-colors"
                          >
                            <span>Manage Dispatch</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: IOT SURVEILLANCE */}
      {activeTab === 'IOT_SURVEILLANCE' && (
        <div className="space-y-4">
          <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-teal-900 dark:text-teal-200 text-xs leading-relaxed flex items-start gap-3">
            <Activity className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Automated Hypoxia &amp; Water Toxicity Surveillance</div>
              Ponds reporting Dissolved Oxygen &lt; 4.0 mg/L trigger high-priority alerts with automated paddle-wheel aerator
              activation commands. Unionized Ammonia ($NH_3$) &gt; 0.05 ppm triggers water exchange and bio-floc carbon:nitrogen
              sugar dosing protocols.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {telemetry.map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-gray-900 dark:text-white text-sm">{t.pondName}</div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      t.waterQualityStatus === 'OPTIMAL'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                    }`}
                  >
                    {t.waterQualityStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-gray-500">Dissolved Oxygen</div>
                    <div className="text-base font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                      {t.dissolvedOxygenMgL.toFixed(1)} <span className="text-xs font-medium">mg/L</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-gray-500">Water Temp</div>
                    <div className="text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                      {t.waterTemperatureCelsius.toFixed(1)}°C
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-gray-500">pH Level</div>
                    <div className="text-base font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                      {t.waterPh.toFixed(1)}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-gray-500">Ammonia (NH₃)</div>
                    <div className="text-base font-extrabold text-cyan-600 dark:text-cyan-400 mt-0.5">
                      {t.ammoniaNh3Ppm.toFixed(3)} <span className="text-xs font-medium">ppm</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Wind className={`w-3.5 h-3.5 ${t.aeratorsActive ? 'text-emerald-500 animate-spin' : 'text-gray-400'}`} />
                    Aerators: {t.aeratorsActive ? 'RUNNING' : 'IDLE'}
                  </span>
                  <span>{new Date(t.recordedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tanker Dispatch Modal */}
      {selectedTanker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Update Tanker Dispatch #{selectedTanker.bookingNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTanker(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateTanker} className="mt-4 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tanker Operational Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                >
                  <option value="REQUESTED">REQUESTED</option>
                  <option value="AERATION_PREPPED">AERATION_PREPPED (Pure O₂ Charged)</option>
                  <option value="IN_TRANSIT_LIVE">IN_TRANSIT_LIVE (On Highway)</option>
                  <option value="DELIVERED_ZERO_MORTALITY">DELIVERED_ZERO_MORTALITY (Arat Handover Complete)</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Driver Full Name
                </label>
                <input
                  type="text"
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Driver Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Vehicle Plate Registration
                </label>
                <input
                  type="text"
                  required
                  value={vehiclePlateNumber}
                  onChange={(e) => setVehiclePlateNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setSelectedTanker(null)}
                  className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingTanker}
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {isUpdatingTanker ? 'Updating...' : 'Save &amp; Broadcast Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminAquacultureRegulatoryHubView;
