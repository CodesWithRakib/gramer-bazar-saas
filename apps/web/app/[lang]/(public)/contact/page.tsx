import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, MessageSquare, Store, Bike, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isBn = lang === "bn";

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-3 mb-12">
        <Badge variant="outline" className="text-primary border-primary/30 uppercase tracking-widest text-[11px] px-3 py-1 font-semibold">
          {isBn ? "কাস্টমার সাপোর্ট" : "Customer Support"}
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {isBn ? "আমাদের সাথে যোগাযোগ করুন" : "Get in Touch With Us"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
          {isBn
            ? "যেকোনো পরামর্শ, অভিযোগ বা পণ্য সম্পর্কিত সহায়তার জন্য আমরা আপনার পাশে আছি।"
            : "Have a question about an order, delivery, or partnership? Our local support team is here to assist you."}
        </p>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {/* Phone / Hotline */}
        <Card className="border border-border/80 bg-card shadow-none">
          <CardHeader className="p-5 pb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Phone className="w-5 h-5" />
            </div>
            <CardTitle className="text-base font-bold text-foreground">
              {isBn ? "হটলাইন ও ফোন" : "Hotline & Phone"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2 text-xs sm:text-sm text-muted-foreground">
            <p className="font-mono text-foreground font-semibold text-base">+880 1767-476724</p>
            <p>{isBn ? "সকাল ৮:০০ টা – রাত ১০:০০ টা (প্রতিদিন)" : "8:00 AM – 10:00 PM (Daily)"}</p>
            <div className="pt-2">
              <Button asChild size="sm" variant="outline" className="w-full rounded-lg">
                <a href="tel:+8801767476724">
                  <Phone className="w-3.5 h-3.5 mr-1.5" />
                  <span>{isBn ? "সরাসরি কল করুন" : "Call Helpline"}</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Support */}
        <Card className="border border-border/80 bg-card shadow-none">
          <CardHeader className="p-5 pb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <CardTitle className="text-base font-bold text-foreground">
              {isBn ? "ইমেইল যোগাযোগ" : "Email Support"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2 text-xs sm:text-sm text-muted-foreground">
            <p className="font-mono text-foreground font-semibold text-sm">codeswithrakib@gmail.com</p>
            <p>{isBn ? "২৪ ঘণ্টার মধ্যে উত্তর প্রদান করা হয়" : "Response within 24 hours"}</p>
            <div className="pt-2">
              <Button asChild size="sm" variant="outline" className="w-full rounded-lg">
                <a href="mailto:codeswithrakib@gmail.com">
                  <Mail className="w-3.5 h-3.5 mr-1.5" />
                  <span>{isBn ? "ইমেইল পাঠান" : "Send Email"}</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Local Office Address */}
        <Card className="border border-border/80 bg-card shadow-none">
          <CardHeader className="p-5 pb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <CardTitle className="text-base font-bold text-foreground">
              {isBn ? "অফিস ও হাব" : "Local Hub Office"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2 text-xs sm:text-sm text-muted-foreground">
            <p className="text-foreground font-semibold">
              {isBn ? "গ্রামের বাজার প্রধান কার্যালয়" : "Gramer Bazar Main Hub"}
            </p>
            <p>{isBn ? "খানসামা, দিনাজপুর, রংপুর বিভাগ, বাংলাদেশ" : "Khansama, Dinajpur, Rangpur Division, Bangladesh"}</p>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>{isBn ? "সকাল ৯:০০ – সন্ধ্যা ৭:০০" : "9:00 AM – 7:00 PM"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Help Portals */}
      <div className="rounded-2xl border border-border bg-muted/20 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-foreground mb-4">
          {isBn ? "দ্রুত সেবা ও পার্টনারশিপ" : "Direct Portals & Partnerships"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href={`/${lang}/faq`}
            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">{isBn ? "প্রশ্নোত্তর (FAQ)" : "FAQs"}</p>
              <p className="text-[11px] text-muted-foreground">{isBn ? "সাধারণ প্রশ্নের উত্তর" : "Quick answers"}</p>
            </div>
          </Link>

          <Link
            href={`/${lang}/become-a-seller`}
            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">{isBn ? "মার্চেন্ট রেজিস্ট্রেশন" : "Seller Registration"}</p>
              <p className="text-[11px] text-muted-foreground">{isBn ? "অনলাইনে দোকান খুলুন" : "Open your online store"}</p>
            </div>
          </Link>

          <Link
            href={`/${lang}/become-a-rider`}
            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">{isBn ? "রাইডার হিসেবে যোগ দিন" : "Rider Onboarding"}</p>
              <p className="text-[11px] text-muted-foreground">{isBn ? "ডেলিভারি করে আয় করুন" : "Earn by delivering"}</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
