export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isBn = lang === "bn";

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">{isBn ? "যোগাযোগ করুন" : "Contact Us"}</h1>
      <p className="text-muted-foreground text-lg mb-8">
        {isBn
          ? "যেকোনো প্রয়োজনে আমাদের সাথে যোগাযোগ করুন।"
          : "Get in touch with us for any inquiries or support."}
      </p>
      <div className="bg-card border shadow-sm p-6 rounded-xl space-y-4 text-left">
        <div>
          <h3 className="font-semibold text-lg">{isBn ? "মোবাইল / হেল্পলাইন" : "Phone / Helpline"}</h3>
          <p className="text-muted-foreground font-mono">+880 1767-476724</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg">{isBn ? "ইমেইল" : "Email"}</h3>
          <p className="text-muted-foreground">codeswithrakib@gmail.com</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg">{isBn ? "ঠিকানা" : "Address"}</h3>
          <p className="text-muted-foreground">{isBn ? "খানসামা, দিনাজপুর, বাংলাদেশ" : "Khansama, Dinajpur, Bangladesh"}</p>
        </div>
      </div>
    </div>
  );
}
