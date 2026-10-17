'use client';

import React, { useState } from 'react';
import {
  Trees,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Users,
  MapPin,
  UtensilsCrossed,
  KeyRound,
  Check,
  Building,
} from 'lucide-react';
import {
  useGetAgroTourismOverviewStatsQuery,
  useGetAllAdminBookingsQuery,
  useReleaseEscrowPayoutMutation,
  FarmStayBooking,
} from '../agroTourismApi';

export const AdminAgroTourismHubView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data: statsData } = useGetAgroTourismOverviewStatsQuery();
  const { data: bookingsData, isLoading } = useGetAllAdminBookingsQuery();
  const [releasePayout, { isLoading: isReleasing }] = useReleaseEscrowPayoutMutation();

  const stats = statsData?.data;
  const bookings = bookingsData?.data || [];

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.farmStay?.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.farmStay?.district.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return b.escrowStatus === statusFilter;
  });

  const handleReleaseEscrow = async (bookingId: string) => {
    try {
      await releasePayout(bookingId).unwrap();
    } catch (err) {
      console.error('Failed to release payout', err);
    }
  };

  const totalEscrowLocked = bookings
    .filter((b) => b.escrowStatus === 'ESCROW_CONFIRMED_RESERVED')
    .reduce((sum, b) => sum + Number(b.totalAmountBdt), 0);

  const totalPayoutsReleased = bookings
    .filter((b) => b.escrowStatus === 'COMPLETED_PAYOUT_RELEASED')
    .reduce((sum, b) => sum + Number(b.totalAmountBdt), 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 rounded-3xl p-6 lg:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-emerald-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Agro-Tourism Governance &amp; Escrow Settlement (গ্রামীণ পর্যটন নিয়ন্ত্রণ ও এসক্রো)</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Nationwide Agro-Tourism Operations Hub
          </h1>
          <p className="mt-2 text-xs lg:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
            Audit rural cottage reservations, monitor guest safety, verify Union Parishad clearance certificates, and
            arbitrate escrow payouts to rural hosts across Sreemangal, Sundarbans, Jashore, Dinajpur, and Bandarban.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center min-w-[140px]">
            <div className="text-[11px] text-emerald-200">Active Bookings</div>
            <div className="text-2xl font-black text-white">{stats?.totalActiveBookings ?? 1}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center min-w-[140px]">
            <div className="text-[11px] text-emerald-200">Verified Stays</div>
            <div className="text-2xl font-black text-emerald-400">{stats?.totalFarmStays ?? 4}</div>
          </div>
        </div>
      </div>

      {/* Operational Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">TOTAL RESERVATIONS</div>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-2">
            {bookings.length} <span className="text-xs font-medium text-gray-400">Ledger</span>
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Nationwide farm stays</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">ESCROW DEPOSITS LOCKED</div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-2">
            ৳{totalEscrowLocked.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Awaiting guest check-in verification</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">PAYOUTS DISBURSED</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            ৳{totalPayoutsReleased.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Paid directly to rural hosts</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">SAFETY COMPLIANCE</div>
          <div className="text-2xl font-black text-amber-500 mt-2">100%</div>
          <div className="text-xs text-gray-500 mt-1">Union Parishad verified hosts</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search booking ref, guest name, cottage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
          >
            <option value="ALL">All Escrow Statuses</option>
            <option value="ESCROW_CONFIRMED_RESERVED">Escrow Reserved (Upcoming)</option>
            <option value="CHECKED_IN_VERIFIED">Checked-In Verified (Ready for Payout)</option>
            <option value="COMPLETED_PAYOUT_RELEASED">Payout Released (Completed)</option>
            <option value="CANCELLED_REFUNDED">Cancelled &amp; Refunded</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 text-xs">Loading reservations...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs">No bookings match the filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-5 py-3.5">Booking Ref</th>
                  <th className="px-5 py-3.5">Cottage &amp; Host</th>
                  <th className="px-5 py-3.5">Guest &amp; Dates</th>
                  <th className="px-5 py-3.5">Total &amp; Meals</th>
                  <th className="px-5 py-3.5">Escrow State</th>
                  <th className="px-5 py-3.5 text-right">Settlement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 font-medium">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30">
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-gray-900 dark:text-white">#{b.bookingNumber}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">PIN: {b.checkInPinCode}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">{b.farmStay?.titleEn}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{b.farmStay?.district} • Host: {b.farmStay?.hostName}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">{b.guestName}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {b.checkInDate} &rarr; {b.checkOutDate} ({b.nightsCount} nights, {b.adultGuestsCount} guests)
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        ৳{Number(b.totalAmountBdt).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5 capitalize">
                        {b.mealPlan.toLowerCase().replace(/_/g, ' ')}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.escrowStatus === 'COMPLETED_PAYOUT_RELEASED'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                            : b.escrowStatus === 'CHECKED_IN_VERIFIED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {b.escrowStatus.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      {b.escrowStatus === 'CHECKED_IN_VERIFIED' ? (
                        <button
                          onClick={() => handleReleaseEscrow(b.id)}
                          disabled={isReleasing}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Release Payout</span>
                        </button>
                      ) : b.escrowStatus === 'COMPLETED_PAYOUT_RELEASED' ? (
                        <span className="text-[11px] text-gray-400 font-semibold">Disbursed</span>
                      ) : (
                        <span className="text-[11px] text-amber-600 font-semibold">Awaiting Check-in</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminAgroTourismHubView;
