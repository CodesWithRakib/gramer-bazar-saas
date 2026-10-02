'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import {
  Handshake,
  Building2,
  Users2,
  Truck,
  Gift,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Send,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/custom-toast';
import { CustomImage } from '@/components/ui/CustomImage';

export default function PartnerInquiriesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  const [formData, setFormData] = useState({
    organizationName: '',
    contactPerson: '',
    designation: '',
    phone: '',
    email: '',
    partnerType: 'INSTITUTIONAL_BUYER',
    location: '',
    requirements: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.organizationName || !formData.phone) {
      toast.error(
        isBn ? 'অনুগ্রহ করে প্রতিষ্ঠানের নাম ও ফোন নম্বর পূরণ করুন' : 'Please provide organization name and phone'
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success(
        isBn
          ? 'ধন্যবাদ! আমাদের পার্টনারশিপ টিম ২৪ ঘণ্টার মধ্যে আপনার সাথে যোগাযোগ করবে।'
          : 'Thank you! Our enterprise partnership desk will contact you within 24 hours.'
      );
    }, 800);
  };

  const partnerTracks = [
    {
      icon: Users2,
      badge: isBn ? 'কৃষি সমবায়' : 'Agro Cooperatives',
      title: isBn ? 'কৃষক ও উৎপাদক সমবায়' : 'Farmer Cooperatives & Producers',
      desc: isBn
        ? 'মাঠ পর্যায়ের কৃষক সমিতি ও অর্গানিক সমবায়ীদের সাথে সরাসরি দীর্ঘমেয়াদী সোর্সিং চুক্তি এবং নিশ্চিত ন্যয্যমূল্য।'
        : 'Long-term direct contracts and guaranteed fair pricing for grower collectives and rural cooperative societies.',
    },
    {
      icon: Building2,
      badge: isBn ? 'পাইকারি ও বি২বি' : 'B2B Wholesale',
      title: isBn ? 'সুপারশপ, রেস্তোরাঁ ও পাইকারি ক্রেতা' : 'Institutional Bulk Buyers',
      desc: isBn
        ? 'দিনাজপুরের সুগন্ধি চিনিগুঁড়া চাল, খাঁটি গাওয়া ঘি ও ঘানিভাঙ্গা সরিষার তেলের নিরবচ্ছিন্ন পাইকারি সরবরাহ।'
        : 'Consistent bulk supply of certified Dinajpur aromatic rice, pure cow ghee, and cold-pressed mustard oil.',
    },
    {
      icon: Truck,
      badge: isBn ? 'লজিস্টিকস ও পরিবহন' : 'Logistics Fleets',
      title: isBn ? 'গ্রামীণ পরিবহন ও লজিস্টিকস পার্টনার' : 'Fleet & Transportation Network',
      desc: isBn
        ? 'উপজেলা পর্যায়ে কোল্ড চেইন পিকআপ ভ্যান এবং আঞ্চলিক হাব পরিবহন নেটওয়ার্কে যুক্ত হওয়ার সুবিধা।'
        : 'Integration for refrigerated transit, upazila pickup fleets, and inter-district agricultural transport.',
    },
    {
      icon: Gift,
      badge: isBn ? 'কর্পোরেট গিফটিং' : 'Corporate Gifting',
      title: isBn ? 'কর্পোরেট উপহার ও সিএসআর' : 'Corporate Gifting & CSR Programs',
      desc: isBn
        ? 'সুন্দরবনের প্রাকৃতিক মধু ও খাঁটি গ্রামীণ পণ্যের প্রিমিয়াম কাস্টমাইজড গিফট প্যাকেজ এবং ইভেন্ট সোর্সিং।'
        : 'Artisanal gift baskets with authentic raw honey, deshi ghee, and customizable corporate packaging.',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 text-white py-14 sm:py-20 md:py-24 border-b border-emerald-500/20 shadow-md">
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
          <CustomImage
            src="/banners/banner-village-market.jpg"
            alt="Partnership Banner"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container max-w-5xl mx-auto px-4 relative z-10 text-center space-y-6">
          <Badge
            variant="outline"
            className="bg-white/10 text-yellow-300 border-yellow-300/30 uppercase tracking-widest text-[11px] px-3.5 py-1 font-bold backdrop-blur-md shadow-xs"
          >
            <Handshake className="w-3.5 h-3.5 me-1.5 inline" />
            <span>{isBn ? 'কর্পোরেট ও প্রাতিষ্ঠানিক অংশীদারিত্ব' : 'Enterprise & B2B Partnerships'}</span>
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            {isBn
              ? 'গ্রামীণ অর্থনীতি রূপান্তরে আমাদের কৌশলগত অংশীদার হোন'
              : 'Empower Rural Commerce: Partner with Gramer Bazar'}
          </h1>

          <p className="max-w-2xl mx-auto text-white/85 text-xs sm:text-base md:text-lg leading-relaxed">
            {isBn
              ? 'কৃষক সমবায়, পাইকারি ক্রেতা, সুপারশপ এবং কর্পোরেট প্রতিষ্ঠানের জন্য নির্ভরযোগ্য সোর্সিং এবং ডিজিটাল সাপ্লাই চেইন নেটওয়ার্ক।'
              : 'Bridging grassroots agricultural producers with modern enterprise buyers through verified provenance, fair pricing, and reliable rural logistics.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-semibold text-emerald-200">
            <span className="bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1 rounded-full">
              🌾 {isBn ? 'সরাসরি কৃষক থেকে সোর্সিং' : 'Direct Farm Sourcing'}
            </span>
            <span className="bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1 rounded-full">
              📦 {isBn ? 'পাইকারি ভলিউম ডিসকাউন্ট' : 'Tiered Bulk Pricing'}
            </span>
            <span className="bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1 rounded-full">
              🚚 {isBn ? 'উপজেলা হাব টু ডোর ট্রান্সপোর্ট' : 'Hub-to-Door Logistics'}
            </span>
          </div>
        </div>
      </section>

      {/* 2. 4 Partnership Tracks */}
      <section className="container max-w-6xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {partnerTracks.map((track, idx) => {
            const Icon = track.icon;
            return (
              <div
                key={idx}
                className="bg-card border border-border/80 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5">
                      {track.badge}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-base text-foreground leading-snug">
                    {track.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {track.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Interactive Partner Inquiry Form & Direct Contact */}
      <section className="container max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-7 bg-card border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                {isBn ? 'অংশীদারিত্বের জন্য প্রস্তাব পাঠান' : 'Submit a Partnership Proposal'}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {isBn
                  ? 'আপনার প্রয়োজনীয় বিবরণ দিয়ে নিচের ফরমটি পূরণ করুন। আমাদের বি২বি টিম দ্রুত আপনার সাথে যোগাযোগ করবে।'
                  : 'Tell us about your organization and requirements. Our corporate partnerships desk will respond within 1 business day.'}
              </p>
            </div>

            {isSubmitted ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-foreground">
                  {isBn ? 'আপনার প্রস্তাব সফলভাবে গৃহীত হয়েছে!' : 'Proposal Submitted Successfully!'}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {isBn
                    ? 'আমাদের এন্টারপ্রাইজ পার্টনারশিপ ম্যানেজার আপনার সাথে সরাসরি যোগাযোগ করবেন।'
                    : 'Our partnerships team has received your inquiry and will reach out to your phone/email shortly.'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSubmitted(false)}
                  className="rounded-xl mt-2"
                >
                  {isBn ? 'আরেকটি প্রস্তাব পাঠান' : 'Submit Another Inquiry'}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">{isBn ? 'প্রতিষ্ঠানের নাম *' : 'Organization Name *'}</Label>
                    <Input
                      required
                      placeholder={isBn ? 'উদা: নর্থ বেঙ্গল এগ্রো ফার্ম' : 'e.g. North Bengal Agro'}
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">{isBn ? 'যোগাযোগকারী ব্যক্তি *' : 'Contact Person *'}</Label>
                    <Input
                      required
                      placeholder={isBn ? 'উদা: মোঃ আরিফুল ইসলাম' : 'e.g. Ariful Islam'}
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">{isBn ? 'মোবাইল নম্বর *' : 'Phone Number *'}</Label>
                    <Input
                      required
                      type="tel"
                      placeholder="017XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">{isBn ? 'ইমেইল ঠিকানা' : 'Work Email'}</Label>
                    <Input
                      type="email"
                      placeholder="corporate@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">{isBn ? 'অংশীদারিত্বের ধরণ' : 'Partnership Track'}</Label>
                    <Select
                      value={formData.partnerType}
                      onValueChange={(val) => setFormData({ ...formData, partnerType: val })}
                    >
                      <SelectTrigger className="rounded-xl h-10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COOPERATIVE">
                          {isBn ? 'কৃষি সমবায় / উৎপাদক সমিতি' : 'Farmer Cooperative / Producer'}
                        </SelectItem>
                        <SelectItem value="INSTITUTIONAL_BUYER">
                          {isBn ? 'পাইকারি ক্রেতা / সুপারশপ' : 'Wholesale / Supermarket Sourcing'}
                        </SelectItem>
                        <SelectItem value="LOGISTICS">
                          {isBn ? 'লজিস্টিকস ও পরিবহন' : 'Logistics & Fleet Partner'}
                        </SelectItem>
                        <SelectItem value="CORPORATE_GIFTING">
                          {isBn ? 'কর্পোরেট উপহার ও সিএসআর' : 'Corporate Gifting & CSR'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">{isBn ? 'অঞ্চল / জেলা' : 'Operating Region / District'}</Label>
                    <Input
                      placeholder={isBn ? 'উদা: দিনাজপুর, রংপুর বা ঢাকা' : 'e.g. Dinajpur, Rangpur or Dhaka'}
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isBn ? 'প্রস্তাবের বিবরণ ও আনুমানিক চাহিদা' : 'Proposal Details & Estimated Volume'}
                  </Label>
                  <Textarea
                    rows={4}
                    placeholder={
                      isBn
                        ? 'পণ্যের ধরণ, মাসিক চাহিদার পরিমাণ বা অংশীদারিত্বের লক্ষ্য বিস্তারিত লিখুন...'
                        : 'Describe products of interest, expected monthly volume, delivery specifications...'
                    }
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="rounded-xl text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl h-11 text-xs sm:text-sm font-bold shadow-md"
                >
                  <Send className="w-4 h-4 me-2" />
                  {isSubmitting
                    ? isBn ? 'জমা দেওয়া হচ্ছে...' : 'Submitting...'
                    : isBn ? 'প্রস্তাব জমা দিন' : 'Submit Proposal'}
                </Button>
              </form>
            )}
          </div>

          {/* Contact Details & Office Addresses */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border bg-card p-6 sm:p-7 shadow-sm space-y-5">
              <div className="space-y-1.5">
                <Badge variant="outline" className="text-primary border-primary/30 text-[10px] font-bold">
                  {isBn ? 'সরাসরি যোগাযোগ' : 'Direct B2B Desk'}
                </Badge>
                <h3 className="text-lg font-bold text-foreground">
                  {isBn ? 'কর্পোরেট হেল্পডেস্ক' : 'Enterprise Liaison Desk'}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isBn
                    ? 'তাত্ক্ষণিক আলোচনার জন্য সরাসরি আমাদের বি২বি বিজনেস ডেভেলপমেন্ট টিমে কল বা হোয়াটসঅ্যাপ করতে পারেন।'
                    : 'Reach out directly for rapid bulk quotations, sample requests, and procurement contracts.'}
                </p>
              </div>

              <div className="space-y-3 pt-1 text-xs">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-muted/40 border">
                  <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-foreground">{isBn ? 'বি২বি হটলাইন ও হোয়াটসঅ্যাপ' : 'B2B Hotline & WhatsApp'}</span>
                    <span className="text-muted-foreground font-mono">+880 1767-476724</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-muted/40 border">
                  <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-foreground">{isBn ? 'কর্পোরেট ইমেইল' : 'Partnership Email'}</span>
                    <span className="text-muted-foreground font-mono">codeswithrakib@gmail.com</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-muted/40 border">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-foreground">{isBn ? 'প্রধান হাব কার্যালয়' : 'Central Distribution Hub'}</span>
                    <span className="text-muted-foreground leading-relaxed block mt-0.5">
                      {isBn
                        ? 'খানসামা বাজার রোড, দিনাজপুর - ৫২৫০, বাংলাদেশ'
                        : 'Khansama Bazar Road, Dinajpur - 5250, Bangladesh'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Value Props Card */}
            <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 space-y-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>{isBn ? 'কেন গ্রামের বাজার অংশীদারিত্ব?' : 'Why Partner with Us?'}</span>
              </h4>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{isBn ? '১০০% খাঁটি ও ট্রেসযোগ্য গ্রামীণ পণ্য' : '100% Traceable authentic rural origins'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{isBn ? 'মধ্যস্বত্বভোগীহীন সরাসরি কৃষক নেটওয়ার্ক' : 'Zero middleman direct-to-farm supply chain'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{isBn ? 'ন্যায্য মূল্য ও স্বচ্ছ সাপ্তাহিক সেটেলমেন্ট' : 'Transparent pricing and automated invoices'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
