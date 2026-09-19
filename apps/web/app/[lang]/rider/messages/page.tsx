'use client';

import React from 'react';
import { ChatInbox } from '@/components/chat/ChatInbox';

export default function RiderMessagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Customer & Admin Messages</h1>
      </div>
      <ChatInbox />
    </div>
  );
}
