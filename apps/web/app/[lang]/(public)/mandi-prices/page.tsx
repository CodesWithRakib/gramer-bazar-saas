'use client';

import React, { use } from 'react';
import { MandiPriceTrackerView } from '@/features/agri-intelligence';

export default function MandiPricesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  return <MandiPriceTrackerView lang={lang} />;
}
