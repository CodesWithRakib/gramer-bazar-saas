import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({ message = 'Loading...', fullScreen = false }: LoadingStateProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center p-8 min-h-[400px]';

  return (
    <div className={containerClasses}>
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
      <p className="text-sm text-muted-foreground font-medium animate-pulse">{message}</p>
    </div>
  );
}
