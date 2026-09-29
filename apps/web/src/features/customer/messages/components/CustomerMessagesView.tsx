'use client';

import React from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { PageHeader } from '@/components/common/PageHeader';

export interface CustomerMessagesViewProps {
  lang?: string;
}

export function CustomerMessagesView({ lang = 'en' }: CustomerMessagesViewProps) {
  const isBn = lang === 'bn';
  return (
    <div className="space-y-6">
      <PageHeader
        title={isBn ? 'বার্তা' : 'Messages'}
        description={
          isBn
            ? 'সেলার ও ডেলিভারি রাইডারের সাথে সরাসরি যোগাযোগ করুন।'
            : 'Chat directly with sellers and delivery riders.'
        }
      />
      <ChatInterface />
    </div>
  );
}
