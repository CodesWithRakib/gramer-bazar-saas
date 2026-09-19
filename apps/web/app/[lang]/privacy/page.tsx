export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isBn = lang === "bn";

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">{isBn ? "গোপনীয়তা নীতি" : "Privacy Policy"}</h1>
      <p className="text-muted-foreground text-lg mb-8">
        {isBn
          ? "গ্রামের বাজারের গোপনীয়তা নীতি খুব শীঘ্রই এখানে প্রকাশ করা হবে।"
          : "Gramer Bazar's privacy policy will be published here soon."}
      </p>
    </div>
  );
}
