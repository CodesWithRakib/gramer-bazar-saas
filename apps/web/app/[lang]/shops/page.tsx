export default async function ShopsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isBn = lang === "bn";

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">{isBn ? "দোকান সমূহ" : "Shops"}</h1>
      <p className="text-muted-foreground text-lg mb-8">
        {isBn
          ? "আমাদের লোকাল ভেরিফাইড দোকানগুলোর তালিকা খুব শীঘ্রই আসছে।"
          : "The list of our local verified shops is coming soon."}
      </p>
    </div>
  );
}
