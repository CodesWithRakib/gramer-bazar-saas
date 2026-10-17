'use client';

import React, { useState } from 'react';
import {
  Tractor,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Filter,
  RefreshCw,
  Search,
  Scale,
  FileText,
  Clock,
  DollarSign,
} from 'lucide-react';
import {
  useGetAdminMachineryBookingsQuery,
  useResolveMachineryDepositMutation,
  MachineryBooking,
  BookingStatus,
} from '../machineryApi';

export function AdminMachineryView({ lang = 'en' }: { lang?: string }) {
  const isBn = lang === 'bn';

  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [selectedDisputedBooking, setSelectedDisputedBooking] = useState<MachineryBooking | null>(null);

  const [refundDepositAmount, setRefundDepositAmount] = useState<number>(0);
  const [deductDamageAmount, setDeductDamageAmount] = useState<number>(0);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [resolutionError, setResolutionError] = useState<string | null>(null);

  const { data: bookings = [], isLoading, isFetching, refetch } = useGetAdminMachineryBookingsQuery(
    statusFilter === 'ALL' ? undefined : { status: statusFilter },
  );

  const [resolveDeposit, { isLoading: isResolving }] = useResolveMachineryDepositMutation();

  const handleOpenDisputeModal = (booking: MachineryBooking) => {
    setSelectedDisputedBooking(booking);
    // default: refund full or split 50/50
    const totalDeposit = booking.securityDeposit || 0;
    setRefundDepositAmount(totalDeposit);
    setDeductDamageAmount(0);
    setAdminNotes('');
    setResolutionError(null);
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDisputedBooking) return;

    if (!adminNotes.trim()) {
      setResolutionError(isBn ? 'সালিশী সিদ্ধান্ত ও নোট প্রদান করুন।' : 'Please provide resolution notes.');
      return;
    }

    try {
      await resolveDeposit({
        id: selectedDisputedBooking.id,
        refundDepositAmount: Number(refundDepositAmount),
        deductDamageAmount: Number(deductDamageAmount),
        adminNotes: adminNotes.trim(),
      }).unwrap();

      setSelectedDisputedBooking(null);
    } catch (err: any) {
      setResolutionError(err?.data?.message || 'Failed to resolve dispute');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-emerald-600" />
            <span>{isBn ? 'কৃষি যন্ত্রপাতি ও এসক্রো জামানত সালিশী হাব' : 'Machinery Rental & Escrow Dispute Hub'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isBn
              ? 'সারা দেশের কৃষি যন্ত্রপাতি বুকিং পর্যবেক্ষণ, ক্ষতিপূরণ দাবি নিষ্পত্তি ও এসক্রো তহবিল ব্যবস্থাপনা।'
              : 'Nationwide machinery fleet booking supervision, damage dispute arbitration, and escrow settlement.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {(['ALL', 'DISPUTED', 'IN_PROGRESS', 'CONFIRMED', 'COMPLETED'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              statusFilter === st
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Bookings Table / Cards */}
      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Tractor className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-xs text-slate-500">No machinery bookings found in this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border transition ${
                booking.status === 'DISPUTED'
                  ? 'border-rose-300 dark:border-rose-900 bg-rose-50/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-600">{booking.bookingReference}</span>
                  <span className="text-xs text-slate-500">|</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {booking.machinery?.titleEn}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      booking.status === 'DISPUTED'
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : booking.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {booking.status}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Farmer / Renter:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {booking.renterName} ({booking.renterPhone})
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block">Owner / Co-op:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {booking.machinery?.owner?.firstName || 'Owner'} ({booking.machinery?.owner?.phone})
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block">Location:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {booking.plotUpazila}, {booking.plotDistrict} ({booking.plotSizeValue} Units)
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block">Grand Total / Deposit:</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    ৳{booking.grandTotal.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-teal-600 block">
                    Deposit: ৳{booking.securityDeposit}
                  </span>
                </div>
              </div>

              {booking.notes && (
                <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg font-mono">
                  {booking.notes}
                </p>
              )}

              {/* Action Button for Disputes */}
              {booking.status === 'DISPUTED' && (
                <div className="mt-3 pt-2 border-t border-rose-200 dark:border-rose-900/60 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenDisputeModal(booking)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>{isBn ? 'সালিশী বিরোধ নিষ্পত্তি করুন' : 'Arbitrate & Settle Escrow'}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dispute Resolution Modal */}
      {selectedDisputedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Scale className="w-5 h-5 text-rose-600" />
              <span>{isBn ? 'এসক্রো জামানত সালিশী সিদ্ধান্ত' : 'Arbitrate Machinery Damage Dispute'}</span>
            </h3>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs mb-4 space-y-1">
              <div>Booking Ref: <strong className="font-mono text-emerald-600">{selectedDisputedBooking.bookingReference}</strong></div>
              <div>Farmer Renter: <strong>{selectedDisputedBooking.renterName}</strong></div>
              <div>Total Escrow Hold: <strong className="text-teal-600">৳{selectedDisputedBooking.securityDeposit}</strong></div>
            </div>

            {resolutionError && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs mb-3">
                {resolutionError}
              </div>
            )}

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Refund to Farmer (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedDisputedBooking.securityDeposit}
                    required
                    value={refundDepositAmount}
                    onChange={(e) => setRefundDepositAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Award to Owner (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedDisputedBooking.securityDeposit}
                    required
                    value={deductDamageAmount}
                    onChange={(e) => setDeductDamageAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-rose-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Arbitration Reason & Verification Notes
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Field inspection confirmed cutter blade wear normal, ৳500 awarded to owner for hydraulic tube replacement, remaining refunded to farmer."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isResolving}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition"
                >
                  {isResolving ? 'নিষ্পত্তি হচ্ছে...' : 'এসক্রো তহবিল নিষ্পত্তি করুন'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDisputedBooking(null)}
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
