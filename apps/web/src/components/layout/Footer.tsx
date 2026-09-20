import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, MapPin, Mail, Phone, CreditCard, ShieldCheck } from 'lucide-react';

interface FooterProps {
  lang: string;
}

export function Footer({ lang }: FooterProps) {
  const isBn = lang === 'bn';
  const year = new Date().getFullYear();

  return (
    <footer className="bg-background border-t mt-auto pt-16">
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & About */}
          <div className="lg:col-span-2">
            <h3 className="font-extrabold text-2xl mb-4 text-primary tracking-tight">
              {isBn ? 'গ্রামের বাজার' : 'Gramer Bazar'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {isBn 
                ? 'আপনার স্থানীয় হাইপার-লোকাল মার্কেটপ্লেস। সম্পূর্ণ তাজা এবং নিরাপদ পণ্য সরাসরি আপনার বাড়ির দরজায়।' 
                : 'Your premium hyper-local marketplace. Fresh, authentic, and safe products delivered straight to your doorstep.'}
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-5 text-foreground">{isBn ? 'গুরুত্বপূর্ণ লিংক' : 'Quick Links'}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground font-medium">
              <li><Link href={`/${lang}/categories`} className="hover:text-primary transition-colors">{isBn ? 'ক্যাটাগরি' : 'Categories'}</Link></li>
              <li><Link href={`/${lang}/shops`} className="hover:text-primary transition-colors">{isBn ? 'দোকান সমূহ' : 'Shops'}</Link></li>
              <li><Link href={`/${lang}/offers`} className="hover:text-primary transition-colors">{isBn ? 'অফার' : 'Offers'}</Link></li>
              <li><Link href={`/${lang}/product-requests`} className="hover:text-primary transition-colors">{isBn ? 'পণ্য অনুরোধ' : 'Product Requests'}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-5 text-foreground">{isBn ? 'কাস্টমার সার্ভিস' : 'Support'}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground font-medium">
              <li><Link href={`/${lang}/contact`} className="hover:text-primary transition-colors">{isBn ? 'যোগাযোগ' : 'Contact Us'}</Link></li>
              <li><Link href={`/${lang}/faq`} className="hover:text-primary transition-colors">{isBn ? 'সাধারণ প্রশ্ন' : 'FAQs'}</Link></li>
              <li><Link href={`/${lang}/privacy`} className="hover:text-primary transition-colors">{isBn ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}</Link></li>
              <li><Link href={`/${lang}/disputes`} className="hover:text-primary transition-colors">{isBn ? 'অভিযোগ' : 'Disputes'}</Link></li>
            </ul>
          </div>

          {/* Contact & Trust */}
          <div>
            <h4 className="font-bold mb-5 text-foreground">{isBn ? 'যোগাযোগ' : 'Contact'}</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>{isBn ? 'খানসামা, দিনাজপুর, বাংলাদেশ' : 'Khansama, Dinajpur, Bangladesh'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>support@gramerbazar.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+880 1700-000000</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground font-medium">
            © {year} {isBn ? 'গ্রামের বাজার। সর্বস্বত্ব সংরক্ষিত।' : 'Gramer Bazar. All rights reserved.'}
          </p>
          <div className="flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">{isBn ? 'নিরাপদ পেমেন্ট' : 'Secure Payment'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">{isBn ? 'SSLCommerz প্রস্তুত' : 'SSLCommerz Ready'}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
