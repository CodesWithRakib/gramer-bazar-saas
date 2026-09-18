'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isBn, setIsBn] = useState(false);

  useEffect(() => {
    console.error(error);
    if (typeof window !== 'undefined') {
      setIsBn(window.location.pathname.startsWith('/bn'));
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl font-bold text-destructive mb-4">
        {isBn ? 'কিছু সমস্যা হয়েছে!' : 'Something went wrong!'}
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        {isBn 
          ? 'আমাদের সার্ভারে একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।' 
          : 'An unexpected error has occurred on our servers.'}
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} size="lg">
          {isBn ? 'পুনরায় চেষ্টা করুন' : 'Try again'}
        </Button>
        <Button variant="outline" onClick={() => window.location.href = isBn ? '/bn' : '/en'} size="lg">
          {isBn ? 'হোমে ফিরে যান' : 'Return Home'}
        </Button>
      </div>
    </div>
  );
}
