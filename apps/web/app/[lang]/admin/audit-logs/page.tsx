'use client';

import React, { use } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

// Mock data for audit logs
const MOCK_LOGS = [
  { id: '1', action: 'USER_ROLE_UPDATED', user: 'Admin User', target: 'John Doe', date: '2026-09-19T10:00:00Z', details: 'Role changed from BUYER to SELLER' },
  { id: '2', action: 'PRODUCT_APPROVED', user: 'Admin User', target: 'Fresh Mangoes', date: '2026-09-18T14:30:00Z', details: 'Product marked as ACTIVE' },
  { id: '3', action: 'SETTINGS_CHANGED', user: 'Super Admin', target: 'System', date: '2026-09-17T09:15:00Z', details: 'Disabled maintenance mode' },
];

export default function AdminAuditLogsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isBn ? 'অডিট লগস' : 'Audit Logs'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isBn ? 'সিস্টেমের সকল পরিবর্তন ট্র্যাক করুন' : 'Track all system-level changes and administrative actions.'}
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
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
              {MOCK_LOGS.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(log.date).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>{log.target}</TableCell>
                  <TableCell className="text-muted-foreground">{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
