'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

export default function NotFound() {
  const pathname = usePathname();
  const isBn = pathname?.startsWith('/bn');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">
        {isBn ? 'পাতা খুঁজে পাওয়া যায়নি' : 'Page Not Found'}
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        {isBn 
          ? 'আপনি যে পাতাটি খুঁজছেন তা আমরা খুঁজে পাইনি।' 
          : 'We couldn\'t find the page you were looking for.'}
      </p>
      <Button asChild size="lg">
        <Link href={isBn ? "/bn" : "/en"}>
          {isBn ? 'হোমে ফিরে যান' : 'Return Home'}
        </Link>
      </Button>
    </div>
  );
}
