import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, Database, Bell, Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isBn = lang === "bn";

  const sections = [
    {
      icon: Database,
      title: isBn ? "১. আমরা যে তথ্য সংগ্রহ করি" : "1. Information We Collect",
      content: isBn
        ? "অ্যাকাউন্ট নিবন্ধন ও অর্ডার ডেলিভারির জন্য আমরা আপনার নাম, মোবাইল নম্বর, ডেলিভারি ঠিকানা এবং ইমেইল সংগ্রহ করি। পেমেন্ট সংক্রান্ত তথ্য SSLCommerz-এর নিরাপদ এবং এনক্রিপ্টেড পেমেন্ট গেটওয়ের মাধ্যমে পরিচালিত হয়।"
        : "To fulfill orders and provide services, we collect your name, phone number, delivery address, and email. Financial transaction data is securely processed via PCI-DSS compliant SSLCOMMERZ gateways.",
    },
    {
      icon: Lock,
      title: isBn ? "২. তথ্যের ব্যবহার" : "2. How We Use Information",
      content: isBn
        ? "আপনার তথ্য শুধুমাত্র সঠিক ঠিকানায় দ্রুততম সময়ে পণ্য ডেলিভারি, ডেলিভারি রাইডারের সাথে যোগাযোগ, অর্ডার কনফার্মেশন এসএমএস পাঠানো এবং কাস্টমার সাপোর্ট প্রদানের উদ্দেশ্যে ব্যবহৃত হয়।"
        : "We use your information exclusively to process orders, dispatch verified riders to your location, deliver real-time order tracking SMS/notifications, and provide support.",
    },
    {
      icon: Eye,
      title: isBn ? "৩. তথ্য গোপনীয়তা ও তৃতীয় পক্ষ" : "3. Data Sharing & Third Parties",
      content: isBn
        ? "আমরা কোনো বাণিজ্যিক বিজ্ঞাপনী সংস্থার কাছে গ্রাহকের তথ্য বিক্রি বা হস্তান্তর করি না। কেবল অর্ডার সম্পন্ন করার জন্য প্রয়োজনীয় তথ্য (যেমন: নাম, ঠিকানা ও ফোন) আমাদের অনুমোদিত ডেলিভারি রাইডার ও সংশ্লিষ্ট বিক্রেতাকে প্রদান করা হয়।"
        : "We never sell, rent, or trade your personal data. Limited necessary details (recipient name, contact number, delivery address) are provided strictly to assigned delivery riders and sellers to complete delivery.",
    },
    {
      icon: ShieldCheck,
      title: isBn ? "৪. ডেটা নিরাপত্তা ব্যবস্থা" : "4. Data Security Standards",
      content: isBn
        ? "গ্রামের বাজার সর্বোচ্চ মানের এনক্রিপশন এবং নিরাপদ ক্লাউড অবকাঠামো ব্যবহার করে গ্রাহকের তথ্যের সুরক্ষা নিশ্চিত করে। যেকোনো সন্দেহজনক কার্যক্রম কঠোরভাবে মনিটর করা হয়।"
        : "Gramer Bazar enforces modern encryption standards, secure session management, and restricted infrastructure access to safeguard all customer and merchant data.",
    },
    {
      icon: Bell,
      title: isBn ? "৫. আপনার অধিকার ও নিয়ন্ত্রণ" : "5. Your Rights & Account Control",
      content: isBn
        ? "আপনি যেকোনো সময় আপনার ড্যাশবোর্ড থেকে সংরক্ষিত ঠিকানা পরিবর্তন বা অ্যাকাউন্ট তথ্য হালনাগাদ করতে পারেন। আপনার অ্যাকাউন্ট সংক্রান্ত যেকোনো প্রশ্ন বা আপত্তির জন্য আমাদের সাথে যোগাযোগ করতে পারেন।"
        : "You maintain full control over your profile, saved addresses, and communication preferences directly via your Customer Dashboard at any time.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-3 mb-12">
        <Badge variant="outline" className="text-primary border-primary/30 uppercase tracking-widest text-[11px] px-3 py-1 font-semibold">
          {isBn ? "আইনি ও পলিসি" : "Legal & Privacy"}
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {isBn ? "গোপনীয়তা ও নিরাপত্তা নীতি" : "Privacy Policy"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
          {isBn
            ? "গ্রামের বাজারে আপনার ব্যক্তিগত তথ্যের সুরক্ষা ও নিরাপত্তা নিশ্চিত করতে আমরা প্রতিশ্রুতিবদ্ধ।"
            : "Learn how Gramer Bazar collects, manages, and protects your personal data across our hyper-local marketplace."}
        </p>
        <p className="text-xs text-muted-foreground pt-1">
          {isBn ? "সর্বশেষ হালনাগাদ: জানুয়ারি ২০২৬" : "Last Updated: January 2026"}
        </p>
      </div>

      {/* Policy Sections */}
      <div className="space-y-6">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div key={idx} className="rounded-xl border border-border/80 bg-card p-5 sm:p-6 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-foreground">{sec.title}</h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-10.5">
                {sec.content}
              </p>
            </div>
          );
        })}
      </div>

      {/* Contact Section */}
      <div className="mt-12 rounded-xl border border-border bg-muted/30 p-6 space-y-3">
        <h3 className="text-base font-bold text-foreground">
          {isBn ? "প্রাইভেসি সংক্রান্ত যোগাযোগ" : "Privacy Inquiries & Support"}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {isBn
            ? "আমাদের গোপনীয়তা নীতি সম্পর্কে কোনো জিজ্ঞাসা থাকলে সরাসরি আমাদের সাথে যোগাযোগ করতে পারেন:"
            : "If you have any questions, feedback, or data requests regarding this Privacy Policy, please reach out:"}
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:gap-6 text-xs sm:text-sm text-foreground">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4 text-primary" />
            <span>+880 1767-476724</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-4 h-4 text-primary" />
            <span>codeswithrakib@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
