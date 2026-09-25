"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { getUserRoles } from "@/lib/roles";
import { useGetProfileQuery } from "@/features/auth/authApi";
import {
  Facebook,
  Instagram,
  Twitter,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  ShieldCheck,
  Store,
  Bike,
  LayoutDashboard,
  ShieldAlert,
  User,
  Package,
  Heart,
  HelpCircle,
  AlertCircle,
  FileQuestion,
  Lock,
  Sparkles,
} from "lucide-react";

interface FooterProps {
  lang: string;
}

export function Footer({ lang }: FooterProps) {
  const isBn = lang === "bn";
  const year = new Date().getFullYear();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { data: profile } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated || !!user,
  });

  const currentUser = user || profile;
  const userRoles = mounted ? getUserRoles(currentUser) : [];
  const isSuperAdmin = userRoles.includes("SUPER_ADMIN");
  const isAdmin = userRoles.includes("ADMIN") || isSuperAdmin;
  const isSeller = userRoles.includes("SELLER");
  const isRider = userRoles.includes("RIDER");

  return (
    <footer className="bg-background border-t mt-auto pt-16">
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Col 1: Brand & Contact Info */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-extrabold text-2xl text-primary tracking-tight">
              {isBn ? "গ্রামের বাজার" : "Gramer Bazar"}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {isBn
                ? "আপনার স্থানীয় হাইপার-লোকাল মার্কেটপ্লেস। সম্পূর্ণ তাজা এবং খাঁটি পণ্য সরাসরি আপনার দরজায়।"
                : "Your local hyper-marketplace for authentic rural products and fresh groceries delivered to your door."}
            </p>

            <ul className="space-y-2.5 text-xs text-muted-foreground pt-1">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{isBn ? "খানসামা, দিনাজপুর, বাংলাদেশ" : "Khansama, Dinajpur, Bangladesh"}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+880 1767-476724</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>codeswithrakib@gmail.com</span>
              </li>
            </ul>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="#"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links / Categories */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-foreground uppercase tracking-wider">
              {isBn ? "কেনাকাটা" : "Shop & Explore"}
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground font-medium">
              <li>
                <Link href={`/${lang}/categories`} className="hover:text-primary transition-colors">
                  {isBn ? "সকল ক্যাটাগরি" : "All Categories"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/shops`} className="hover:text-primary transition-colors">
                  {isBn ? "দোকান ও বিক্রেতা" : "Shops & Sellers"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/flash-sale`} className="hover:text-rose-500 transition-colors flex items-center gap-1.5">
                  <span className="text-rose-500 font-bold">{isBn ? "ফ্ল্যাশ সেল (ছাড়)" : "Flash Sale"}</span>
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/offers`} className="hover:text-primary transition-colors">
                  {isBn ? "বিশেষ অফার" : "Special Offers"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/categories/fresh-vegetables`} className="hover:text-primary transition-colors">
                  {isBn ? "শাকসবজি ও ফল" : "Fresh & Vegetables"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Service & Support */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-foreground uppercase tracking-wider">
              {isBn ? "গ্রাহক সহায়তা" : "Customer Care"}
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground font-medium">
              <li>
                <Link href={`/${lang}/contact`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{isBn ? "যোগাযোগ ও হেল্প" : "Contact Us"}</span>
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/faq`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <FileQuestion className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{isBn ? "সাধারণ প্রশ্ন (FAQ)" : "FAQs"}</span>
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/customer/disputes`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{isBn ? "অভিযোগ ও সমাধান" : "Disputes & Support"}</span>
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/customer/product-requests`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{isBn ? "পণ্য অনুরোধ" : "Product Requests"}</span>
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/privacy`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{isBn ? "প্রাইভেসি পলিসি" : "Privacy Policy"}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Earn with Us & Portals (Role & Auth aware) */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{isBn ? "অংশীদারিত্ব ও পোর্টাল" : "Earn & Portals"}</span>
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground font-medium">
              {/* If user is ALREADY a Seller, show portal links */}
              {isSeller ? (
                <>
                  <li>
                    <Link href={`/${lang}/seller`} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5" />
                      <span>{isBn ? "সেলার পোর্টাল" : "Seller Portal"}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/seller/products`} className="hover:text-primary transition-colors">
                      {isBn ? "পণ্য পরিচালনা" : "Manage Products"}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/seller/orders`} className="hover:text-primary transition-colors">
                      {isBn ? "সেলার অর্ডার" : "Seller Orders"}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/seller/wallet/payout`} className="hover:text-primary transition-colors">
                      {isBn ? "উত্তোলন হিস্ট্রি" : "Payout Requests"}
                    </Link>
                  </li>
                </>
              ) : (
                /* If NOT a seller and NOT admin, show Become a Seller */
                !isAdmin && (
                  <li>
                    <Link href={`/${lang}/become-a-seller`} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5" />
                      <span>{isBn ? "সেলার হতে আবেদন" : "Become a Seller"}</span>
                    </Link>
                  </li>
                )
              )}

              {/* If user is ALREADY a Rider, show rider portal links */}
              {isRider ? (
                <>
                  <li>
                    <Link href={`/${lang}/rider`} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1.5">
                      <Bike className="w-3.5 h-3.5" />
                      <span>{isBn ? "রাইডার ড্যাশবোর্ড" : "Rider App"}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/rider/deliveries`} className="hover:text-primary transition-colors">
                      {isBn ? "ডেলিভারি সমূহ" : "My Deliveries"}
                    </Link>
                  </li>
                </>
              ) : (
                /* If NOT a rider and NOT admin, show Become a Rider */
                !isAdmin && (
                  <li>
                    <Link href={`/${lang}/become-a-rider`} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1.5">
                      <Bike className="w-3.5 h-3.5" />
                      <span>{isBn ? "রাইডার হতে আবেদন" : "Become a Rider"}</span>
                    </Link>
                  </li>
                )
              )}

              {/* If user is Admin, show Admin Panel */}
              {isAdmin && (
                <li>
                  <Link href={`/${lang}/admin`} className="text-primary font-semibold hover:underline flex items-center gap-1.5">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>{isBn ? "অ্যাডমিন প্যানেল" : "Admin Panel"}</span>
                  </Link>
                </li>
              )}

              {/* If user is Super Admin, show Super Admin Console */}
              {isSuperAdmin && (
                <li>
                  <Link href={`/${lang}/super-admin`} className="text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isBn ? "সুপার অ্যাডমিন কনসোল" : "Super Admin"}</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Col 5: My Account (Auth aware) */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-foreground uppercase tracking-wider">
              {isBn ? "আমার অ্যাকাউন্ট" : "My Account"}
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground font-medium">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link href={`/${lang}/customer/orders`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{isBn ? "আমার অর্ডারসমূহ" : "My Orders"}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/customer/profile`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{isBn ? "আমার প্রোফাইল" : "My Profile"}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/customer/wishlist`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{isBn ? "উইশলিস্ট" : "Wishlist"}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/customer/addresses`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{isBn ? "ঠিকানা তালিকা" : "Saved Addresses"}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/customer/settings`} className="hover:text-primary transition-colors">
                      {isBn ? "অ্যাকাউন্ট সেটিংস" : "Account Settings"}
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href={`/${lang}/login`} className="hover:text-primary transition-colors font-semibold">
                      {isBn ? "লগইন করুন" : "Sign In"}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/register`} className="hover:text-primary transition-colors">
                      {isBn ? "নতুন অ্যাকাউন্ট তৈরি" : "Create Account"}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/login?redirect=${encodeURIComponent(`/${lang}/customer/orders`)}`} className="hover:text-primary transition-colors">
                      {isBn ? "অর্ডার ট্র্যাক করুন" : "Track My Order"}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/forgot-password`} className="hover:text-primary transition-colors">
                      {isBn ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot Password"}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-medium text-center md:text-left">
            © {year} {isBn ? "গ্রামের বাজার। সর্বস্বত্ব সংরক্ষিত।" : "Gramer Bazar. All rights reserved."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold uppercase">{isBn ? "নিরাপদ পেমেন্ট" : "Secure Payment"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase">{isBn ? "SSLCommerz প্রস্তুত" : "SSLCommerz Ready"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Store className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold uppercase">{isBn ? "১০০% খাঁটি পণ্য" : "100% Authentic"}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
