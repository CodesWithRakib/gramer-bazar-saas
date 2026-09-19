'use client';

import React from 'react';
import { ChatInbox } from '@/components/chat/ChatInbox';

export default function CustomerMessagesPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Messages</h1>
      </div>
      <ChatInbox />
    </div>
  );
}
