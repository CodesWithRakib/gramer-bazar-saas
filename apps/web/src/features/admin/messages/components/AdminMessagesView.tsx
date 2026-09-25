'use client';

import React from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';

export interface AdminMessagesViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function AdminMessagesView({ lang = 'en' }: AdminMessagesViewProps) {
  const isBn = lang === 'bn';
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{isBn ? 'মেসেজ ও বার্তালাপ' : 'Messages'}</h1>
        <p className="text-muted-foreground">
          {isBn
            ? 'প্ল্যাটফর্মের সকল ব্যবহারকারীদের সাথে বার্তা আদান-প্রদান ও সমাধান করুন।'
            : 'Manage and resolve conversations with users across the platform.'}
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
