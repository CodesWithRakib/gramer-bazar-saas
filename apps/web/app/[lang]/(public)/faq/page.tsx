import React from "react";
import Link from "next/link";
import { HelpCircle, Phone, Mail, MapPin, Truck, ShieldCheck, CreditCard, RotateCcw, Store } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function FaqPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isBn = lang === "bn";

  const faqCategories = [
    {
      title: isBn ? "অর্ডার ও হোম ডেলিভারি" : "Orders & Delivery",
      icon: Truck,
      items: [
        {
          q: isBn ? "গ্রামের বাজার কীভাবে কাজ করে?" : "How does Gramer Bazar work?",
          a: isBn
            ? "গ্রামের বাজার একটি হাইপার-লোকাল গ্রামীণ ই-কমার্স মার্কেটপ্লেস। আমরা স্থানীয় কৃষক ও বিশ্বস্ত দোকান থেকে খাঁটি কৃষিপণ্য ও গ্রোসারি সরাসরি দ্রুততম সময়ে আপনার বাড়িতে পৌঁছে দিই।"
            : "Gramer Bazar is a hyper-local marketplace connecting you directly with authentic rural farmers and verified local shops for rapid delivery to your doorstep.",
        },
        {
          q: isBn ? "ডেলিভারি এলাকা এবং সময়সীমা কত?" : "What are the delivery areas and timelines?",
          a: isBn
            ? "বর্তমানে আমরা দিনাজপুর এবং খানসামা উপজেলা জুড়ে হোম ডেলিভারি প্রদান করছি। সাধারণ অর্ডারসমূহ ২-৪ ঘণ্টার মধ্যে এবং জরুরি গ্রোসারি ১ ঘণ্টার মধ্যে ডেলিভারি করা হয়।"
            : "We currently provide full coverage across Khansama and Dinajpur districts. Standard deliveries arrive in 2-4 hours, with express grocery delivery within 1 hour.",
        },
        {
          q: isBn ? "ডেলিভারি চার্জ কত?" : "How much is the delivery charge?",
          a: isBn
            ? "স্থানীয় বাজার এলাকার মধ্যে ডেলিভারি চার্জ সাধারণত ২০-৪০ টাকা। নির্দিষ্ট পরিমাণের বেশি অর্ডারে ফ্রি ডেলিভারির সুযোগ রয়েছে।"
            : "Local delivery typically ranges from ৳20-৳40 depending on your distance. Free delivery promotions apply on qualifying minimum order amounts.",
        },
      ],
    },
    {
      title: isBn ? "খাঁটি পণ্য ও গুণমান" : "Authenticity & Quality",
      icon: ShieldCheck,
      items: [
        {
          q: isBn ? "পণ্যগুলো কি ১০০% প্রাকৃতিক ও খাঁটি?" : "Are the products 100% natural and authentic?",
          a: isBn
            ? "হ্যাঁ, আমাদের শাকসবজি, সরিষার তেল, খাঁটি মধু, দুধ ও ডিম সরাসরি গ্রামীণ উৎপাদক ও বিশ্বস্ত কৃষকদের থেকে সংগ্রহ করা হয়। কোনো প্রকার ক্ষতিকর রাসায়নিক প্রিজারভেটিভ ব্যবহার করা হয় না।"
            : "Yes, our fresh vegetables, cold-pressed mustard oil, raw honey, and farm dairy are sourced directly from verified local producers without harmful artificial preservatives.",
        },
        {
          q: isBn ? "পণ্য নষ্ট বা ক্ষতিগ্রস্ত হলে কী করব?" : "What if an item is damaged or substandard?",
          a: isBn
            ? "ডেলিভারি পাওয়ার সাথে সাথে রাইডারের উপস্থিতিতে পণ্য পরীক্ষা করুন। কোনো সমস্যা থাকলে তাৎক্ষণিক রিটার্ন করতে পারবেন অথবা আমাদের সাপোর্ট টিমে ডিসপুট ওপেন করতে পারবেন।"
            : "Inspect your items upon handover. You may return any substandard or damaged produce immediately with the delivery rider or file a dispute in your customer portal.",
        },
      ],
    },
    {
      title: isBn ? "পেমেন্ট ও রিফান্ড" : "Payments & Refunds",
      icon: CreditCard,
      items: [
        {
          q: isBn ? "কী কী মাধ্যমে পেমেন্ট করা যাবে?" : "What payment methods are supported?",
          a: isBn
            ? "আমরা ক্যাশ অন ডেলিভারি (Cash on Delivery) এবং SSLCommerz গেটওয়ের মাধ্যমে বিকাশ, নগদ, রকেট, ডেবিট ও ক্রেডিট কার্ড সাপোর্ট করি।"
            : "We accept Cash on Delivery (COD) as well as secure digital gateway payments via SSLCOMMERZ (bKash, Nagad, Rocket, Visa, and Mastercard).",
        },
        {
          q: isBn ? "রিফান্ড কত দিনে পাওয়া যায়?" : "How quickly are refunds processed?",
          a: isBn
            ? "অনলাইন পেমেন্ট বাতিলের ক্ষেত্রে ৩-৫ কার্যদিবসের মধ্যে আপনার মূল অ্যাকাউন্টে বা ওয়ালেটে সম্পূর্ণ অর্থ ফেরত দেওয়া হয়।"
            : "Refunds for cancelled or returned orders paid via digital gateways are settled directly back to your original source within 3-5 business days.",
        },
      ],
    },
    {
      title: isBn ? "সেলার ও রাইডার পার্টনারশিপ" : "Sellers & Riders",
      icon: Store,
      items: [
        {
          q: isBn ? "কীভাবে আমি গ্রামের বাজারে সেলার হতে পারি?" : "How can I become a seller?",
          a: isBn
            ? "আমাদের 'সেলার হতে আবেদন' পৃষ্ঠায় গিয়ে আপনার দোকানের নাম, ফোন নম্বর ও ব্যবসার তথ্য দিয়ে আবেদন করুন। আমাদের টিম দ্রুত যাচাই করে আপনার স্টোর সক্রিয় করে দেবে।"
            : "Visit our 'Become a Seller' page and submit your shop information and contact details. Our verification team will review and approve your merchant store promptly.",
        },
        {
          q: isBn ? "ডেলিভারি রাইডার হিসেবে আয়ের সুযোগ কেমন?" : "What are the earning opportunities for riders?",
          a: isBn
            ? "আমাদের রাইডার পার্টনাররা প্রতি ডেলিভারিতে আকর্ষণীয় কমিশন পান এবং সাপ্তাহিক নিয়মিত পেআউট পেয়ে থাকেন।"
            : "Our rider partners earn competitive per-delivery commissions and enjoy flexible hours with punctual weekly direct wallet payouts.",
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-3 mb-12">
        <Badge variant="outline" className="text-primary border-primary/30 uppercase tracking-widest text-[11px] px-3 py-1 font-semibold">
          {isBn ? "সহায়তা কেন্দ্র" : "Help & FAQ"}
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {isBn ? "সাধারণ প্রশ্ন ও উত্তর" : "Frequently Asked Questions"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
          {isBn
            ? "গ্রামের বাজার সম্পর্কে আপনার সকল প্রশ্নের সুস্পষ্ট উত্তর এখানে এক নজরে জেনে নিন।"
            : "Everything you need to know about our hyper-local marketplace, deliveries, payments, and quality assurance."}
        </p>
      </div>

      {/* FAQ Categories & Items */}
      <div className="space-y-8">
        {faqCategories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div key={idx} className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-foreground">{cat.title}</h2>
              </div>

              <div className="grid gap-3">
                {cat.items.map((item, itemIdx) => (
                  <Card key={itemIdx} className="border border-border/80 bg-card shadow-none">
                    <CardHeader className="p-4 sm:p-5 pb-2">
                      <CardTitle className="text-sm sm:text-base font-semibold text-foreground flex items-start gap-2.5">
                        <span className="text-primary font-bold">Q.</span>
                        <span>{item.q}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed pl-8 sm:pl-9">
                      {item.a}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Support CTA */}
      <div className="mt-14 rounded-2xl border border-border bg-muted/40 p-6 sm:p-8 text-center space-y-4">
        <h3 className="text-lg font-bold text-foreground">
          {isBn ? "আপনার প্রশ্নের উত্তর পাননি?" : "Still have questions?"}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
          {isBn
            ? "আমাদের কাস্টমার কেয়ার টিম সপ্তাহের ৭ দিনই আপনার সেবায় প্রস্তুত। সরাসরি কল করুন অথবা মেসেজ পাঠান।"
            : "Our customer support team is available 7 days a week. Feel free to call our hotline or reach out via email."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button asChild className="rounded-full">
            <Link href={`/${lang}/contact`}>
              <Phone className="w-4 h-4 mr-2" />
              <span>{isBn ? "যোগাযোগ করুন" : "Contact Us"}</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <a href="tel:+8801767476724">
              <span>+880 1767-476724</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
