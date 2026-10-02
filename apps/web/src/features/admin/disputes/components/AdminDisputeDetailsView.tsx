'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useGetAdminDisputeDetailsQuery,
  useAddAdminDisputeMessageMutation,
  useResolveDisputeMutation,
  useRejectDisputeMutation,
  useAddInternalNoteMutation,
  DisputeStatus,
} from '@/features/disputes/disputesApi';
import { Send, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { customToast as toast } from '@/components/ui/custom-toast';
import { BackButton } from '@/components/common/BackButton';

export interface AdminDisputeDetailsViewProps {
  lang?: string;
  id: string;
  namespace?: 'admin' | 'super-admin';
}

export function AdminDisputeDetailsView({
  lang = 'en',
  id,
  namespace = 'admin',
}: AdminDisputeDetailsViewProps) {
  // id is passed from server component props
  const { data: dispute, isLoading } = useGetAdminDisputeDetailsQuery(id);
  const [addMessage, { isLoading: isSending }] = useAddAdminDisputeMessageMutation();
  const [resolveDispute, { isLoading: isResolving }] = useResolveDisputeMutation();

  const [rejectDispute, { isLoading: isRejecting }] = useRejectDisputeMutation();
  const [addInternalNoteMutation, { isLoading: isAddingNote }] = useAddInternalNoteMutation();

  const [message, setMessage] = useState('');
  const [adminDecision, setAdminDecision] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [refundAmount, setRefundAmount] = useState<number | ''>('');
  
  const [resolutionType, setResolutionType] = useState('FULL_REFUND');
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [newInternalNote, setNewInternalNote] = useState('');

  void useSelector((state: RootState) => state.auth.user);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await addMessage({ id, message }).unwrap();
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(
        lang === 'bn' ? 'বার্তা পাঠাতে সমস্যা হয়েছে' : 'Failed to send message. Please try again.'
      );
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminDecision.trim()) {
      toast.error(
        lang === 'bn'
          ? 'সিদ্ধান্তের বিস্তারিত ব্যাখ্যা দিন।'
          : 'Please provide a decision explanation.'
      );
      return;
    }

    try {
      await resolveDispute({ 
        id, 
        resolutionType, 
        adminDecision, 
        internalNote: internalNote || undefined,
        refundAmount: refundAmount === '' ? undefined : Number(refundAmount) 
      }).unwrap();
      
      setShowResolutionForm(false);
      setAdminDecision('');
      setInternalNote('');
      setRefundAmount('');
      toast.success(lang === 'bn' ? 'সফলভাবে মীমাংসা হয়েছে' : 'Dispute resolved successfully');
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
      toast.error(
        lang === 'bn'
          ? 'বিরোধ মীমাংসা ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'
          : 'Failed to resolve dispute. Please try again.'
      );
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminDecision.trim()) {
      toast.error(
        lang === 'bn'
          ? 'বাতিলের কারণ দিন।'
          : 'Please provide a reason for rejection.'
      );
      return;
    }

    try {
      await rejectDispute({ 
        id, 
        reason: adminDecision, 
        internalNote: internalNote || undefined 
      }).unwrap();
      
      setShowRejectForm(false);
      setAdminDecision('');
      setInternalNote('');
      toast.success(lang === 'bn' ? 'সফলভাবে বাতিল হয়েছে' : 'Dispute rejected successfully');
    } catch (error) {
      console.error('Failed to reject dispute:', error);
      toast.error(
        lang === 'bn'
          ? 'বাতিল করা ব্যর্থ হয়েছে।'
          : 'Failed to reject dispute.'
      );
    }
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInternalNote.trim()) return;

    try {
      await addInternalNoteMutation({ id, note: newInternalNote }).unwrap();
      setNewInternalNote('');
      toast.success(lang === 'bn' ? 'নোট যুক্ত করা হয়েছে' : 'Internal note added');
    } catch (error) {
      console.error('Failed to add internal note:', error);
      toast.error(
        lang === 'bn'
          ? 'নোট যুক্ত করা ব্যর্থ হয়েছে।'
          : 'Failed to add internal note.'
      );
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading dispute details...</div>;
  }

  if (!dispute) {
    return <div className="p-8 text-center text-red-500">Dispute not found.</div>;
  }

  const isResolved =
    dispute.status === 'RESOLVED' || dispute.status === 'REJECTED' || dispute.status === 'CANCELLED';

  const isBn = lang === 'bn';

  const formatCurrency = (amount: number) => {
    return isBn ? `৳${amount.toLocaleString('bn-BD')}` : `৳${amount.toLocaleString('en-US')}`;
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center mb-4">
        <BackButton
          href={`/${lang}/${namespace}/disputes/list`}
          label="Back to Disputes List"
          labelBn="বিরোধ তালিকায় ফিরে যান"
          lang={lang}
        />

        {!isResolved && !showResolutionForm && !showRejectForm && (
          <div className="flex gap-2">
            <button
              onClick={() => { setShowRejectForm(true); setShowResolutionForm(false); }}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium border border-red-200"
            >
              {lang === 'bn' ? 'বাতিল করুন' : 'Reject Dispute'}
            </button>
            <button
              onClick={() => { setShowResolutionForm(true); setShowRejectForm(false); }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              {lang === 'bn' ? 'মীমাংসা করুন' : 'Resolve Dispute'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Dispute for Order #{dispute.orderId.slice(0, 8)}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Customer:</span> {dispute.customer?.firstName}{' '}
              {dispute.customer?.lastName}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Seller:</span> {dispute.seller?.firstName}{' '}
              {dispute.seller?.lastName}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              <span className="font-semibold">Reason:</span> {dispute.reason.replace(/_/g, ' ')}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Opened on {new Date(dispute.createdAt).toLocaleString()}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              dispute.status === 'OPEN'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                : dispute.status === 'UNDER_REVIEW'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : dispute.status === 'RESOLVED'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {dispute.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 mb-6 text-gray-800 dark:text-gray-200">
          <h3 className="font-semibold mb-2">Customer Description</h3>
          <p className="whitespace-pre-wrap">{dispute.description}</p>
        </div>

        {showResolutionForm && (
          <form
            onSubmit={handleResolve}
            className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6"
          >
            <h3 className="font-semibold text-xl mb-4 text-gray-900 dark:text-white">
              {lang === 'bn' ? 'মীমাংসা' : 'Resolve Dispute'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resolution Type
                </label>
                <select
                  value={resolutionType}
                  onChange={(e) => setResolutionType(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="FULL_REFUND">Full Refund</option>
                  <option value="PARTIAL_REFUND">Partial Refund</option>
                  <option value="REPLACEMENT">Replacement</option>
                  <option value="NO_REFUND">No Refund</option>
                </select>
              </div>

              {(resolutionType === 'FULL_REFUND' || resolutionType === 'PARTIAL_REFUND') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Refund Amount (Max {formatCurrency(Number(dispute.order?.total || 0))})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    max={Number(dispute.order?.total || 0)}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Enter amount"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Public Message to Customer & Seller
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={2}
                placeholder="Explain the resolution decision..."
                value={adminDecision}
                onChange={(e) => setAdminDecision(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Internal Note (Visible to Admins only)
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={2}
                placeholder="Add any internal remarks..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
              ></textarea>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResolutionForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                disabled={isResolving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                disabled={isResolving}
              >
                {isResolving ? 'Resolving...' : 'Confirm Resolution'}
              </button>
            </div>
          </form>
        )}

        {showRejectForm && (
          <form
            onSubmit={handleReject}
            className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6"
          >
            <h3 className="font-semibold text-xl mb-4 text-gray-900 dark:text-white">
              {lang === 'bn' ? 'বাতিল' : 'Reject Dispute'}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rejection Reason (Visible to Customer & Seller)
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={2}
                placeholder="Explain why the dispute is rejected..."
                value={adminDecision}
                onChange={(e) => setAdminDecision(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Internal Note (Visible to Admins only)
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={2}
                placeholder="Add any internal remarks..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
              ></textarea>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRejectForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                disabled={isRejecting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={isRejecting}
              >
                {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        )}

        {dispute.adminDecision && (
          <div className={`${dispute.status === 'RESOLVED' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'} border rounded-lg p-4 mb-6`}>
            <h3 className={`font-semibold ${dispute.status === 'RESOLVED' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'} flex items-center mb-2`}>
              {dispute.status === 'RESOLVED' ? (
                <CheckCircle className="me-2" />
              ) : (
                <AlertCircle className="me-2" />
              )}
              {dispute.status === 'RESOLVED' ? 'Resolution Decision' : 'Rejection Reason'}
            </h3>
            <p className="text-gray-800 dark:text-gray-200 mb-2">{dispute.adminDecision}</p>
            {dispute.status === 'RESOLVED' && dispute.resolutionType && (
              <div className="mt-3 text-sm flex gap-4">
                <span className="font-medium text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700 bg-white dark:bg-green-950 px-2 py-1 rounded">
                  {dispute.resolutionType.replace(/_/g, ' ')}
                </span>
                {dispute.refundAmount != null && (
                  <span className="font-medium text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700 bg-white dark:bg-green-950 px-2 py-1 rounded">
                    Refund: {formatCurrency(Number(dispute.refundAmount))}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Internal Notes Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Internal Admin Notes</h2>
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
            {dispute.internalNotes && dispute.internalNotes.length > 0 ? (
              <ul className="space-y-3">
                {dispute.internalNotes.map((note) => (
                  <li key={note.id} className="bg-white dark:bg-gray-750 p-3 rounded shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                      <span className="font-medium">{note.createdBy?.firstName} {note.createdBy?.lastName}</span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{note.note}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No internal notes added yet.</p>
            )}

            <form onSubmit={handleAddInternalNote} className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Add a new internal note..."
                value={newInternalNote}
                onChange={(e) => setNewInternalNote(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                disabled={isAddingNote}
              />
              <button
                type="submit"
                disabled={isAddingNote || !newInternalNote.trim()}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 font-medium text-sm"
              >
                Add Note
              </button>
            </form>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-700 my-8" />

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Message Thread</h2>

        <div className="space-y-6 mb-8">
          {dispute.messages?.map((msg) => {
            const isMe = msg.senderRole === 'ADMIN';

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    isMe
                      ? 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-100 rounded-br-sm border border-yellow-200 dark:border-yellow-800/50'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-bl-sm'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 text-xs opacity-75">
                    <span className="font-semibold">
                      {isMe ? 'You (Admin)' : msg.senderRole === 'CUSTOMER' ? 'Customer' : 'Seller'}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            );
          })}

          {(!dispute.messages || dispute.messages.length === 0) && (
            <p className="text-center text-gray-500 italic py-4">
              No messages yet. Send a message as an Admin.
            </p>
          )}
        </div>

        {!isResolved ? (
          <form onSubmit={handleSendMessage} className="relative">
            <textarea
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pe-12 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              rows={3}
              placeholder="Type your reply as Admin..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSending}
            ></textarea>
            <button
              type="submit"
              disabled={isSending || !message.trim()}
              className="absolute right-3 bottom-3 p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send />
            </button>
          </form>
        ) : (
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-500 border border-gray-200 dark:border-gray-700">
            This dispute has been resolved and is now closed.
          </div>
        )}
      </div>
    </div>
  );
}
