import React from 'react';
import Link from 'next/link';

interface FooterProps {
  lang: string;
}

export function Footer({ lang }: FooterProps) {
  const isBn = lang === 'bn';
  const year = new Date().getFullYear();

  return (
    <footer className="bg-muted border-t mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-primary">
              {isBn ? 'গ্রামের বাজার' : 'Gramer Bazar'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isBn 
                ? 'আপনার স্থানীয় হাইপার-লোকাল মার্কেটপ্লেস। আপনার বাড়ির দরজায় সবকিছু।' 
                : 'Your local hyper-local marketplace. Everything at your doorstep.'}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{isBn ? 'গুরুত্বপূর্ণ লিংক' : 'Quick Links'}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href={`/${lang}/categories`} className="hover:text-primary">{isBn ? 'ক্যাটাগরি' : 'Categories'}</Link></li>
              <li><Link href={`/${lang}/shops`} className="hover:text-primary">{isBn ? 'দোকান সমূহ' : 'Shops'}</Link></li>
              <li><Link href={`/${lang}/offers`} className="hover:text-primary">{isBn ? 'অফার' : 'Offers'}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{isBn ? 'কাস্টমার সার্ভিস' : 'Customer Service'}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href={`/${lang}/contact`} className="hover:text-primary">{isBn ? 'যোগাযোগ' : 'Contact Us'}</Link></li>
              <li><Link href={`/${lang}/faq`} className="hover:text-primary">{isBn ? 'সাধারণ প্রশ্ন' : 'FAQs'}</Link></li>
              <li><Link href={`/${lang}/privacy`} className="hover:text-primary">{isBn ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{isBn ? 'যোগাযোগ' : 'Contact'}</h4>
            <address className="not-italic text-sm text-muted-foreground space-y-2">
              <p>{isBn ? 'খানসামা, দিনাজপুর, বাংলাদেশ' : 'Khansama, Dinajpur, Bangladesh'}</p>
              <p>{isBn ? 'ইমেইল: support@gramerbazar.com' : 'Email: support@gramerbazar.com'}</p>
              <p>{isBn ? 'ফোন: ০১৭XX-XXXXXX' : 'Phone: +880 17XX-XXXXXX'}</p>
            </address>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {year} {isBn ? 'গ্রামের বাজার। সর্বস্বত্ব সংরক্ষিত।' : 'Gramer Bazar. All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );
}
