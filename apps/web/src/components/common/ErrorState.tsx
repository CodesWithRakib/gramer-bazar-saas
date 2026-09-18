import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again later.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px] border rounded-lg bg-destructive/5 border-destructive/20">
      <div className="bg-destructive/10 p-4 rounded-full mb-4 text-destructive">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-destructive">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-6 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
          Try Again
        </Button>
      )}
    </div>
  );
}
