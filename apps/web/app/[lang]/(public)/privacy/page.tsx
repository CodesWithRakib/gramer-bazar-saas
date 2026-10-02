import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  Bell,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  FileText,
  KeyRound,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CustomImage } from '@/components/ui/CustomImage';
import { Button } from '@/components/ui/button';

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isBn = lang === 'bn';

  const trustHighlights = [
    {
      icon: Lock,
      title: isBn ? '২৫৬-বিট এসএসএল এনক্রিপশন' : '256-bit SSL Encryption',
      desc: isBn ? 'সকল ডেটা ট্রানজিট সম্পূর্ণ এনক্রিপ্টেড' : 'All web & API traffic encrypted in-transit',
    },
    {
      icon: ShieldCheck,
      title: isBn ? 'জিরো থার্ড-পার্টি শেয়ারিং' : 'Zero Data Brokering',
      desc: isBn ? 'কোনো বিজ্ঞাপনী সংস্থার কাছে তথ্য বিক্রি নয়' : 'Strictly no data resale or marketing trading',
    },
    {
      icon: KeyRound,
      title: isBn ? 'পিসিআই-ডিএসএস অনুমোদিত পেমেন্ট' : 'PCI-DSS Compliant Payments',
      desc: isBn ? 'SSLCommerz, বিকাশ ও নগদের মাধ্যমে নিরাপদ পেমেন্ট' : 'Handled via authorized Bangladesh Bank gateways',
    },
    {
      icon: Trash2,
      title: isBn ? 'সম্পূর্ণ ডেটা নিয়ন্ত্রণ ও মোছার অধিকার' : 'Right to Account Erasure',
      desc: isBn ? 'যেকোনো সময় তথ্য হালনাগাদ বা মোছার আবেদন' : 'Full user control over profile & order history',
    },
  ];

  const sections = [
    {
      id: 'scope',
      icon: FileText,
      title: isBn ? '১. ভূমিকা ও নীতিমালার আওতা' : '1. Scope & Legal Framework',
      content: isBn ? (
        <div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>
            ‘গ্রামের বাজার’ (Gramer Bazar) বাংলাদেশের গ্রামীণ ও মফস্বল অঞ্চলের কৃষক, ক্ষুদ্র উৎপাদনকারী, স্থানীয় ব্যবসায়ী এবং সাধারণ ভোক্তাদের মধ্যকার একটি ডিজিটাল হাইপার-লোকাল মার্কেটপ্লেস প্ল্যাটফর্ম।
          </p>
          <p>
            আমরা গ্রাহকদের গোপনীয়তাকে সর্বোচ্চ অগ্রাধিকার দিই। এই গোপনীয়তা নীতিমালায় ব্যাখ্যা করা হয়েছে কীভাবে আমরা আপনার ব্যক্তিগত তথ্য সংগ্রহ, প্রক্রিয়াকরণ, সংরক্ষণ এবং সুরক্ষা করি। বাংলাদেশ ডিজিটাল নিরাপত্তা আইন ও ভোক্তা অধিকার সংরক্ষণ আইনের আলোকে আমাদের সেবা পরিচালিত হয়।
          </p>
        </div>
      ) : (
        <div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>
            Gramer Bazar is a rural hyper-local marketplace operating across Upazilas and rural hubs in Bangladesh, connecting local farmers, cottage producers, village merchants, and consumers.
          </p>
          <p>
            We uphold strict standards of user privacy and transparency. This Privacy Policy details how we collect, handle, safeguard, and manage your personal data when using our web portal and mobile experiences in accordance with applicable Bangladesh telecommunication, ICT, and consumer protection laws.
          </p>
        </div>
      ),
    },
    {
      id: 'collection',
      icon: Database,
      title: isBn ? '২. আমরা যে সকল তথ্য সংগ্রহ করি' : '2. Information We Collect',
      content: isBn ? (
        <div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>অর্ডার ডেলিভারি ও মানসম্মত সেবা নিশ্চিত করতে আমরা নিম্নলিখিত তথ্য সংগ্রহ করি:</p>
          <ul className="list-disc ps-5 space-y-1.5">
            <li>
              <strong>ব্যক্তিগত সনাক্তকরণ তথ্য:</strong> নাম, মোবাইল নম্বর, ইমেইল ঠিকানা।
            </li>
            <li>
              <strong>ডেলিভারি ও ভৌগোলিক তথ্য:</strong> জেলা, উপজেলা, ইউনিয়ন, গ্রাম, সুনির্দিষ্ট বাড়ি/দোকানের ঠিকানা এবং সঠিক ডেলিভারির জন্য ঐচ্ছিক জিপিএস পিন লোকেশন।
            </li>
            <li>
              <strong>অর্ডার ও লেনদেন সংক্রান্ত তথ্য:</strong> নির্বাচিত পণ্য, অর্ডারের পরিমাণ, পেমেন্ট পদ্ধতি (ক্যাশ অন ডেলিভারি, বিকাশ বা অনলাইন পেমেন্ট)।
            </li>
            <li>
              <strong>সেলার ও রাইডার যাচাইকরণ তথ্য:</strong> জাতীয় পরিচয়পত্র (NID) নম্বর, ট্রেড লাইসেন্স, ড্রাইভিং লাইসেন্স এবং গাড়ির নম্বর প্লেট (শুধুমাত্র সেলার ও রাইডার পার্টনারদের ক্ষেত্রে)।
            </li>
          </ul>
        </div>
      ) : (
        <div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>To deliver fast, reliable rural marketplace fulfillment, we collect minimal necessary data points:</p>
          <ul className="list-disc ps-5 space-y-1.5">
            <li>
              <strong>Identity Details:</strong> Full name, verified mobile phone number, email address.
            </li>
            <li>
              <strong>Delivery & Geographic Coordinates:</strong> District, Upazila, Union, village name, landmark notes, and optional browser GPS pinning for accurate doorstep drop-offs.
            </li>
            <li>
              <strong>Order & Fulfillment History:</strong> Cart items, invoice amounts, delivery timetables, and chosen payment method (Cash on Delivery, bKash, Nagad, card).
            </li>
            <li>
              <strong>Partner Verification Data:</strong> National Identity (NID) number, Trade License, driver license, vehicle plate number (collected strictly for onboarded merchant and rider partners).
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'payments',
      icon: Lock,
      title: isBn ? '৩. আর্থিক লেনদেন ও পেমেন্ট নিরাপত্তা' : '3. Financial Security & Payment Processing',
      content: isBn ? (
        <div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>
            গ্রামের বাজার সরাসরি আপনার ক্রেডিট কার্ড নম্বর, ডেবিট কার্ড পিন বা মোবাইল ব্যাংকিং ওটিপি (OTP) সংরক্ষণ করে না।
          </p>
          <p>
            সকল ডিজিটাল লেনদেন বাংলাদেশ ব্যাংক অনুমোদিত পেমেন্ট এগ্রিগেটর SSLCommerz এবং সংশ্লিষ্ট মোবাইল ফিন্যান্সিয়াল সার্ভিসেস (bKash, Nagad, Rocket)-এর এনক্রিপ্টেড পেমেন্ট গেটওয়ের মাধ্যমে পরিচালিত হয়। প্রতিটি ট্রানজেকশনে ইন্ডাস্ট্রি স্ট্যান্ডার্ড 3D-Secure ভেরিফিকেশন প্রযোজ্য।
          </p>
        </div>
      ) : (
        <div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>
            Gramer Bazar never stores your credit/debit card numbers, CVVs, bank PINs, or MFS secret pins on its servers.
          </p>
          <p>
            All electronic transactions are routed through PCI-DSS Level 1 certified gateways including SSLCOMMERZ and direct MFS APIs (bKash, Nagad, Rocket). Each transaction utilizes 256-bit encryption and mandatory 3D-Secure 2-factor authentication.
          </p>
        </div>
      ),
    },
    {
      id: 'usage',
      icon: Bell,
      title: isBn ? '৪. তথ্যের ব্যবহার ও উদ্দেশ্য' : '4. How We Utilize Information',
      content: isBn ? (
        <div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>সংগৃহীত তথ্য নিম্নলিখিত সুনির্দিষ্ট উদ্দেশ্যে ব্যবহৃত হয়:</p>
          <ul className="list-disc ps-5 space-y-1.5">
            <li>অর্ডার প্রসেসিং, স্থানীয় দোকান থেকে পণ্য সংগ্রহ এবং গ্রাহকের ঠিকানায় দ্রুত ডেলিভারি নিশ্চিত করা।</li>
            <li>অর্ডারের স্থিতি ও ট্র্যাকিং তথ্য এসএমএস এবং অ্যাপ নোটিফিকেশনের মাধ্যমে জানানো।</li>
            <li>ডেলিভারির সুবিধার্থে সংশ্লিষ্ট রাইডারের সাথে সরাসরি মোবাইল সংযোগ স্থাপন।</li>
            <li>যেকোনো অভিযোগ, রিটার্ন বা রিফান্ডের অনুরোধ দ্রুত নিষ্পত্তি করা।</li>
            <li>প্ল্যাটফর্মের অপব্যবহার, ভুয়া অর্ডার এবং প্রতারণামূলক কার্যকলাপ প্রতিরোধ করা।</li>
          </ul>
        </div>
      ) : (
        <div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>We process your data strictly for legitimate operational purposes:</p>
          <ul className="list-disc ps-5 space-y-1.5">
            <li>Processing customer orders, coordinating merchant dispatch, and routing local village delivery riders.</li>
            <li>Sending transactional order confirmations, dispatch updates, and OTPs via automated SMS.</li>
            <li>Enabling direct phone coordination between assigned delivery riders and recipients during drop-off.</li>
            <li>Resolving customer dispute tickets, delivery inquiries, and merchant payment settlements.</li>
            <li>Detecting and mitigating fraud, bot activity, fake orders, and suspicious accounts.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'third-parties',
      icon: Eye,
      title: isBn ? '৫. তথ্য গোপনীয়তা ও তৃতীয় পক্ষ সংক্রান্ত নীতি' : '5. Data Disclosure & Non-Sharing Policy',
      content: isBn ? (
        <div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong>আমরা কোনো বিজ্ঞাপনদাতা বা বাণিজ্যিক ব্রোকারের কাছে গ্রাহকের তথ্য বিক্রি, লিজ বা হস্তান্তর করি না।</strong>
          </p>
          <p>
            শুধুমাত্র অর্ডার ডেলিভারির স্বার্থে ন্যূনতম প্রয়োজনীয় তথ্য (নাম, ডেলিভারি ঠিকানা এবং ফোন নম্বর) সংশ্লিষ্ট বিক্রেতা এবং দায়িত্বপ্রাপ্ত অনুমোদিত রাইডারকে প্রদান করা হয়। দেশের প্রচলিত আইনের নির্দেশ ব্যতীত অন্য কোনো তৃতীয় পক্ষের সাথে ডেটা শেয়ার করা হয় না।
          </p>
        </div>
      ) : (
        <div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong>We maintain a zero-tolerance policy against selling, leasing, or trading user personal information to marketing syndicates or data aggregators.</strong>
          </p>
          <p>
            Data disclosure is strictly restricted to assigned local riders and sellers solely for the active order fulfillment window (name, drop-off point, and delivery contact). Gramer Bazar only discloses personal records to law enforcement when mandated by court orders or statutory government directives.
          </p>
        </div>
      ),
    },
    {
      id: 'rights',
      icon: Trash2,
      title: isBn ? '৬. আপনার অধিকার ও অ্যাকাউন্ট নিয়ন্ত্রণ' : '6. User Rights & Data Deletion',
      content: isBn ? (
        <div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>
            একজন ব্যবহারকারী হিসেবে আপনার ব্যক্তিগত তথ্যের ওপর পূর্ণ নিয়ন্ত্রণ রয়েছে:
          </p>
          <ul className="list-disc ps-5 space-y-1.5">
            <li>যেকোনো সময় আপনার কাস্টমার ড্যাশবোর্ড থেকে সংরক্ষিত ঠিকানা ও প্রোফাইল সম্পাদনা করতে পারেন।</li>
            <li>মার্কেটিং এসএমএস বা নোটিফিকেশন সেটিংস পরিবর্তন করতে পারেন।</li>
            <li>
              আপনার সম্পূর্ণ অ্যাকাউন্ট এবং সংশ্লিষ্ট ব্যক্তিগত তথ্য প্ল্যাটফর্ম থেকে স্থায়ীভাবে মুছে ফেলার জন্য আমাদের সাপোর্ট ডেস্কে যোগাযোগ করতে পারেন। অনুরোধ প্রাপ্তির ৭ কার্যদিবসের মধ্যে আইনি বিধিবদ্ধ রেকর্ড ব্যতিরেকে সমস্ত ব্যক্তিগত তথ্য মুছে দেওয়া হবে।
            </li>
          </ul>
        </div>
      ) : (
        <div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>As a registered user or merchant, you retain comprehensive data rights:</p>
          <ul className="list-disc ps-5 space-y-1.5">
            <li>Access and update your profile details and saved addresses anytime in your Customer Dashboard.</li>
            <li>Opt out of non-essential promotional SMS messages while retaining mandatory order notifications.</li>
            <li>
              Request full erasure of your account and personal identifiers by contacting our data protection officer. Records are permanently decommissioned within 7 business days, excluding transactions retained for mandatory financial audits.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'security',
      icon: ShieldCheck,
      title: isBn ? '৭. ডেটা নিরাপত্তা ব্যবস্থা ও সার্ভার সুরক্ষা' : '7. Data Security Standards',
      content: isBn ? (
        <div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>
            গ্রামের বাজার ক্লাউড অবকাঠামোতে সর্বোচ্চ স্তরের সুরক্ষা ব্যবস্থা নিশ্চিত করে। নিয়মিত ব্যাকআপ, ফায়ারওয়াল প্রটেকশন, রোল-বেসড অ্যাক্সেস কন্ট্রোল (RBAC) এবং অডিট লগের মাধ্যমে যেকোনো অননুমোদিত অ্যাক্সেস প্রতিরোধ করা হয়।
          </p>
        </div>
      ) : (
        <div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>
            Gramer Bazar maintains high-grade cloud hosting controls, continuous vulnerability scans, automated database replication, role-based access governance, and encrypted token sessions to shield against malicious intrusions.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white py-12 sm:py-16 md:py-20 border-b border-emerald-500/20 shadow-md">
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
          <CustomImage
            src="/banners/banner-village-market.jpg"
            alt="Privacy Policy Banner"
            fill
            className="object-cover"
          />
        </div>
        <div className="container max-w-5xl mx-auto px-4 relative z-10 text-center space-y-4">
          <Badge
            variant="outline"
            className="bg-white/10 text-yellow-300 border-yellow-300/30 uppercase tracking-widest text-[11px] px-3.5 py-1 font-bold backdrop-blur-md shadow-xs"
          >
            {isBn ? 'আইনি ও স্বচ্ছতা' : 'Trust & Legal Compliance'}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {isBn ? 'গোপনীয়তা ও নিরাপত্তা নীতি' : 'Privacy & Data Protection Policy'}
          </h1>
          <p className="text-white/85 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            {isBn
              ? 'গ্রামের বাজারে আপনার ব্যক্তিগত তথ্য ও আর্থিক লেনদেনের শতভাগ নিরাপত্তা ও বিশ্বস্ততা নিশ্চিত করতে আমরা প্রতিশ্রুতিবদ্ধ।'
              : 'Transparent guidelines detailing how Gramer Bazar collects, manages, and protects customer, merchant, and rider data.'}
          </p>
          <div className="pt-2 text-xs text-emerald-200/90 font-medium">
            <span>{isBn ? 'সর্বশেষ হালনাগাদ:' : 'Effective Date:'}</span>{' '}
            <strong className="text-white">{isBn ? 'জানুয়ারি ২০২৬ • সংস্করণ ২.০' : 'January 2026 • v2.0'}</strong>
          </div>
        </div>
      </section>

      {/* 2. Trust Highlights Grid */}
      <section className="container max-w-5xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {trustHighlights.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col items-start gap-2.5"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Policy Sections Accordion/Cards */}
      <section className="container max-w-4xl mx-auto px-4 pt-10 sm:pt-14 space-y-6">
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.id}
              className="rounded-2xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs hover:border-primary/30 transition-colors space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-foreground">{sec.title}</h2>
              </div>
              <div className="ps-0 sm:ps-12">{sec.content}</div>
            </div>
          );
        })}

        {/* 4. Grievance & Office Contact Desk */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 text-primary">
            <ShieldCheck className="w-6 h-6" />
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              {isBn ? 'গ্রিভেন্স অফিসার ও গোপনীয়তা হেল্পডেস্ক' : 'Grievance Officer & Data Helpdesk'}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {isBn
              ? 'আমাদের গোপনীয়তা নীতি সম্পর্কে কোনো জিজ্ঞাসা থাকলে, ডেটা মুছে ফেলার অনুরোধ বা অভিযোগ জানাতে আমাদের ডেটা প্রটেকশন টিমের সাথে যোগাযোগ করুন:'
              : 'For formal privacy grievances, inquiries regarding this policy, or requesting account and identifier erasure, reach our compliance team directly:'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-background border">
              <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold text-foreground">{isBn ? 'হটলাইন' : 'Direct Helpline'}</span>
                <span className="text-muted-foreground font-mono">+880 1767-476724</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-background border">
              <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold text-foreground">{isBn ? 'ইমেইল' : 'Privacy Email'}</span>
                <span className="text-muted-foreground font-mono text-[11px] sm:text-xs">
                  codeswithrakib@gmail.com
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-background border">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold text-foreground">{isBn ? 'প্রধান হাব' : 'Central Hub'}</span>
                <span className="text-muted-foreground text-[11px]">
                  {isBn ? 'খানসামা বাজার, দিনাজপুর, বাংলাদেশ' : 'Khansama Bazar, Dinajpur, Bangladesh'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
