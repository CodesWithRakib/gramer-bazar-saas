'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl font-bold text-destructive mb-4">Something went wrong!</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        An unexpected error has occurred on our servers. We've been notified and are working on fixing it.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} size="lg">
          Try again
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/'} size="lg">
          Return Home
        </Button>
      </div>
    </div>
  );
}
