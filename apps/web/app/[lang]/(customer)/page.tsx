import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/config/i18n';
import { Button } from '@/components/ui/button';
import { HomeClient } from '@/components/home/HomeClient';
import Link from 'next/link';
import { Flame } from 'lucide-react';

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          {dict.common.welcome}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {dict.home.heroSubtitle}
        </p>
        <div className="flex flex-wrap gap-4 justify-center mt-6">
          <Button size="lg">{dict.home.startShopping}</Button>
          <Button variant="outline" size="lg">{dict.home.viewCategories}</Button>
          <Link href={`/${lang}/flash-sale`}>
            <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white font-bold gap-2">
              <Flame className="h-5 w-5 fill-current" />
              {lang === 'bn' ? 'ফ্ল্যাশ সেল' : 'Flash Sale'}
            </Button>
          </Link>
        </div>
      </section>

      <HomeClient lang={lang} dict={dict} />
    </div>
  );
}
