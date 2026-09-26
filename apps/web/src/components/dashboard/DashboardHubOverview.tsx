'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface HubCardItem {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  icon: LucideIcon;
  href: string;
  badge?: string;
  badgeBn?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  isExternal?: boolean;
}

export interface DashboardHubOverviewProps {
  lang: string;
  sectionTag?: string;
  sectionTagBn?: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  cards: HubCardItem[];
  basePath?: string;
}

export function DashboardHubOverview({
  lang,
  sectionTag,
  sectionTagBn,
  title,
  titleBn,
  description,
  descriptionBn,
  cards,
  basePath = '',
}: DashboardHubOverviewProps) {
  const isBn = lang === 'bn';

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <header className="mb-6">
        {(sectionTag || sectionTagBn) && (
          <span className="text-primary mb-1.5 block text-xs font-bold tracking-wider uppercase">
            {isBn ? sectionTagBn || sectionTag : sectionTag}
          </span>
        )}
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          {isBn ? titleBn : title}
        </h1>
        <p className="mt-1.5 text-sm md:text-[15px] text-muted-foreground leading-relaxed max-w-3xl">
          {isBn ? descriptionBn : description}
        </p>
      </header>

      {/* Grid of Hub Cards */}
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          const fullHref = card.href.startsWith('/')
            ? `/${lang}${card.href}`
            : `/${lang}${basePath}/${card.href}`;

          return (
            <Link key={card.id} href={fullHref} className="group block focus:outline-none">
              <Card className="h-full cursor-pointer rounded-xl border bg-card p-5 md:p-6 transition-colors duration-150 hover:border-primary/50">
                <CardContent className="flex h-full flex-col p-0 justify-between">
                  <div>
                    {/* Top Row: Icon & Chevron & Optional Badge */}
                    <div className="mb-4 flex w-full items-start justify-between">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-5 w-5" strokeWidth={2} />
                      </div>

                      <div className="flex items-center gap-2">
                        {card.badge && (
                          <Badge
                            variant={card.badgeVariant || 'secondary'}
                            className="text-[10px] font-semibold py-0.5 px-2"
                          >
                            {isBn ? card.badgeBn || card.badge : card.badge}
                          </Badge>
                        )}
                        <ChevronRight className="h-5 w-5 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
                    </div>

                    {/* Title */}
                    <CardTitle className="mb-1.5 text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {isBn ? card.titleBn : card.title}
                    </CardTitle>

                    {/* Description */}
                    <CardDescription className="text-xs md:text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {isBn ? card.descriptionBn : card.description}
                    </CardDescription>
                  </div>

                  {/* Bottom link hint */}
                  <div className="pt-4 mt-2 border-t border-border/40 flex items-center text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>{isBn ? 'প্রবেশ করুন' : 'Manage & View'}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </main>
    </div>
  );
}

export default DashboardHubOverview;
