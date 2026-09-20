'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  useGetCustomerDisputeDetailsQuery, 
  useAddCustomerDisputeMessageMutation 
} from '@/features/disputes/disputesApi';
import { Send, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function DisputeDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: dispute, isLoading } = useGetCustomerDisputeDetailsQuery(id);
  const [addMessage, { isLoading: isSending }] = useAddCustomerDisputeMessageMutation();
  const [message, setMessage] = useState('');
  
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

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading dispute details...</div>;
  }

  if (!dispute) {
    return <div className="p-8 text-center text-red-500">Dispute not found.</div>;
  }

  const isResolved = dispute.status === 'RESOLVED_REFUNDED' || dispute.status === 'RESOLVED_REJECTED';

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <Link href="/customer/disputes" className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft className="mr-2" /> Back to Disputes
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Dispute for Order #{dispute.orderId.slice(0, 8)}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
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
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="whitespace-pre-wrap">{dispute.description}</p>
        </div>

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
            const isMe = msg.senderId === user?.id;
            const isSystem = msg.senderRole === 'ADMIN';

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    isMe 
                      ? 'bg-primary-600 text-white rounded-br-sm' 
                      : isSystem
                      ? 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-100 rounded-bl-sm border border-yellow-200 dark:border-yellow-800/50'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-bl-sm'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 text-xs opacity-75">
                    <span className="font-semibold">{isMe ? 'You' : isSystem ? 'Support Admin' : 'Seller'}</span>
                    <span>•</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            );
          })}
          
          {(!dispute.messages || dispute.messages.length === 0) && (
            <p className="text-center text-gray-500 italic py-4">No messages yet. Send a message to the seller or admin.</p>
          )}
        </div>

        {!isResolved ? (
          <form onSubmit={handleSendMessage} className="relative">
            <textarea
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={3}
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSending}
            ></textarea>
            <button
              type="submit"
              disabled={isSending || !message.trim()}
              className="absolute right-3 bottom-3 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
