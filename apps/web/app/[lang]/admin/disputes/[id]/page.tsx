'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  useGetAdminDisputeDetailsQuery, 
  useAddAdminDisputeMessageMutation,
  useResolveDisputeMutation,
  DisputeStatus
} from '@/features/disputes/disputesApi';
import { Send, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function AdminDisputeDetailsPage() {
  const { id } = useParams() as { id: string };
  const { data: dispute, isLoading } = useGetAdminDisputeDetailsQuery(id);
  const [addMessage, { isLoading: isSending }] = useAddAdminDisputeMessageMutation();
  const [resolveDispute, { isLoading: isResolving }] = useResolveDisputeMutation();
  
  const [message, setMessage] = useState('');
  const [adminDecision, setAdminDecision] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState<DisputeStatus.RESOLVED_REFUNDED | DisputeStatus.RESOLVED_REJECTED>(DisputeStatus.RESOLVED_REFUNDED);
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  
  const user = useSelector((state: RootState) => state.auth.user);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await addMessage({ id, message }).unwrap();
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminDecision.trim()) {
      alert('Please provide a decision explanation.');
      return;
    }

    try {
      await resolveDispute({ id, status: resolutionStatus, adminDecision }).unwrap();
      setShowResolutionForm(false);
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
      alert('Failed to resolve dispute. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading dispute details...</div>;
  }

  if (!dispute) {
    return <div className="p-8 text-center text-red-500">Dispute not found.</div>;
  }

  const isResolved = dispute.status === 'RESOLVED_REFUNDED' || dispute.status === 'RESOLVED_REJECTED';

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-4">
        <Link href="/admin/disputes" className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <ArrowLeft className="mr-2" /> Back to Disputes
        </Link>
        
        {!isResolved && !showResolutionForm && (
          <button 
            onClick={() => setShowResolutionForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            Resolve Dispute
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Dispute for Order #{dispute.orderId.slice(0, 8)}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Customer:</span> {dispute.customer?.firstName} {dispute.customer?.lastName}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Seller:</span> {dispute.seller?.firstName} {dispute.seller?.lastName}
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
                : dispute.status === 'RESOLVED_REFUNDED'
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
          <form onSubmit={handleResolve} className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-xl mb-4 text-gray-900 dark:text-white">Resolve Dispute</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resolution</label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    className="mr-2 text-primary-600 focus:ring-primary-500" 
                    name="resolution" 
                    checked={resolutionStatus === DisputeStatus.RESOLVED_REFUNDED}
                    onChange={() => setResolutionStatus(DisputeStatus.RESOLVED_REFUNDED)}
                  />
                  <span className="text-gray-800 dark:text-gray-200">Refund Customer</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    className="mr-2 text-red-600 focus:ring-red-500" 
                    name="resolution" 
                    checked={resolutionStatus === DisputeStatus.RESOLVED_REJECTED}
                    onChange={() => setResolutionStatus(DisputeStatus.RESOLVED_REJECTED)}
                  />
                  <span className="text-gray-800 dark:text-gray-200">Reject Dispute (Funds to Seller)</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Admin Decision / Explanation</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Explain the reason for this decision..."
                value={adminDecision}
                onChange={(e) => setAdminDecision(e.target.value)}
                required
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

        {dispute.adminDecision && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 flex items-center mb-2">
              {dispute.status === 'RESOLVED_REFUNDED' ? <CheckCircle className="mr-2" /> : <AlertCircle className="mr-2" />}
              Admin Decision
            </h3>
            <p className="text-blue-900 dark:text-blue-200">{dispute.adminDecision}</p>
          </div>
        )}

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
                    <span className="font-semibold">{isMe ? 'You (Admin)' : msg.senderRole === 'CUSTOMER' ? 'Customer' : 'Seller'}</span>
                    <span>•</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            );
          })}
          
          {(!dispute.messages || dispute.messages.length === 0) && (
            <p className="text-center text-gray-500 italic py-4">No messages yet. Send a message as an Admin.</p>
          )}
        </div>

        {!isResolved ? (
          <form onSubmit={handleSendMessage} className="relative">
            <textarea
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
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
