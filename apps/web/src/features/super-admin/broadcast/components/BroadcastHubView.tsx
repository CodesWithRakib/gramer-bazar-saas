'use client';

import React from 'react';
import Link from 'next/link';
import { Megaphone, FileText, PlusCircle, Users, ShieldAlert, ArrowRight } from 'lucide-react';

import { getBroadcastDictionary } from '@/lib/broadcast-i18n';
import { useGetAudienceSegmentsQuery } from '../broadcastApi';

export interface BroadcastHubViewProps {
  lang?: string;
}

export function BroadcastHubView({ lang = 'en' }: BroadcastHubViewProps) {
  const t = getBroadcastDictionary(lang);
  const base = `/${lang}/super-admin/broadcast`;
  const { data: segments } = useGetAudienceSegmentsQuery();

  const cards = [
    {
      href: `${base}/templates`,
      icon: FileText,
      title: t.cards.templatesTitle,
      description: t.cards.templatesDesc,
    },
    {
      href: `${base}/campaigns`,
      icon: Megaphone,
      title: t.cards.campaignsTitle,
      description: t.cards.campaignsDesc,
    },
    {
      href: `${base}/campaigns/new`,
      icon: PlusCircle,
      title: t.cards.newCampaignTitle,
      description: t.cards.newCampaignDesc,
    },
    {
      href: `${base}/audience`,
      icon: Users,
      title: t.cards.audienceTitle,
      description: t.cards.audienceDesc,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            {t.mockWarningTitle}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400">{t.mockWarning}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-xs text-muted-foreground">{t.audience.totalCustomers}</p>
          <p className="mt-1 text-2xl font-bold">{segments?.segments.totalCustomers ?? '—'}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-xs text-muted-foreground">{t.audience.optedIn}</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {segments?.segments.optedInCustomers ?? '—'}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-xs text-muted-foreground">{t.audience.optedOut}</p>
          <p className="mt-1 text-2xl font-bold text-destructive">
            {segments?.segments.optedOutCustomers ?? '—'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group flex items-start justify-between gap-3 rounded-2xl border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{card.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{card.description}</p>
                </div>
              </div>
              <ArrowRight
                className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180"
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default BroadcastHubView;
