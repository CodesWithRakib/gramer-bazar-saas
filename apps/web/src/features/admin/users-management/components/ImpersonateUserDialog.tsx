'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AlertTriangle } from 'lucide-react';

import type { AppDispatch } from '@/store/store';
import { setCredentials } from '@/store/slices/authSlice';
import { cn } from '@/lib/utils';
import { getImpersonationDictionary } from '@/lib/impersonation-i18n';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { customToast } from '@/components/ui/custom-toast';
import {
  useStartImpersonationMutation,
  type ImpersonationReason,
} from '@/features/impersonation';
import type { User } from '@/features/users/usersApi';
import {
  getPrimaryImpersonationRole,
  ROLE_DASHBOARD,
} from '@/features/users/impersonationEligibility';

const REASON_ORDER: ImpersonationReason[] = [
  'QA_TESTING',
  'BUG_INVESTIGATION',
  'CUSTOMER_SUPPORT',
  'ACCOUNT_VERIFICATION',
  'TROUBLESHOOTING',
  'OTHER',
];

export interface ImpersonateUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lang: string;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object' && 'message' in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === 'string') return message;
      if (Array.isArray(message) && typeof message[0] === 'string') return message[0];
    }
  }
  return fallback;
}

export function ImpersonateUserDialog({
  user,
  open,
  onOpenChange,
  lang,
}: ImpersonateUserDialogProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const t = getImpersonationDictionary(lang);

  const [reason, setReason] = useState<ImpersonationReason>('BUG_INVESTIGATION');
  const [reasonNote, setReasonNote] = useState('');
  const [startImpersonation, { isLoading }] = useStartImpersonationMutation();

  const role = getPrimaryImpersonationRole(user);
  const displayName =
    `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.phone || user.id;

  const handleOpenChange = (next: boolean) => {
    if (!next && isLoading) return;
    if (!next) {
      setReasonNote('');
      setReason('BUG_INVESTIGATION');
    }
    onOpenChange(next);
  };

  const handleConfirm = async () => {
    if (reason === 'OTHER' && !reasonNote.trim()) {
      customToast.error(t.reasonNotePlaceholder);
      return;
    }

    try {
      const result = await startImpersonation({
        userId: user.id,
        reason,
        reasonNote: reason === 'OTHER' ? reasonNote.trim() : undefined,
      }).unwrap();

      dispatch(
        setCredentials({
          user: result.user,
          accessToken: result.accessToken,
        })
      );
      customToast.success(t.started);
      handleOpenChange(false);

      const dashboard = role ? ROLE_DASHBOARD[role] : 'customer';
      router.push(`/${lang}/${dashboard}`);
    } catch (error) {
      customToast.error(extractErrorMessage(error, t.errorStart));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-start">
            <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
            {t.title}
          </DialogTitle>
          <DialogDescription className="text-start leading-relaxed">
            {t.warning}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
          <p className="font-semibold text-foreground break-words">{displayName}</p>
          <p className="text-xs text-muted-foreground">{role ?? ''}</p>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">{t.warningNote}</p>

        <div className="space-y-2">
          <label htmlFor="impersonation-reason" className="text-sm font-medium">
            {t.reasonLabel}
          </label>
          <Select
            value={reason}
            onValueChange={(value) => setReason(value as ImpersonationReason)}
            disabled={isLoading}
          >
            <SelectTrigger id="impersonation-reason" className="w-full">
              <SelectValue placeholder={t.reasonLabel} />
            </SelectTrigger>
            <SelectContent>
              {REASON_ORDER.map((value) => (
                <SelectItem key={value} value={value}>
                  {t.reasons[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {reason === 'OTHER' && (
          <div className="space-y-2">
            <label htmlFor="impersonation-reason-note" className="text-sm font-medium">
              {t.reasonNoteLabel}
            </label>
            <Input
              id="impersonation-reason-note"
              value={reasonNote}
              maxLength={300}
              disabled={isLoading}
              placeholder={t.reasonNotePlaceholder}
              onChange={(event) => setReasonNote(event.target.value)}
            />
          </div>
        )}

        <DialogFooter className={cn('mt-2 flex gap-2 sm:justify-end')}>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            {t.cancel}
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? t.starting : t.continue}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ImpersonateUserDialog;
