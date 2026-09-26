"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import {
  DashboardRoute,
  adminRoutes,
  superAdminRoutes,
  sellerRoutes,
  riderRoutes,
  customerRoutes,
} from "@/config/dashboard-routes";
import { api } from "@/store/api";
import { Menu, LogOut, Store, User, Settings, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { BrandLogo } from "@/components/common/BrandLogo";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DashboardLayoutProps {
  children: React.ReactNode;
  routeType: "admin" | "seller" | "rider" | "customer" | "super-admin";
  lang: string;
}

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  title: string;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon: Icon, title, isActive, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors font-medium ${
        isActive
          ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-2.5"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      }`}
    >
      <Icon
        className={`w-4 h-4 shrink-0 transition-colors ${
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        }`}
      />
      <span className="truncate">{title}</span>
    </Link>
  );
}

function SidebarContent({
  routes,
  lang,
  isBn,
  pathname,
  onItemClick,
}: {
  routes: DashboardRoute[];
  lang: string;
  isBn: boolean;
  pathname: string;
  onItemClick?: () => void;
}) {
  // Group routes by section for clean visual non-interactive section labels
  const sections: { title: string; titleBn: string; items: DashboardRoute[] }[] = [];
  routes.forEach((route) => {
    const secTitle = route.section || "Main";
    const secTitleBn = route.sectionBn || "মূল";
    let existing = sections.find((s) => s.title === secTitle);
    if (!existing) {
      existing = { title: secTitle, titleBn: secTitleBn, items: [] };
      sections.push(existing);
    }
    existing.items.push(route);
  });

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-border shrink-0">
        <Link
          href={`/${lang}`}
          onClick={onItemClick}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <BrandLogo lang={lang} variant="full" width={138} height={38} />
        </Link>
      </div>

      {/* Flat Navigation with non-interactive section headers */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider select-none">
              {isBn ? section.titleBn : section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((route) => {
                const fullHref = `/${lang}${route.href}`;
                const isExactActive = pathname === fullHref;
                const isPrefixActive =
                  route.matchPrefixes?.some(
                    (p) => pathname === `/${lang}${p}` || pathname.startsWith(`/${lang}${p}/`)
                  ) ?? false;
                const isSubActive =
                  route.href !== "/admin" &&
                  route.href !== "/super-admin" &&
                  route.href !== "/seller" &&
                  route.href !== "/rider" &&
                  route.href !== "/customer" &&
                  pathname.startsWith(`${fullHref}/`);

                const isActive = isExactActive || isPrefixActive || isSubActive;

                return (
                  <NavItem
                    key={route.href}
                    href={fullHref}
                    icon={route.icon}
                    title={isBn ? route.titleBn : route.title}
                    isActive={isActive}
                    onClick={onItemClick}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Note: Sidebar contains pure navigation. Logout is located exclusively in the Dashboard Header account menu. */}
    </div>
  );
}

export function DashboardLayout({
  children,
  routeType,
  lang,
}: DashboardLayoutProps) {
  const routesMap: Record<DashboardLayoutProps["routeType"], DashboardRoute[]> = {
    admin: adminRoutes,
    "super-admin": superAdminRoutes,
    seller: sellerRoutes,
    rider: riderRoutes,
    customer: customerRoutes,
  };
  const routes = routesMap[routeType] || adminRoutes;
  const isBn = lang === "bn";
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
          },
        }
      );
    } catch {
      // Ignore network error on logout
    } finally {
      dispatch(logout());
      dispatch(api.util.resetApiState());
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      router.push(`/${lang}/login`);
    }
  };

  // Determine the active title
  let activeTitle = isBn ? "ড্যাশবোর্ড" : "Dashboard";
  for (const route of routes) {
    const fullHref = `/${lang}${route.href}`;
    if (
      pathname === fullHref ||
      pathname.startsWith(`${fullHref}/`) ||
      route.matchPrefixes?.some(
        (p) => pathname === `/${lang}${p}` || pathname.startsWith(`/${lang}${p}/`)
      )
    ) {
      activeTitle = isBn ? route.titleBn : route.title;
      break;
    }
  }

  const userRoles = getUserRoles(user);
  const primaryRole = userRoles[0] || "User";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 sticky top-0 h-screen">
        <SidebarContent
          routes={routes}
          lang={lang}
          isBn={isBn}
          pathname={pathname}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Dashboard Header */}
        <header className="sticky top-0 z-30 h-16 bg-background border-b border-border flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden -ml-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Navigation Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>{isBn ? "ন্যাভিগেশন মেনু" : "Navigation Menu"}</SheetTitle>
                </SheetHeader>
                <SidebarContent
                  routes={routes}
                  lang={lang}
                  isBn={isBn}
                  pathname={pathname}
                  onItemClick={() => setMobileMenuOpen(false)}
                />
              </SheetContent>
            </Sheet>

            <h1 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">
              {activeTitle}
            </h1>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher currentLocale={lang} />
            <NotificationBell lang={lang} />

            {/* User Profile & Logout Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-muted/60 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs ring-1 ring-primary/20 shrink-0">
                    {user?.firstName?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                  </div>
                  <div className="hidden sm:block text-left text-xs">
                    <p className="font-semibold text-foreground leading-tight truncate max-w-[120px]">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-[10px] text-muted-foreground capitalize leading-tight">
                      {primaryRole.toLowerCase().replace("_", " ")}
                    </p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl shadow-lg border-border">
                <DropdownMenuLabel className="px-2 py-1.5 font-normal">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {user?.email || user?.phone}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2 text-xs">
                  <Link
                    href={
                      routeType === "seller"
                        ? `/${lang}/seller/profile`
                        : routeType === "rider"
                        ? `/${lang}/rider/profile`
                        : `/${lang}/customer/profile`
                    }
                    className="flex items-center gap-2 w-full"
                  >
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{isBn ? "প্রোফাইল" : "Profile"}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2 text-xs">
                  <Link
                    href={
                      routeType === "admin"
                        ? `/${lang}/admin/settings`
                        : routeType === "super-admin"
                        ? `/${lang}/super-admin/settings`
                        : `/${lang}/customer/settings`
                    }
                    className="flex items-center gap-2 w-full"
                  >
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{isBn ? "সেটিংস" : "Settings"}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setIsLogoutModalOpen(true);
                  }}
                  className="rounded-lg cursor-pointer py-2 text-xs text-destructive focus:text-destructive focus:bg-destructive/10 flex items-center gap-2"
                >
                  <LogOut className="h-3.5 w-3.5 text-destructive" />
                  <span>{isBn ? "লগআউট" : "Logout"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
          <div className="w-full">{children}</div>
        </main>
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
                : "Are you sure you want to log out of your dashboard?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setIsLogoutModalOpen(false)}
              disabled={isLoggingOut}
            >
              {isBn ? "বাতিল" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut
                ? isBn
                  ? "লগআউট হচ্ছে..."
                  : "Logging out..."
                : isBn
                ? "লগআউট"
                : "Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default DashboardLayout;
