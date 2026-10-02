'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, ShieldCheck, ShieldX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getBroadcastDictionary } from '@/lib/broadcast-i18n';
import { useGetAudienceSegmentsQuery, useSearchCustomersQuery } from '../broadcastApi';

export interface BroadcastAudienceViewProps {
  lang?: string;
}

export function BroadcastAudienceView({ lang = 'en' }: BroadcastAudienceViewProps) {
  const t = getBroadcastDictionary(lang);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const { data: segments } = useGetAudienceSegmentsQuery();
  const { data: customers, isFetching } = useSearchCustomersQuery(
    { search: query || undefined, limit: 15 },
    { skip: !query },
  );

  const segmentTypes = segments
    ? Object.entries(segments.byAudienceType)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${lang}/super-admin/broadcast`}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t.audience.title}</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t.audience.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-xs text-muted-foreground">{t.audience.totalCustomers}</p>
          <p className="mt-1 text-2xl font-bold">{segments?.segments.totalCustomers ?? '—'}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            {t.audience.optedIn}
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {segments?.segments.optedInCustomers ?? '—'}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldX className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
            {t.audience.optedOut}
          </p>
          <p className="mt-1 text-2xl font-bold text-destructive">
            {segments?.segments.optedOutCustomers ?? '—'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">{t.audience.segments}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {segmentTypes.length === 0 && (
            <p className="text-sm text-muted-foreground">{t.templates.empty}</p>
          )}
          {segmentTypes.map(([type, count]) => (
            <div key={type} className="flex items-center justify-between rounded-xl border p-3">
              <span className="text-sm">
                {t.audience.types[type as keyof typeof t.audience.types] ?? type}
              </span>
              <Badge variant="secondary">{count}</Badge>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{t.audience.areaNote}</p>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">{t.audience.selectedCustomers}</h2>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(search.trim());
          }}
        >
          <div className="relative flex-1">
            <Search
              className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.audience.searchCustomers}
              className="ps-9"
            />
          </div>
          <Button type="submit" disabled={isFetching}>
            {t.audience.searchCustomers}
          </Button>
        </form>

        {query && (
          <ul className="mt-4 divide-y">
            {(customers ?? []).map((customer) => (
              <li key={customer.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{customer.name ?? customer.phone}</p>
                  <p className="text-xs text-muted-foreground">{customer.phone}</p>
                </div>
                {customer.marketingOptIn ? (
                  <Badge variant="secondary">{t.audience.optedIn}</Badge>
                ) : (
                  <Badge variant="destructive">{t.audience.optedOut}</Badge>
                )}
              </li>
            ))}
            {customers && customers.length === 0 && (
              <li className="py-4 text-sm text-muted-foreground">{t.audience.noSample}</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default BroadcastAudienceView;
