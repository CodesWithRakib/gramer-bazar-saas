"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { getUserRoles } from "@/lib/roles";
import { useGetProfileQuery } from "@/features/auth/authApi";
import { api } from "@/store/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  ChevronDown,
  Zap,
  ShoppingBag,
  PhoneCall,
  HelpCircle,
  FileText,
  User,
  Store,
  Bike,
  LayoutDashboard,
  ShieldAlert,
  Package,
  Heart,
  MapPin,
  AlertCircle,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useGetPublicCategoryTreeQuery } from "@/features/catalog/catalogApi";
import { cn } from "@/lib/utils";

interface MobileCategoryDrawerProps {
  lang: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileCategoryDrawer({
  lang,
  isOpen,
  onOpenChange,
}: MobileCategoryDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const isBn = lang === "bn";
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

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

  const { data: categories = [], isLoading } = useGetPublicCategoryTreeQuery();

  const toggleCategory = (slug: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const handleLanguageChange = (newLang: string) => {
    if (newLang === lang) return;
    const newPath = pathname.replace(`/${lang}`, `/${newLang}`);
    router.push(newPath);
    onOpenChange(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" }).catch(() => {});
    } catch {}
    dispatch(logout());
    dispatch(api.util.resetApiState());
    onOpenChange(false);
    router.push(`/${lang}/login`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[85vw] max-w-[340px] p-0 flex flex-col bg-background"
      >
        {/* Header */}
        <SheetHeader className="p-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between">
            <Link href={`/${lang}`} onClick={() => onOpenChange(false)}>
              <Image
                src="/logo.jpg"
                alt="Gramer Bazar"
                width={160}
                height={50}
                className="w-32 h-10 object-cover object-left mix-blend-multiply"
                priority
              />
            </Link>
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-background border border-border/80 rounded-lg p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleLanguageChange("en")}
                className={cn(
                  "px-2 py-1 rounded transition-colors",
                  !isBn
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange("bn")}
                className={cn(
                  "px-2 py-1 rounded transition-colors",
                  isBn
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                বাংলা
              </button>
            </div>
          </div>
          <SheetTitle className="sr-only">
            {isBn ? "ন্যাভিগেশন মেনু" : "Navigation Menu"}
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* User Auth Card */}
          {isAuthenticated ? (
            <div className="rounded-xl border border-border/80 bg-muted/30 p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm ring-1 ring-primary/20 shrink-0">
                    {currentUser?.firstName?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-foreground truncate">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {currentUser?.email || currentUser?.phone}
                    </p>
                  </div>
                </div>

                {isSuperAdmin ? (
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300/40 text-[10px] px-1.5 py-0 h-4 shrink-0">
                    Super Admin
                  </Badge>
                ) : isAdmin ? (
                  <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] px-1.5 py-0 h-4 shrink-0">
                    Admin
                  </Badge>
                ) : isSeller ? (
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300/40 text-[10px] px-1.5 py-0 h-4 shrink-0">
                    Seller
                  </Badge>
                ) : isRider ? (
                  <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-300/40 text-[10px] px-1.5 py-0 h-4 shrink-0">
                    Rider
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground shrink-0">
                    Customer
                  </Badge>
                )}
              </div>

              {/* Role Portals */}
              <div className="space-y-1 pt-1 border-t border-border/40">
                {isSuperAdmin && (
                  <Link
                    href={`/${lang}/super-admin`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
                  >
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    <span>{isBn ? "সুপার অ্যাডমিন কনসোল" : "Super Admin Console"}</span>
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    href={`/${lang}/admin`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{isBn ? "অ্যাডমিন ড্যাশবোর্ড" : "Admin Dashboard"}</span>
                  </Link>
                )}

                {isSeller && (
                  <Link
                    href={`/${lang}/seller`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  >
                    <Store className="h-4 w-4 text-emerald-600" />
                    <span>{isBn ? "সেলার পোর্টাল" : "Seller Portal"}</span>
                  </Link>
                )}

                {isRider && (
                  <Link
                    href={`/${lang}/rider`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors"
                  >
                    <Bike className="h-4 w-4 text-blue-600" />
                    <span>{isBn ? "রাইডার ড্যাশবোর্ড" : "Rider App"}</span>
                  </Link>
                )}

                {/* Customer Account Links */}
                <Link
                  href={`/${lang}/customer/orders`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{isBn ? "আমার অর্ডারসমূহ" : "My Orders"}</span>
                </Link>

                <Link
                  href={`/${lang}/customer/profile`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{isBn ? "আমার প্রোফাইল" : "My Profile"}</span>
                </Link>

                <Link
                  href={`/${lang}/customer/wishlist`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span>{isBn ? "উইশলিস্ট" : "Wishlist"}</span>
                </Link>

                <Link
                  href={`/${lang}/customer/disputes`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span>{isBn ? "অভিযোগ ও সহায়তা" : "Disputes & Support"}</span>
                </Link>

                {/* Opportunities */}
                {!isSeller && !isAdmin && (
                  <Link
                    href={`/${lang}/become-a-seller`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  >
                    <Store className="h-4 w-4" />
                    <span>{isBn ? "সেলার হতে আবেদন" : "Become a Seller"}</span>
                  </Link>
                )}

                {!isRider && !isAdmin && (
                  <Link
                    href={`/${lang}/become-a-rider`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors"
                  >
                    <Bike className="h-4 w-4" />
                    <span>{isBn ? "রাইডার হতে আবেদন" : "Become a Rider"}</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{isBn ? "লগআউট" : "Logout"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border/80 bg-muted/30 p-3 space-y-2.5">
              <p className="text-xs text-muted-foreground font-medium">
                {isBn
                  ? "গ্রামের বাজারে স্বাগতম! লগইন করুন সেরা সুবিধার জন্য।"
                  : "Welcome to Gramer Bazar! Sign in for full features."}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild size="sm" className="w-full rounded-lg text-xs font-semibold">
                  <Link href={`/${lang}/login`} onClick={() => onOpenChange(false)}>
                    {isBn ? "লগইন" : "Login"}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full rounded-lg text-xs font-semibold"
                >
                  <Link href={`/${lang}/register`} onClick={() => onOpenChange(false)}>
                    {isBn ? "রেজিস্টার" : "Register"}
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40">
                <Link
                  href={`/${lang}/become-a-seller`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <Store className="h-3 w-3" />
                  <span>{isBn ? "সেলার হন" : "Sell on GB"}</span>
                </Link>
                <Link
                  href={`/${lang}/become-a-rider`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Bike className="h-3 w-3" />
                  <span>{isBn ? "রাইডার হন" : "Ride on GB"}</span>
                </Link>
              </div>
            </div>
          )}

          {/* Quick Deals Links */}
          <div className="space-y-1">
            <Link
              href={`/${lang}/flash-sale`}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
            >
              <Zap className="h-4 w-4 fill-rose-500 text-rose-500" />
              <span>{isBn ? "ফ্ল্যাশ সেল (বিশেষ ছাড়)" : "Flash Sales"}</span>
              <Badge
                variant="destructive"
                className="ml-auto text-[10px] h-4 px-1.5 uppercase font-bold"
              >
                {isBn ? "হট" : "Hot"}
              </Badge>
            </Link>

            <Link
              href={`/${lang}/categories`}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-muted transition-colors text-foreground"
            >
              <ShoppingBag className="h-4 w-4 text-primary" />
              <span>
                {isBn ? "সকল ক্যাটাগরি ব্রাউজ করুন" : "Browse All Categories"}
              </span>
            </Link>
          </div>

          <div className="h-px bg-border/60 my-2" />

          {/* Categories Accordion */}
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
              {isBn ? "পণ্য ক্যাটাগরি" : "Product Categories"}
            </div>

            {isLoading ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                {isBn ? "লোড হচ্ছে..." : "Loading categories..."}
              </div>
            ) : (
              <div className="space-y-1">
                {categories.map((cat) => {
                  const isExpanded = !!expandedCategories[cat.slug];
                  const hasChildren = cat.children && cat.children.length > 0;

                  return (
                    <div
                      key={cat.id}
                      className="rounded-xl border border-border/40 overflow-hidden bg-card"
                    >
                      <div className="flex items-center justify-between p-2.5 hover:bg-muted/40 transition-colors">
                        <Link
                          href={`/${lang}/categories/${cat.slug}`}
                          onClick={() => onOpenChange(false)}
                          className="flex items-center gap-2.5 flex-1 min-w-0 font-medium text-sm text-foreground"
                        >
                          <span className="text-base flex-shrink-0">
                            {cat.icon || "📦"}
                          </span>
                          <span className="truncate">
                            {isBn ? cat.nameBn : cat.nameEn}
                          </span>
                          {cat.productCount !== undefined &&
                            cat.productCount > 0 && (
                              <Badge
                                variant="outline"
                                className="text-[10px] h-4 px-1 text-muted-foreground font-normal"
                              >
                                {cat.productCount}
                              </Badge>
                            )}
                        </Link>

                        {hasChildren && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground ml-1"
                            onClick={() => toggleCategory(cat.slug)}
                          >
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                isExpanded && "rotate-180"
                              )}
                            />
                            <span className="sr-only">Toggle</span>
                          </Button>
                        )}
                      </div>

                      {/* Subcategories */}
                      {hasChildren && isExpanded && (
                        <div className="p-2 pt-0 bg-muted/20 border-t border-border/30 space-y-0.5">
                          {cat.children?.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/${lang}/categories/${cat.slug}/${sub.slug}`}
                              onClick={() => onOpenChange(false)}
                              className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                            >
                              <span className="truncate">
                                {isBn ? sub.nameBn : sub.nameEn}
                              </span>
                              <div className="flex items-center gap-1">
                                {sub.productCount !== undefined &&
                                  sub.productCount > 0 && (
                                    <span className="text-[10px] text-muted-foreground/70">
                                      ({sub.productCount})
                                    </span>
                                  )}
                                <ChevronRight className="h-3 w-3" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer info in drawer */}
        <div className="p-4 border-t border-border/60 bg-muted/20 space-y-2 text-xs">
          <Link
            href={`/${lang}/contact`}
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <PhoneCall className="h-3.5 w-3.5 text-primary" />
            <span>{isBn ? "গ্রাহক সহায়তা" : "Customer Support"}</span>
          </Link>
          <Link
            href={`/${lang}/faq`}
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5 text-primary" />
            <span>{isBn ? "সাধারণ জিজ্ঞাসা (FAQ)" : "Help & FAQ"}</span>
          </Link>
          <Link
            href={`/${lang}/privacy`}
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileText className="h-3.5 w-3.5 text-primary" />
            <span>{isBn ? "প্রাইভেসি পলিসি" : "Privacy Policy"}</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
export default MobileCategoryDrawer;
