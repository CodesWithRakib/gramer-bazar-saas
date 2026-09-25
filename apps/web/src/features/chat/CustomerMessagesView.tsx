'use client';

import React from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';

export interface CustomerMessagesViewProps {
  lang?: string;
}

export function CustomerMessagesView({ lang = 'en' }: CustomerMessagesViewProps) {
  const isBn = lang === 'bn';
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{isBn ? 'মেসেজ' : 'Messages'}</h1>
        <p className="text-muted-foreground">{isBn ? 'সেলার ও ডেলিভারি রাইডারদের সাথে যোগাযোগ করুন।' : 'Chat with sellers and delivery riders.'}</p>
      </div>
      <ChatInterface />
    </div>
  );
}
