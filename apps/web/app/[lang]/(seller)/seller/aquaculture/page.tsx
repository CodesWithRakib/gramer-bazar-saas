'use client';

import React, { useState } from 'react';
import {
  Fish,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { HatcheryManagerView, PondTelemetryDashboardView } from '@/features/aquaculture';

export default function SellerAquaculturePage() {
  const [activeSection, setActiveSection] = useState<'HATCHERY' | 'POND_IOT'>('HATCHERY');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Navigation switcher */}
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm w-fit">
        <button
          onClick={() => setActiveSection('HATCHERY')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeSection === 'HATCHERY'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>হ্যাচারি ও নার্সারি ব্যাচ স্টক (Hatchery Inventory)</span>
        </button>

        <button
          onClick={() => setActiveSection('POND_IOT')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeSection === 'POND_IOT'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>পুকুর ও বায়োফ্লক আইওটি ড্যাশবোর্ড (IoT &amp; FCR Analytics)</span>
        </button>
      </div>

      {/* Render active section */}
      {activeSection === 'HATCHERY' ? <HatcheryManagerView /> : <PondTelemetryDashboardView />}
    </div>
  );
}
