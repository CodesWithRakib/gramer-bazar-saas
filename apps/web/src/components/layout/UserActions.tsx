"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  ShoppingCart,
  User,
  Heart,
  Store,
  Bike,
  LayoutDashboard,
  ShieldAlert,
  Package,
  Settings,
  AlertCircle,
  ShoppingBag,
  LogOut,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RootState } from "@/store/store";
import { logout, setUser } from "@/store/slices/authSlice";
import { setCartOpen } from "@/store/slices/cartSlice";
import { useGetProfileQuery } from "@/features/auth/authApi";
import { useGetUserWishlistQuery } from "@/features/wishlists/wishlistsApi";
import { getUserRoles } from "@/lib/roles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { api } from "@/store/api";

interface UserActionsProps {
  lang: string;
}

export function UserActions({ lang }: UserActionsProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const isBn = lang === "bn";

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const cartItemsCount = useSelector((state: RootState) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0)
  );

  const { data: profile } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated || !!user,
  });

  const { data: wishlist } = useGetUserWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });
  const wishlistCount = wishlist?.length || 0;

  useEffect(() => {
    if (profile && !user) {
      dispatch(setUser(profile));
    }
  }, [profile, user, dispatch]);

  const currentUser = user || profile;
  const userRoles = getUserRoles(currentUser);
  const isSuperAdmin = userRoles.includes("SUPER_ADMIN");
  const isAdmin = userRoles.includes("ADMIN") || isSuperAdmin;
  const isSeller = userRoles.includes("SELLER");
  const isRider = userRoles.includes("RIDER");

  const displayName =
    currentUser?.firstName ||
    currentUser?.lastName ||
    (isBn ? "প্রোফাইল" : "Profile");

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Language Switcher Dropdown */}
        <LanguageSwitcher currentLocale={lang} className="h-10" />

        {/* Wishlist Button */}
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 hidden sm:inline-flex"
            asChild
          >
            <Link href={`/${lang}/customer/wishlist`}>
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-background">
                  {wishlistCount}
                </span>
              )}
              <span className="sr-only">{isBn ? "উইশলিস্ট" : "Wishlist"}</span>
            </Link>
          </Button>
        )}

        {/* Cart Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(setCartOpen(true))}
          className="relative h-10 w-10"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartItemsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-background">
              {cartItemsCount}
            </span>
          )}
          <span className="sr-only">{isBn ? "কার্ট" : "Cart"}</span>
        </Button>

        {/* Auth / Profile */}
        {!mounted ? (
          <div className="w-9 sm:w-24 h-10 bg-muted animate-pulse rounded-full ml-1" />
        ) : isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 rounded-full px-2 sm:px-3 flex items-center gap-2 hover:bg-muted/80 border border-transparent hover:border-border/60 transition-all"
              >
                <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs ring-1 ring-primary/20">
                  {currentUser?.firstName?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                </div>
                <span className="hidden sm:inline-block font-semibold text-sm max-w-[100px] truncate text-foreground">
                  {displayName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 shadow-xl border-border/80 rounded-2xl">
              {/* User Header Profile Info */}
              <div className="px-3 py-2.5 rounded-xl bg-muted/40 mb-2 border border-border/40">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm text-foreground truncate">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                  {isSuperAdmin ? (
                    <Badge variant="warning" className="text-[10px] px-1.5 py-0 h-4">
                      Super Admin
                    </Badge>
                  ) : isAdmin ? (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
                      Admin
                    </Badge>
                  ) : isSeller ? (
                    <Badge variant="success" className="text-[10px] px-1.5 py-0 h-4">
                      Seller
                    </Badge>
                  ) : isRider ? (
                    <Badge variant="info" className="text-[10px] px-1.5 py-0 h-4">
                      Rider
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground">
                      Customer
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {currentUser?.email || currentUser?.phone}
                </p>
              </div>

              {/* Role Portals */}
              {isSuperAdmin && (
                <DropdownMenuItem asChild className="cursor-pointer py-2 rounded-lg font-semibold text-warning">
                  <Link href={`/${lang}/super-admin`} className="flex items-center gap-2.5">
                    <ShieldAlert className="h-4 w-4 text-warning" />
                    <span>{isBn ? "সুপার অ্যাডমিন কনসোল" : "Super Admin Console"}</span>
                  </Link>
                </DropdownMenuItem>
              )}

              {isAdmin && !isSuperAdmin && (
                <DropdownMenuItem asChild className="cursor-pointer py-2 rounded-lg font-semibold text-primary">
                  <Link href={`/${lang}/admin`} className="flex items-center gap-2.5">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{isBn ? "অ্যাডমিন ড্যাশবোর্ড" : "Admin Dashboard"}</span>
                  </Link>
                </DropdownMenuItem>
              )}

              {isSeller && (
                <DropdownMenuItem asChild className="cursor-pointer py-2 rounded-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  <Link href={`/${lang}/seller`} className="flex items-center gap-2.5">
                    <Store className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isBn ? "সেলার পোর্টাল" : "Seller Portal"}</span>
                  </Link>
                </DropdownMenuItem>
              )}

              {isRider && (
                <DropdownMenuItem asChild className="cursor-pointer py-2 rounded-lg font-semibold text-blue-600 dark:text-blue-400">
                  <Link href={`/${lang}/rider`} className="flex items-center gap-2.5">
                    <Bike className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>{isBn ? "রাইডার ড্যাশবোর্ড" : "Rider Dashboard"}</span>
                  </Link>
                </DropdownMenuItem>
              )}

              {(isAdmin || isSeller || isRider) && <DropdownMenuSeparator className="my-1.5" />}

              {/* Customer Account Section */}
              <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1">
                {isBn ? "আমার অ্যাকাউন্ট" : "My Account"}
              </DropdownMenuLabel>
              <DropdownMenuItem asChild className="cursor-pointer py-2 rounded-lg">
                <Link href={`/${lang}/customer/orders`} className="flex items-center gap-2.5">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{isBn ? "আমার অর্ডারসমূহ" : "My Orders"}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer py-2 rounded-lg">
                <Link href={`/${lang}/customer/profile`} className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{isBn ? "আমার প্রোফাইল" : "My Profile"}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer py-2 rounded-lg">
                <Link href={`/${lang}/customer/wishlist`} className="flex items-center gap-2.5">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span>{isBn ? "উইশলিস্ট" : "Wishlist"}</span>
                  {wishlistCount > 0 && (
                    <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1.5">
                      {wishlistCount}
                    </Badge>
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer py-2 rounded-lg">
                <Link href={`/${lang}/customer/addresses`} className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{isBn ? "ঠিকানা সমুহ" : "Saved Addresses"}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer py-2 rounded-lg">
                <Link href={`/${lang}/customer/disputes`} className="flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span>{isBn ? "অভিযোগ ও সহায়তা" : "Disputes & Support"}</span>
                </Link>
              </DropdownMenuItem>

              {/* Partner Opportunities (Only if user does NOT already have the role) */}
              {(!isSeller || !isRider) && !isAdmin && (
                <>
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>{isBn ? "উপার্জন করুন" : "Earn with Us"}</span>
                  </DropdownMenuLabel>
                  {!isSeller && (
                    <DropdownMenuItem asChild className="cursor-pointer py-2 rounded-lg text-emerald-600 dark:text-emerald-400">
                      <Link href={`/${lang}/become-a-seller`} className="flex items-center gap-2.5">
                        <Store className="h-4 w-4" />
                        <span>{isBn ? "সেলার হতে আবেদন" : "Become a Seller"}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {!isRider && (
                    <DropdownMenuItem asChild className="cursor-pointer py-2 rounded-lg text-blue-600 dark:text-blue-400">
                      <Link href={`/${lang}/become-a-rider`} className="flex items-center gap-2.5">
                        <Bike className="h-4 w-4" />
                        <span>{isBn ? "রাইডার হতে আবেদন" : "Become a Rider"}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                </>
              )}

              <DropdownMenuSeparator className="my-1.5" />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setIsLogoutModalOpen(true);
                }}
                className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10 rounded-lg py-2 flex items-center gap-2.5 font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>{isBn ? "লগআউট" : "Logout"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild className="h-10 rounded-full px-5 font-semibold shadow-xs">
            <Link href={`/${lang}/login`}>
              {isBn ? "লগইন" : "Login"}
            </Link>
          </Button>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isBn ? "লগআউট নিশ্চিত করুন" : "Confirm Logout"}
            </DialogTitle>
            <DialogDescription>
              {isBn
                ? "আপনি কি নিশ্চিত যে আপনি আপনার অ্যাকাউন্ট থেকে লগআউট করতে চান?"
                : "Are you sure you want to log out of your account?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              {isBn ? "বাতিল" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  await fetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => {});
                } catch {}
                dispatch(logout());
                dispatch(api.util.resetApiState());
                setIsLogoutModalOpen(false);
                router.push(`/${lang}/login`);
              }}
            >
              {isBn ? "লগআউট" : "Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
