"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Store,
  Bike,
  LayoutDashboard,
  ShieldCheck,
  Package,
  Heart,
  AlertCircle,
  LogOut,
  Phone,
  HelpCircle,
  FileText,
  User,
  Tag,
} from "lucide-react";
import { useGetPublicCategoryTreeQuery } from "@/features/catalog/catalogApi";
import { BrandLogo } from "@/components/common/BrandLogo";
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
        {/* Clean Header with Logo only */}
        <SheetHeader className="p-4 border-b border-border/70 bg-background text-left">
          <div className="flex items-center">
            <BrandLogo
              href={`/${lang}`}
              lang={lang}
              variant="full"
              width={145}
              height={40}
              onClick={() => onOpenChange(false)}
            />
          </div>
          <SheetTitle className="sr-only">
            {isBn ? "ন্যাভিগেশন মেনু" : "Navigation Menu"}
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* User Auth Card */}
          {isAuthenticated ? (
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-muted border border-border text-foreground font-semibold flex items-center justify-center text-xs shrink-0">
                    {currentUser?.firstName?.[0]?.toUpperCase() || <User className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-xs text-foreground truncate">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {currentUser?.email || currentUser?.phone}
                    </p>
                  </div>
                </div>

                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal shrink-0">
                  {isSuperAdmin
                    ? "Super Admin"
                    : isAdmin
                    ? "Admin"
                    : isSeller
                    ? "Seller"
                    : isRider
                    ? "Rider"
                    : "Customer"}
                </Badge>
              </div>

              {/* Portal Links */}
              <div className="space-y-0.5 pt-2 border-t border-border/50 text-xs">
                {isSuperAdmin && (
                  <Link
                    href={`/${lang}/super-admin`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    <span>{isBn ? "সুপার অ্যাডমিন কনসোল" : "Super Admin Console"}</span>
                  </Link>
                )}

                {isAdmin && !isSuperAdmin && (
                  <Link
                    href={`/${lang}/admin`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    <span>{isBn ? "অ্যাডমিন ড্যাশবোর্ড" : "Admin Dashboard"}</span>
                  </Link>
                )}

                {isSeller && (
                  <Link
                    href={`/${lang}/seller`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <span>{isBn ? "সেলার পোর্টাল" : "Seller Portal"}</span>
                  </Link>
                )}

                {isRider && (
                  <Link
                    href={`/${lang}/rider`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Bike className="h-4 w-4 text-muted-foreground" />
                    <span>{isBn ? "রাইডার ড্যাশবোর্ড" : "Rider Dashboard"}</span>
                  </Link>
                )}

                {/* Customer Account Links */}
                <Link
                  href={`/${lang}/customer/orders`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Package className="h-3.5 w-3.5" />
                  <span>{isBn ? "আমার অর্ডারসমূহ" : "My Orders"}</span>
                </Link>

                <Link
                  href={`/${lang}/customer/wishlist`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Heart className="h-3.5 w-3.5" />
                  <span>{isBn ? "পছন্দের তালিকা" : "Wishlist"}</span>
                </Link>

                <Link
                  href={`/${lang}/customer/disputes`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{isBn ? "অভিযোগ ও সহায়তা" : "Disputes & Support"}</span>
                </Link>

                {/* Partner Opportunities */}
                {!isSeller && !isAdmin && (
                  <Link
                    href={`/${lang}/become-a-seller`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Store className="h-3.5 w-3.5" />
                    <span>{isBn ? "সেলার হতে আবেদন" : "Become a Seller"}</span>
                  </Link>
                )}

                {!isRider && !isAdmin && (
                  <Link
                    href={`/${lang}/become-a-rider`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Bike className="h-3.5 w-3.5" />
                    <span>{isBn ? "রাইডার হতে আবেদন" : "Become a Rider"}</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-left"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{isBn ? "লগআউট" : "Logout"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-2.5">
              <p className="text-xs text-muted-foreground">
                {isBn
                  ? "গ্রামের বাজারে স্বাগতম! কেনাকাটা সহজ করতে লগইন করুন।"
                  : "Welcome to Gramer Bazar! Sign in for full features."}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild size="sm" className="w-full rounded-lg text-xs font-medium">
                  <Link href={`/${lang}/login`} onClick={() => onOpenChange(false)}>
                    {isBn ? "লগইন" : "Sign In"}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full rounded-lg text-xs font-medium"
                >
                  <Link href={`/${lang}/register`} onClick={() => onOpenChange(false)}>
                    {isBn ? "রেজিস্টার" : "Register"}
                  </Link>
                </Button>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                <Link
                  href={`/${lang}/become-a-seller`}
                  onClick={() => onOpenChange(false)}
                  className="hover:text-foreground hover:underline"
                >
                  {isBn ? "সেলার হতে আবেদন" : "Become a Seller"}
                </Link>
                <span>•</span>
                <Link
                  href={`/${lang}/become-a-rider`}
                  onClick={() => onOpenChange(false)}
                  className="hover:text-foreground hover:underline"
                >
                  {isBn ? "রাইডার হতে আবেদন" : "Become a Rider"}
                </Link>
              </div>
            </div>
          )}

          {/* Primary Quick Links */}
          <div className="space-y-1 text-xs">
            <Link
              href={`/${lang}/flash-sale`}
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg font-medium text-foreground hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span>{isBn ? "ফ্ল্যাশ সেল (ছাড়)" : "Flash Sale"}</span>
              </div>
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-normal">
                {isBn ? "ছাড়" : "Sale"}
              </Badge>
            </Link>

            <Link
              href={`/${lang}/shops`}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Store className="h-4 w-4 text-muted-foreground" />
              <span>{isBn ? "দোকান ও বিক্রেতা" : "Verified Shops"}</span>
            </Link>

            <Link
              href={`/${lang}/offers`}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span>{isBn ? "বিশেষ অফার" : "Special Offers"}</span>
            </Link>

            <Link
              href={`/${lang}/categories`}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-foreground hover:bg-muted transition-colors"
            >
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              <span>{isBn ? "সকল ক্যাটাগরি ব্রাউজ করুন" : "Browse All Categories"}</span>
            </Link>
          </div>

          <div className="h-px bg-border/60 my-2" />

          {/* Product Categories */}
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
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
                      className="rounded-lg border border-border/40 overflow-hidden bg-card"
                    >
                      <div className="flex items-center justify-between p-2 hover:bg-muted/40 transition-colors">
                        <Link
                          href={`/${lang}/categories/${cat.slug}`}
                          onClick={() => onOpenChange(false)}
                          className="flex items-center gap-2 flex-1 min-w-0 font-medium text-xs text-foreground"
                        >
                          <span className="truncate">
                            {isBn ? cat.nameBn : cat.nameEn}
                          </span>
                          {cat.productCount !== undefined && cat.productCount > 0 && (
                            <span className="text-[10px] text-muted-foreground font-normal">
                              ({cat.productCount})
                            </span>
                          )}
                        </Link>

                        {hasChildren && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground ml-1 p-0"
                            onClick={() => toggleCategory(cat.slug)}
                          >
                            <ChevronDown
                              className={cn(
                                "h-3.5 w-3.5 transition-transform duration-200",
                                isExpanded && "rotate-180"
                              )}
                            />
                            <span className="sr-only">Toggle</span>
                          </Button>
                        )}
                      </div>

                      {/* Subcategories */}
                      {hasChildren && isExpanded && (
                        <div className="p-1.5 pt-0 bg-muted/20 border-t border-border/30 space-y-0.5">
                          {cat.children?.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/${lang}/categories/${cat.slug}/${sub.slug}`}
                              onClick={() => onOpenChange(false)}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                            >
                              <span className="truncate">
                                {isBn ? sub.nameBn : sub.nameEn}
                              </span>
                              <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
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

        {/* Clean Footer Info in Drawer */}
        <div className="p-3 border-t border-border/60 bg-muted/10 space-y-1.5 text-xs">
          <Link
            href={`/${lang}/contact`}
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>{isBn ? "যোগাযোগ ও কাস্টমার কেয়ার" : "Contact & Support"}</span>
          </Link>
          <Link
            href={`/${lang}/faq`}
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{isBn ? "সাধারণ প্রশ্নোত্তর (FAQ)" : "Help & FAQ"}</span>
          </Link>
          <Link
            href={`/${lang}/privacy`}
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>{isBn ? "গোপনীয়তা ও নীতি" : "Privacy Policy"}</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
export default MobileCategoryDrawer;
