"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { getUserRoles } from "@/lib/roles";
import { useGetProfileQuery } from "@/features/auth/authApi";
import { SearchBar } from "./SearchBar";
import { UserActions } from "./UserActions";
import { CategoryMegaMenu } from "./CategoryMegaMenu";
import { MobileCategoryDrawer } from "./MobileCategoryDrawer";
import {
  Menu,
  Zap,
  ShieldCheck,
  Phone,
  Mail,
  Store,
  Bike,
  LayoutDashboard,
  ShieldAlert,
  Package,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  lang: string;
}

export function Header({ lang }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isBn = lang === "bn";

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { data: profile } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated || !!user,
  });

  const currentUser = user || profile;
  const userRoles = getUserRoles(currentUser);
  const isSuperAdmin = userRoles.includes("SUPER_ADMIN");
  const isAdmin = userRoles.includes("ADMIN") || isSuperAdmin;
  const isSeller = userRoles.includes("SELLER");
  const isRider = userRoles.includes("RIDER");

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-xs">
        {/* Top Utility Bar (Desktop only, role & auth aware) */}
        <div className="hidden md:block bg-muted/40 border-b border-border/40 py-1.5 px-4 text-xs text-muted-foreground">
          <div className="container mx-auto flex items-center justify-between gap-4">
            {/* Left: Contact Hotline */}
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium hover:text-foreground transition-colors">
                <Phone className="h-3.5 w-3.5 text-primary" />
                <span>+880 1767-476724</span>
              </span>
              <span className="hidden lg:flex items-center gap-1.5 hover:text-foreground transition-colors">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span>codeswithrakib@gmail.com</span>
              </span>
            </div>

            {/* Right: Dynamic Role & Auth Route Links */}
            <div className="flex items-center gap-3 lg:gap-5">
              {/* Super Admin Quick Jump */}
              {isSuperAdmin && (
                <Link
                  href={`/${lang}/super-admin`}
                  className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>{isBn ? "সুপার অ্যাডমিন কনসোল" : "Super Admin"}</span>
                </Link>
              )}

              {/* Admin Quick Jump */}
              {isAdmin && !isSuperAdmin && (
                <Link
                  href={`/${lang}/admin`}
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>{isBn ? "অ্যাডমিন প্যানেল" : "Admin Panel"}</span>
                </Link>
              )}

              {/* Seller Portal Quick Jump (Only if user IS a seller) */}
              {isSeller && (
                <Link
                  href={`/${lang}/seller`}
                  className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
                >
                  <Store className="h-3.5 w-3.5" />
                  <span>{isBn ? "সেলার পোর্টাল" : "Seller Portal"}</span>
                </Link>
              )}

              {/* Rider Portal Quick Jump (Only if user IS a rider) */}
              {isRider && (
                <Link
                  href={`/${lang}/rider`}
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                >
                  <Bike className="h-3.5 w-3.5" />
                  <span>{isBn ? "রাইডার ড্যাশবোর্ড" : "Rider App"}</span>
                </Link>
              )}

              {/* Become a Seller link (Hidden if user IS already a seller or admin) */}
              {!isSeller && !isAdmin && (
                <Link
                  href={`/${lang}/become-a-seller`}
                  className="inline-flex items-center gap-1 font-medium hover:text-primary transition-colors"
                >
                  <Store className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{isBn ? "সেলার হন" : "Become a Seller"}</span>
                </Link>
              )}

              {/* Become a Rider link (Hidden if user IS already a rider or admin) */}
              {!isRider && !isAdmin && (
                <Link
                  href={`/${lang}/become-a-rider`}
                  className="inline-flex items-center gap-1 font-medium hover:text-primary transition-colors"
                >
                  <Bike className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{isBn ? "ডেলিভারি রাইডার হন" : "Become a Rider"}</span>
                </Link>
              )}

              {/* Track Orders (Shown if authenticated) */}
              {isAuthenticated && (
                <Link
                  href={`/${lang}/customer/orders`}
                  className="inline-flex items-center gap-1 font-medium hover:text-primary transition-colors"
                >
                  <Package className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{isBn ? "অর্ডার ট্র্যাকিং" : "Track Orders"}</span>
                </Link>
              )}

              {/* Help & Support */}
              <Link
                href={`/${lang}/contact`}
                className="inline-flex items-center gap-1 font-medium hover:text-primary transition-colors"
              >
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{isBn ? "সহায়তা" : "Help"}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Left Section: Logo & Mobile Menu Trigger */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden -ml-2 text-foreground hover:bg-muted"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">{isBn ? "মেনু" : "Menu"}</span>
            </Button>
            <Link href={`/${lang}`} className="flex items-center flex-shrink-0">
              <Image
                src="/logo.jpg"
                alt={isBn ? "গ্রামের বাজার" : "Gramer Bazar"}
                width={256}
                height={80}
                className="w-32 sm:w-44 h-10 sm:h-12 object-cover object-left mix-blend-multiply"
                priority
              />
            </Link>
          </div>

          {/* Center Section: Search Bar (Desktop only) */}
          <div className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl px-2">
            <SearchBar lang={lang} />
          </div>

          {/* Right Section: User Actions & Cart */}
          <UserActions lang={lang} />
        </div>

        {/* Mobile Search Bar (Shown below md breakpoint) */}
        <div className="md:hidden px-4 py-2.5 border-t border-border/40 bg-muted/20">
          <SearchBar lang={lang} />
        </div>

        {/* Desktop Category Navigation Sub-bar */}
        <div className="hidden md:block border-t border-border/50 bg-background/90 py-1.5 px-4 text-xs font-medium">
          <div className="container mx-auto flex items-center justify-between gap-4">
            {/* Left: Mega Menu Trigger & Category Quick Links */}
            <div className="flex items-center gap-3 lg:gap-4 overflow-x-auto no-scrollbar">
              <CategoryMegaMenu lang={lang} />

              <div className="h-4 w-px bg-border/60" />

              <Link
                href={`/${lang}/flash-sale`}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-bold transition-colors whitespace-nowrap"
              >
                <Zap className="h-3.5 w-3.5 fill-rose-500 text-rose-500 animate-pulse" />
                <span>{isBn ? "ফ্ল্যাশ সেল" : "Flash Sale"}</span>
                <Badge variant="destructive" className="text-[9px] h-4 px-1 py-0 uppercase">
                  {isBn ? "ছাড়" : "Sale"}
                </Badge>
              </Link>

              <Link
                href={`/${lang}/categories/fresh-vegetables`}
                className="hover:text-primary transition-colors whitespace-nowrap text-foreground/80 hover:font-semibold"
              >
                {isBn ? "তাজা শাকসবজি ও ফল" : "Fresh & Vegetables"}
              </Link>

              <Link
                href={`/${lang}/categories/grocery`}
                className="hover:text-primary transition-colors whitespace-nowrap text-foreground/80 hover:font-semibold"
              >
                {isBn ? "মুদি বাজার" : "Grocery"}
              </Link>

              <Link
                href={`/${lang}/categories/food`}
                className="hover:text-primary transition-colors whitespace-nowrap text-foreground/80 hover:font-semibold"
              >
                {isBn ? "খাবার ও বেকারি" : "Food"}
              </Link>

              <Link
                href={`/${lang}/categories/cosmetics`}
                className="hover:text-primary transition-colors whitespace-nowrap text-foreground/80 hover:font-semibold"
              >
                {isBn ? "প্রসাধন সামগ্রী" : "Cosmetics"}
              </Link>

              <Link
                href={`/${lang}/categories/medicine-health`}
                className="hover:text-primary transition-colors whitespace-nowrap text-foreground/80 hover:font-semibold"
              >
                {isBn ? "ওষুধ ও স্বাস্থ্য" : "Medicine & Health"}
              </Link>
            </div>

            {/* Right: Trust Badge / Fast Delivery */}
            <div className="hidden xl:flex items-center gap-2 text-muted-foreground text-[11px] whitespace-nowrap">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>{isBn ? "১০০% খাঁটি পণ্য ও নিরাপদ ক্যাশ অন ডেলিভারি" : "100% Authentic Products & Safe Cash on Delivery"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileCategoryDrawer
        lang={lang}
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
export default Header;
