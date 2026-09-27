'use client';

import React from 'react';
import { NotificationCenterView } from './components/NotificationCenterView';

export interface CustomerNotificationsViewProps {
  lang?: string;
}

export function CustomerNotificationsView({ lang = 'bn' }: CustomerNotificationsViewProps) {
  return <NotificationCenterView lang={lang} />;
}
