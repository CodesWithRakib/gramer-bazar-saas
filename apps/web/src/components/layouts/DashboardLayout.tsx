"use client";

import React from "react";
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
import { Menu, LogOut, ChevronDown, Store, User, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { getUserRoles } from "@/lib/roles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
  routeType: "admin" | "seller" | "rider" | "customer" | "super-admin";
  lang: string;
}

const NavItem = ({
  href,
  icon: Icon,
  title,
  isActive,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  isActive: boolean;
  onClick?: () => void;
}) => {
  return (
    <Link
      onClick={onClick}
      href={href}
      className={`group flex items-center gap-3 px-3.5 py-3 text-sm font-medium rounded-2xl transition-all duration-300 ${
        isActive
          ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary shadow-sm border border-primary/15 relative font-semibold"
          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
      )}
      <Icon
        className={`w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
          isActive ? "text-primary" : "text-muted-foreground"
        }`}
      />
      <span className="truncate">{title}</span>
    </Link>
  );
};

const NavGroup = ({
  route,
  lang,
  isBn,
  pathname,
  onClick,
}: {
  route: DashboardRoute;
  lang: string;
  isBn: boolean;
  pathname: string;
  onClick?: () => void;
}) => {
  const isChildActive = (childHref: string) => {
    const fullHref = `/${lang}${childHref}`;
    return pathname === fullHref || pathname.startsWith(`${fullHref}/`);
  };

  const isParentExactActive = pathname === `/${lang}${route.href}`;
  const isAnyChildActive = route.children?.some((c) => isChildActive(c.href)) ?? false;
  const isPrefixActive =
    route.matchPrefixes?.some(
      (p) => pathname === `/${lang}${p}` || pathname.startsWith(`/${lang}${p}/`)
    ) ?? false;

  const isGroupActive = isParentExactActive || isAnyChildActive || isPrefixActive;

  // Auto-expand if active, and allow manual toggle
  const [isOpen, setIsOpen] = React.useState<boolean>(isGroupActive);

  React.useEffect(() => {
    if (isGroupActive) {
      setIsOpen(true);
    }
  }, [isGroupActive]);

  const Icon = route.icon;

  return (
    <div className="space-y-1">
      <div
        className={`group flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-2xl transition-all duration-300 ${
          isGroupActive
            ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border border-primary/10 font-semibold"
            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        }`}
      >
        <Link
          href={`/${lang}${route.href}`}
          onClick={onClick}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <Icon
            className={`w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
              isGroupActive ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <span className="truncate">{isBn ? route.titleBn : route.title}</span>
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className="p-1 rounded-lg hover:bg-background/80 transition-colors ml-1 text-muted-foreground hover:text-foreground"
          aria-label={isOpen ? "Collapse submenu" : "Expand submenu"}
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Expanded Child Routes */}
      {isOpen && route.children && route.children.length > 0 && (
        <div className="pl-3 pr-1 py-1 space-y-1 border-l-2 border-primary/20 ml-5 animate-in slide-in-from-top-1 duration-200">
          {route.children.map((child) => {
            const ChildIcon = child.icon;
            const active = isChildActive(child.href);
            return (
              <Link
                key={child.href}
                href={`/${lang}${child.href}`}
                onClick={onClick}
                className={`group flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-primary/15 text-primary font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <ChildIcon
                  className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    active ? "text-primary" : "text-muted-foreground/80"
                  }`}
                />
                <span className="truncate">{isBn ? child.titleBn : child.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

function SidebarContent({
  routes,
  lang,
  isBn,
  pathname,
  onLogout,
  onItemClick,
}: {
  routes: DashboardRoute[];
  lang: string;
  isBn: boolean;
  pathname: string;
  onLogout: () => void;
  onItemClick?: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-background/60 backdrop-blur-3xl border-r shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] relative overflow-hidden">
      {/* Decorative background blob */}
      <div className="absolute top-0 -left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="p-6 relative z-10">
        <Link href={`/${lang}`} onClick={onItemClick} className="flex items-center gap-3 group">
          <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-2.5 rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-primary/30">
            <Store className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Gramer Bazar
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto relative z-10 custom-scrollbar">
        {routes.map((route) => {
          if (route.children && route.children.length > 0) {
            return (
              <NavGroup
                key={route.href}
                route={route}
                lang={lang}
                isBn={isBn}
                pathname={pathname}
                onClick={onItemClick}
              />
            );
          }
          const fullHref = `/${lang}${route.href}`;
          const isActive = pathname === fullHref || pathname.startsWith(`${fullHref}/`);
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
      </nav>

      <div className="p-4 border-t border-muted/50 bg-background/40 relative z-10">
        <button
          onClick={onLogout}
          className="group flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-2xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300"
        >
          <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
          {isBn ? "লগআউট" : "Logout"}
        </button>
      </div>
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
    'super-admin': superAdminRoutes,
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      });
    } catch {
      // Ignore network error on logout
    }
    dispatch(logout());
    dispatch(api.util.resetApiState());
    router.push(`/${lang}/login`);
  };

  // Determine the active title by inspecting specific children first, then parent routes
  let activeTitle = isBn ? "ড্যাশবোর্ড" : "Dashboard";
  for (const route of routes) {
    if (route.children) {
      const matchedChild = route.children.find(
        (c) => pathname === `/${lang}${c.href}` || pathname.startsWith(`/${lang}${c.href}/`)
      );
      if (matchedChild) {
        activeTitle = isBn ? matchedChild.titleBn : matchedChild.title;
        break;
      }
    }
    if (pathname === `/${lang}${route.href}` || pathname.startsWith(`/${lang}${route.href}/`)) {
      activeTitle = isBn ? route.titleBn : route.title;
      break;
    }
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] flex-shrink-0 sticky top-0 h-screen">
        <SidebarContent
          routes={routes}
          lang={lang}
          isBn={isBn}
          pathname={pathname}
          onLogout={handleLogout}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        {/* Header */}
        <header className="sticky top-0 z-30 h-[76px] bg-background/70 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 border-b border-muted/50 shadow-sm supports-[backdrop-filter]:bg-background/40">
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SidebarContent
                  routes={routes}
                  lang={lang}
                  isBn={isBn}
                  pathname={pathname}
                  onLogout={handleLogout}
                  onItemClick={() => setMobileMenuOpen(false)}
                />
              </SheetContent>
            </Sheet>

            <h1 className="text-xl font-bold hidden sm:block">
              {activeTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSwitcher currentLocale={lang} />
            <NotificationBell lang={lang} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-muted/80 p-1.5 rounded-full transition-all duration-300 hover:shadow-sm">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold shadow-sm ring-1 ring-primary/20">
                    {user?.firstName?.[0] || "U"}
                  </div>
                  <div className="hidden md:block text-left text-sm mr-1">
                    <p className="font-semibold leading-none text-foreground">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize font-medium">
                      {getUserRoles(user)[0]?.toLowerCase() || "User"}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border-muted/50">
                <div className="px-2 py-2 mb-2 border-b">
                  <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
                  <Link href={routeType === 'seller' ? `/${lang}/seller/profile` : routeType === 'rider' ? `/${lang}/rider/profile` : `/${lang}/customer/profile`}>
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{isBn ? "প্রোফাইল" : "Profile"}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5 mb-1">
                  <Link href={routeType === 'admin' ? `/${lang}/admin/settings` : routeType === 'super-admin' ? `/${lang}/super-admin/settings` : `/${lang}/customer/settings`}>
                    <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{isBn ? "সেটিংস" : "Settings"}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer rounded-xl py-2.5"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isBn ? "লগআউট" : "Logout"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content - Full Width on large screens without artificial max-width constraints */}
        <main className="flex-1 p-4 md:p-8">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
