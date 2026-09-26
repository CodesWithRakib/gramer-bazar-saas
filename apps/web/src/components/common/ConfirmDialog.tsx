'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, HelpCircle } from 'lucide-react';

export interface ConfirmDialogProps {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'default';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  isBn?: boolean;
}

export function ConfirmDialog({
  open,
  isOpen,
  onOpenChange,
  onClose,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'destructive',
  isLoading = false,
  onConfirm,
  isBn = false,
}: ConfirmDialogProps) {
  const isDialogOpen = open ?? isOpen ?? false;
  const setDialogOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (!next) {
      onClose?.();
    }
  };

  const defaultConfirmLabel = confirmLabel || (variant === 'destructive' ? (isBn ? 'মুছে ফেলুন' : 'Delete') : (isBn ? 'নিশ্চিত করুন' : 'Confirm'));
  const defaultCancelLabel = cancelLabel || (isBn ? 'বাতিল' : 'Cancel');

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } finally {
      setDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(o) => { if (!isLoading) setDialogOpen(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-3 sm:gap-2">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-full shrink-0 ${
                variant === 'destructive'
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              {variant === 'destructive' ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <HelpCircle className="h-5 w-5" />
              )}
            </div>
            <DialogTitle className="text-lg font-semibold leading-tight">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2 justify-end mt-4 pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => setDialogOpen(false)}
            className="flex-1 sm:flex-none"
          >
            {defaultCancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            loading={isLoading}
            onClick={handleConfirm}
            className="flex-1 sm:flex-none shadow-xs"
          >
            {defaultConfirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
