export default async function FaqPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isBn = lang === "bn";

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">{isBn ? "সাধারণ প্রশ্নাবলী" : "Frequently Asked Questions"}</h1>
      <p className="text-muted-foreground text-lg mb-8">
        {isBn
          ? "গ্রাহকদের সচরাচর জিজ্ঞাসিত প্রশ্ন ও উত্তরগুলো খুব শীঘ্রই এখানে পাবেন।"
          : "Answers to our customers' most frequently asked questions will be available here soon."}
      </p>
    </div>
  );
}
