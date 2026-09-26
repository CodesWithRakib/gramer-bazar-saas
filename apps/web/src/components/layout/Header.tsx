"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
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
  Package,
  HelpCircle,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  lang: string;
}

export function Header({ lang }: HeaderProps) {
  const pathname = usePathname();
  const isSearchPage = pathname?.includes("/search") ?? false;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(isSearchPage);
  const isBn = lang === "bn";

  const { isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

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

            {/* Right: Public & Customer Links (Role actions reside exclusively in User Dropdown) */}
            <div className="flex items-center gap-3 lg:gap-5">
              <Link
                href={`/${lang}/become-a-seller`}
                className="inline-flex items-center gap-1 font-medium hover:text-primary transition-colors"
              >
                <Store className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{isBn ? "সেলার হন" : "Become a Seller"}</span>
              </Link>

              <Link
                href={`/${lang}/become-a-rider`}
                className="inline-flex items-center gap-1 font-medium hover:text-primary transition-colors"
              >
                <Bike className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{isBn ? "ডেলিভারি রাইডার হন" : "Become a Rider"}</span>
              </Link>

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

          {/* Right Section: Mobile Search Toggle & User Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSearchOpen((prev) => !prev)}
              className="md:hidden text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label={
                isBn
                  ? isMobileSearchOpen
                    ? "অনুসন্ধান বন্ধ করুন"
                    : "অনুসন্ধান খুলুন"
                  : isMobileSearchOpen
                    ? "Close search"
                    : "Open search"
              }
            >
              {isMobileSearchOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
            <UserActions lang={lang} />
          </div>
        </div>

        {/* Mobile Search Bar (Collapsible on mobile to save vertical viewport space) */}
        {isMobileSearchOpen && (
          <div className="md:hidden px-4 py-2.5 border-t border-border/40 bg-muted/20 animate-in slide-in-from-top-2 duration-150">
            <SearchBar lang={lang} autoFocus />
          </div>
        )}

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
                <Zap className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                <span>{isBn ? "ফ্ল্যাশ সেল" : "Flash Sale"}</span>
                <Badge
                  variant="destructive"
                  className="text-[9px] h-4 px-1 py-0 uppercase"
                >
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
              <span>
                {isBn
                  ? "১০০% খাঁটি পণ্য ও নিরাপদ ক্যাশ অন ডেলিভারি"
                  : "100% Authentic Products & Safe Cash on Delivery"}
              </span>
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
