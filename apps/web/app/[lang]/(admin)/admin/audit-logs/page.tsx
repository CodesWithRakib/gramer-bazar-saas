'use client';

import React, { use, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGetAuditLogsQuery } from '@/features/audit-logs/auditLogsApi';
import { Loader2, ScrollText, Search } from 'lucide-react';

export default function AdminAuditLogsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useGetAuditLogsQuery({
    page,
    limit: 20,
    search: search || undefined,
  });

  const logs = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isBn ? 'অডিট লগস' : 'Audit Logs'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isBn
            ? 'সিস্টেমের সকল পরিবর্তন ট্র্যাক করুন'
            : 'Track all system-level changes and administrative actions.'}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={isBn ? 'লগ খুঁজুন...' : 'Search logs...'}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : isError ? (
            <div className="py-16 text-center text-destructive">
              {isBn
                ? 'লগ লোড করা যায়নি। পরে আবার চেষ্টা করুন।'
                : 'Failed to load audit logs. Please try again.'}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ScrollText className="h-10 w-10 mb-3 opacity-30" />
              <p>{isBn ? 'কোনো অডিট লগ নেই' : 'No audit logs found'}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? 'তারিখ' : 'Date'}</TableHead>
                  <TableHead>{isBn ? 'অ্যাকশন' : 'Action'}</TableHead>
                  <TableHead>{isBn ? 'ইউজার' : 'Performed By'}</TableHead>
                  <TableHead>{isBn ? 'টার্গেট' : 'Target'}</TableHead>
                  <TableHead>{isBn ? 'বিস্তারিত' : 'Details'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString(
                        isBn ? 'bn-BD' : 'en-US',
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.actorName || (isBn ? 'সিস্টেম' : 'System')}
                    </TableCell>
                    <TableCell>{log.targetType || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.details || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isBn ? 'পৃষ্ঠা' : 'Page'} {meta.page} / {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {isBn ? 'পূর্ববর্তী' : 'Previous'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {isBn ? 'পরবর্তী' : 'Next'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
