'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  DollarSign,
  Search,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Banknote,
  Users,
} from 'lucide-react';
import {
  useGetAllSettlementsAdminQuery,
  useReviewSettlementAdminMutation,
  useGetAdminActiveSessionsQuery,
  SettlementStatus,
} from '@/features/agent';

export function AdminAgentSettlementsView({ lang = 'en' }: { lang?: string }) {
  const isBn = lang === 'bn';
  const [activeTab, setActiveTab] = useState<'settlements' | 'sessions'>('settlements');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Rejection modal
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // API Queries
  const {
    data: settlementsData,
    isLoading: isSettlementsLoading,
    refetch: refetchSettlements,
  } = useGetAllSettlementsAdminQuery(
    statusFilter === 'ALL' ? undefined : (statusFilter as SettlementStatus),
  );
  const settlements = settlementsData?.data || [];

  const {
    data: sessionsData,
    isLoading: isSessionsLoading,
    refetch: refetchSessions,
  } = useGetAdminActiveSessionsQuery();
  const activeSessions = sessionsData?.data || [];

  const [reviewSettlement, { isLoading: isReviewing }] = useReviewSettlementAdminMutation();

  // Metrics
  const metrics = useMemo(() => {
    const verified = settlements
      .filter((s) => s.status === 'VERIFIED')
      .reduce((sum, s) => sum + Number(s.amount), 0);
    const pending = settlements
      .filter((s) => s.status === 'PENDING_REVIEW')
      .reduce((sum, s) => sum + Number(s.amount), 0);
    const activeDrawerTotal = activeSessions.reduce(
      (sum, s) => sum + (Number(s.openingFloat) + Number(s.cashIn) - Number(s.cashOut)),
      0,
    );

    return {
      verified,
      pending,
      activeDrawerTotal,
      activeSessionsCount: activeSessions.length,
    };
  }, [settlements, activeSessions]);

  // Filtered settlements
  const filteredSettlements = useMemo(() => {
    if (!searchQuery.trim()) return settlements;
    const q = searchQuery.toLowerCase();
    return settlements.filter(
      (s) =>
        s.settlementCode.toLowerCase().includes(q) ||
        s.channelReference.toLowerCase().includes(q) ||
        s.agent?.firstName?.toLowerCase().includes(q) ||
        s.agent?.lastName?.toLowerCase().includes(q) ||
        s.agent?.phone?.toLowerCase().includes(q),
    );
  }, [settlements, searchQuery]);

  const handleVerify = async (id: string) => {
    try {
      await reviewSettlement({
        id,
        body: { status: 'VERIFIED' },
      }).unwrap();
      refetchSettlements();
    } catch (err: any) {
      alert(err?.data?.message || err.message || 'Failed to verify deposit');
    }
  };

  const handleReject = async () => {
    if (!selectedSettlementId || !rejectionReason.trim()) return;
    try {
      await reviewSettlement({
        id: selectedSettlementId,
        body: {
          status: 'REJECTED',
          rejectionReason: rejectionReason.trim(),
        },
      }).unwrap();
      setSelectedSettlementId(null);
      setRejectionReason('');
      refetchSettlements();
    } catch (err: any) {
      alert(err?.data?.message || err.message || 'Failed to reject deposit');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {isBn
                  ? 'ইউনিয়ন ডিজিটাল সেন্টার (UDC) ও ফিল্ড এজেন্ট ক্যাশ সেটেলমেন্ট'
                  : 'Village Digital Center (UDC) Cash Settlements & Drawer Audit'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isBn
                  ? 'উপজেলা ডাকঘর ও এমএফআই শাখায় মাঠপর্যায়ের এজেন্টদের ক্যাশ ডিপোজিট স্লিপ যাচাই ও নিরীক্ষা'
                  : 'Verify field agent cash deposit vouchers from Upazila Post Offices, MFI branches & audit active drawers'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                refetchSettlements();
                refetchSessions();
              }}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('settlements')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'settlements'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Banknote className="w-4 h-4" />
            {isBn ? 'ক্যাশ ডিপোজিট স্লিপ ও সেটেলমেন্ট' : 'Cash Deposit Vouchers'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'sessions'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            {isBn ? 'সক্রিয় এজেন্ট ক্যাশ ড্রয়ার' : 'Active Field Drawers'}{' '}
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
              {metrics.activeSessionsCount}
            </span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-emerald-600 font-semibold">{isBn ? 'অনুমোদিত ডিপোজিট ক্যাশ' : 'Verified Deposits'}</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            ৳{metrics.verified.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isBn ? 'ডাকঘর ও ব্যাংকে সফল জমা' : 'Deposited in Post Office / Bank'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-amber-800 dark:text-amber-300 font-bold">
            {isBn ? 'ভেরিফিকেশন অপেক্ষমাণ ক্যাশ' : 'Pending Verification'}
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
            ৳{metrics.pending.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
            {isBn ? 'স্লিপ নিরীক্ষা প্রয়োজন' : 'Voucher review needed'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500">{isBn ? 'মাঠে সক্রিয় ড্রয়ার ক্যাশ' : 'Cash in Active Field Drawers'}</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            ৳{metrics.activeDrawerTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {metrics.activeSessionsCount} {isBn ? 'জন সক্রিয় এজেন্ট শিফট' : 'active agent shifts'}
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: SETTLEMENTS TABLE & REVIEW
          ========================================================================= */}
      {activeTab === 'settlements' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">{isBn ? 'ফিল্টার:' : 'Filter:'}</span>
              {(['ALL', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === st
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {st === 'ALL'
                    ? (isBn ? 'সকল' : 'All')
                    : st === 'PENDING_REVIEW'
                      ? (isBn ? 'অপেক্ষমাণ' : 'Pending')
                      : st === 'VERIFIED'
                        ? (isBn ? 'অনুমোদিত' : 'Verified')
                        : (isBn ? 'প্রত্যাখ্যাত' : 'Rejected')}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBn ? 'কোড বা এজেন্ট খুঁজুন...' : 'Search code or agent...'}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">{isBn ? 'ভাউচার কোড' : 'Voucher Code'}</th>
                  <th className="p-3">{isBn ? 'ফিল্ড এজেন্ট' : 'Field Agent'}</th>
                  <th className="p-3">{isBn ? 'ডিপোজিট চ্যানেল ও রেফারেন্স' : 'Channel & Ref'}</th>
                  <th className="p-3">{isBn ? 'টাকা' : 'Amount'}</th>
                  <th className="p-3">{isBn ? 'তারিখ' : 'Date'}</th>
                  <th className="p-3">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="p-3 text-right">{isBn ? 'পদক্ষেপ' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isSettlementsLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-500" />
                      {isBn ? 'লোড হচ্ছে...' : 'Loading vouchers...'}
                    </td>
                  </tr>
                ) : filteredSettlements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      {isBn ? 'কোনো ডিপোজিট ভাউচার নেই।' : 'No deposit vouchers found.'}
                    </td>
                  </tr>
                ) : (
                  filteredSettlements.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-semibold">{s.settlementCode}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {s.agent?.firstName} {s.agent?.lastName}
                        </div>
                        <div className="text-[10px] text-slate-400">{s.agent?.phone}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {s.settlementChannel}
                        </div>
                        <div className="text-[10px] text-slate-400 max-w-[200px] truncate">
                          {s.channelReference}
                        </div>
                        {s.slipReceiptUrl && (
                          <a
                            href={s.slipReceiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-emerald-600 hover:underline mt-0.5"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            {isBn ? 'স্লিপ দেখুন' : 'View Slip'}
                          </a>
                        )}
                      </td>
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        ৳{Number(s.amount).toLocaleString()}
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          s.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : s.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {s.status === 'PENDING_REVIEW' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleVerify(s.id)}
                              disabled={isReviewing}
                              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold"
                            >
                              {isBn ? 'অনুমোদন' : 'Verify'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedSettlementId(s.id)}
                              disabled={isReviewing}
                              className="px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold"
                            >
                              {isBn ? 'বাতিল' : 'Reject'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: ACTIVE SESSIONS AUDIT
          ========================================================================= */}
      {activeTab === 'sessions' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            {isBn ? 'চলতি মাঠপর্যায়ের সক্রিয় ক্যাশ ড্রয়ার শিফটসমূহ' : 'Live Active Field Drawer Sessions'}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">{isBn ? 'এজেন্ট' : 'Agent'}</th>
                  <th className="p-3">{isBn ? 'শিফট শুরুর সময়' : 'Shift Opened'}</th>
                  <th className="p-3">{isBn ? 'প্রারম্ভিক ফ্লোট' : 'Opening Float'}</th>
                  <th className="p-3">{isBn ? 'ক্যাশ জমা (+)' : 'Cash In'}</th>
                  <th className="p-3">{isBn ? 'কৃষক পরিশোধ (-)' : 'Cash Out'}</th>
                  <th className="p-3">{isBn ? 'বর্তমান নগদ ক্যাশ' : 'Current Cash'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      {isBn ? 'বর্তমানে কোনো খোলা ক্যাশ ড্রয়ার শিফট নেই।' : 'No active cash drawer sessions currently.'}
                    </td>
                  </tr>
                ) : (
                  activeSessions.map((s) => {
                    const balance =
                      Number(s.openingFloat) + Number(s.cashIn) - Number(s.cashOut);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {s.agent?.firstName} {s.agent?.lastName}
                          </div>
                          <div className="text-[10px] text-slate-400">{s.agent?.phone}</div>
                        </td>
                        <td className="p-3 text-slate-400 font-mono">
                          {new Date(s.openedAt).toLocaleString()}
                        </td>
                        <td className="p-3">৳{Number(s.openingFloat).toLocaleString()}</td>
                        <td className="p-3 font-semibold text-emerald-600">+৳{Number(s.cashIn).toLocaleString()}</td>
                        <td className="p-3 font-semibold text-rose-600">-৳{Number(s.cashOut).toLocaleString()}</td>
                        <td className="p-3 font-bold text-sm text-slate-900 dark:text-slate-100">
                          ৳{balance.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {selectedSettlementId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-rose-600 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              {isBn ? 'ডিপোজিট ভাউচার প্রত্যাখ্যান' : 'Reject Cash Deposit Voucher'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isBn
                ? 'প্রত্যাখ্যানের সঠিক কারণ উল্লেখ করুন যেন মাঠপর্যায়ের এজেন্ট পুনরায় স্লিপ জমা দিতে পারেন।'
                : 'State the rejection reason so the field agent can correct and resubmit.'}
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'প্রত্যাখ্যানের কারণ *' : 'Rejection Reason *'}
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={isBn ? 'স্লিপ নম্বর অমিল বা অস্পষ্ট ছবি...' : 'Deposit slip number mismatch or unclear receipt photo...'}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedSettlementId(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isReviewing || !rejectionReason.trim()}
                onClick={handleReject}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold"
              >
                {isReviewing
                  ? (isBn ? 'প্রত্যাখ্যাত হচ্ছে...' : 'Rejecting...')
                  : (isBn ? 'প্রত্যাখ্যান নিশ্চিত করুন' : 'Confirm Rejection')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
