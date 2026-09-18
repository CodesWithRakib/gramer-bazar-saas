import { getDictionary } from "@/lib/dictionary";
import type { Locale } from "@/config/i18n";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold text-primary mb-4">{dict.common.welcome}</h1>
      <p className="text-muted-foreground">Select a portal to continue.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8 w-full max-w-4xl">
        <a href={`/${lang}/customer`} className="p-6 border rounded-lg hover:border-primary transition-colors text-center shadow-sm">
          Customer Portal
        </a>
        <a href={`/${lang}/admin`} className="p-6 border rounded-lg hover:border-primary transition-colors text-center shadow-sm">
          Admin Portal
        </a>
        <a href={`/${lang}/seller`} className="p-6 border rounded-lg hover:border-primary transition-colors text-center shadow-sm">
          Seller Portal
        </a>
        <a href={`/${lang}/rider`} className="p-6 border rounded-lg hover:border-primary transition-colors text-center shadow-sm">
          Rider Portal
        </a>
      </div>
    </main>
  );
}
