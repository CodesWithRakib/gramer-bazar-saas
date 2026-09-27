'use client';

import React from 'react';
import { NotificationCenterView } from '@/features/notifications/components/NotificationCenterView';

export interface CustomerNotificationsViewProps {
  lang?: string;
}

export function CustomerNotificationsView({ lang = 'bn' }: CustomerNotificationsViewProps) {
  return <NotificationCenterView lang={lang} />;
}
