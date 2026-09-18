import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/config/i18n';
import { Button } from '@/components/ui/button';

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
          Shop for fresh groceries, local products, and daily essentials from the comfort of your home.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg">Start Shopping</Button>
          <Button variant="outline" size="lg">View Categories</Button>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded-lg p-4 shadow-sm bg-card flex flex-col items-center">
            <div className="w-full aspect-square bg-muted rounded-md mb-4 flex items-center justify-center text-muted-foreground text-sm">Product Image</div>
            <h3 className="font-semibold text-card-foreground">Local Product {i}</h3>
            <p className="text-primary font-bold mt-2">৳ 120</p>
            <Button className="w-full mt-4" variant="secondary">Add to Cart</Button>
          </div>
        ))}
      </section>
    </div>
  );
}
