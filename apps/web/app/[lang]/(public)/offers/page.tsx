export default async function OffersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isBn = lang === "bn";

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">{isBn ? "বিশেষ অফার" : "Special Offers"}</h1>
      <p className="text-muted-foreground text-lg mb-8">
        {isBn
          ? "বর্তমানের সেরা ডিল এবং ডিসকাউন্ট অফারগুলো খুব শীঘ্রই এখানে যুক্ত করা হবে।"
          : "The best deals and discount offers will be listed here very soon."}
      </p>
    </div>
  );
}
