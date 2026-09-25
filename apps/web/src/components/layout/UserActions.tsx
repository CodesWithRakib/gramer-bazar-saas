"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { MapPin, ShoppingCart, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RootState } from "@/store/store";
import { logout, setUser } from "@/store/slices/authSlice";
import { setCartOpen } from "@/store/slices/cartSlice";
import { useGetProfileQuery } from "@/features/auth/authApi";
import { useGetUserWishlistQuery } from "@/features/wishlists/wishlistsApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

  const roles = user?.roles || profile?.roles || [];

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* Location Badge - Hidden on small mobile */}
      <Button
        variant="outline"
        className="hidden lg:flex items-center gap-2 rounded-full h-10"
      >
        <MapPin className="h-4 w-4 text-primary" />
        <span className="text-sm truncate max-w-[120px]">
          {isBn ? "খানসামা, দিনাজপুর" : "Khansama, Dinajpur"}
        </span>
      </Button>

      <div className="flex items-center gap-1 sm:gap-2 ml-1">
        {/* Language Switcher */}
        <Button variant="ghost" size="sm" className="font-semibold h-10 hidden sm:inline-flex" asChild>
          <Link href={lang === "en" ? "/bn" : "/en"}>
            {lang === "en" ? "BN" : "EN"}
          </Link>
        </Button>

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
          <div className="w-9 sm:w-20 h-10 bg-muted animate-pulse rounded-full sm:rounded-md ml-1" />
        ) : isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:w-auto sm:px-4 sm:rounded-md rounded-full h-10 w-10">
                <User className="h-5 w-5 sm:hidden" />
                <span className="hidden sm:inline-block font-medium">
                  {user?.firstName || profile?.firstName || (isBn ? "প্রোফাইল" : "Profile")}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {roles.includes("SUPER_ADMIN") && (
                <DropdownMenuItem asChild>
                  <Link href={`/${lang}/super-admin`} className="cursor-pointer font-bold text-amber-600 dark:text-amber-400">
                    {isBn ? "সুপার অ্যাডমিন কনসোল" : "Super Admin Console"}
                  </Link>
                </DropdownMenuItem>
              )}

              {(roles.includes("ADMIN") || roles.includes("SUPER_ADMIN")) && (
                <DropdownMenuItem asChild>
                  <Link href={`/${lang}/admin`} className="cursor-pointer font-medium text-primary">
                    {isBn ? "অ্যাডমিন প্যানেল" : "Admin Dashboard"}
                  </Link>
                </DropdownMenuItem>
              )}

              {roles.includes("SELLER") && (
                <DropdownMenuItem asChild>
                  <Link href={`/${lang}/seller`} className="cursor-pointer font-medium text-emerald-600 dark:text-emerald-400">
                    {isBn ? "সেলার পোর্টাল" : "Seller Portal"}
                  </Link>
                </DropdownMenuItem>
              )}

              {roles.includes("RIDER") && (
                <DropdownMenuItem asChild>
                  <Link href={`/${lang}/rider`} className="cursor-pointer font-medium text-blue-600 dark:text-blue-400">
                    {isBn ? "রাইডার অ্যাপ" : "Rider App"}
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem asChild>
                <Link href={`/${lang}/customer/profile`} className="cursor-pointer">
                  {isBn ? "আমার প্রোফাইল" : "My Profile"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${lang}/customer/orders`} className="cursor-pointer">
                  {isBn ? "আমার অর্ডার" : "My Orders"}
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              {/* Add Language Switcher for mobile inside dropdown */}
              <DropdownMenuItem asChild className="sm:hidden">
                <Link href={lang === "en" ? "/bn" : "/en"} className="cursor-pointer font-medium">
                  {lang === "en" ? "Change to Bengali" : "Change to English"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="sm:hidden" />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setIsLogoutModalOpen(true);
                }}
                className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
              >
                {isBn ? "লগআউট" : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild className="h-10 rounded-full px-6">
            <Link href={`/${lang}/login`}>
              {isBn ? "লগইন" : "Login"}
            </Link>
          </Button>
        )}
      </div>

      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isBn ? "লগআউট নিশ্চিত করুন" : "Confirm Logout"}
            </DialogTitle>
            <DialogDescription>
              {isBn
                ? "আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?"
                : "Are you sure you want to logout of your account?"}
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
