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
  sellerRoutes,
  riderRoutes,
  customerRoutes,
} from "@/config/dashboard-routes";
import { Menu, LogOut, ChevronDown, Store } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { getUserRoles } from "@/lib/roles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
  routeType: "admin" | "seller" | "rider" | "customer";
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
      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 ${
        isActive
          ? "bg-primary/10 text-primary shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon
        className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
      />
      {title}
    </Link>
  );
};

function SidebarContent({
  routes,
  lang,
  isBn,
  activeHref,
  onLogout,
}: {
  routes: DashboardRoute[];
  lang: string;
  isBn: boolean;
  activeHref: string | null;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-6">
        <Link href={`/${lang}`} className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Store className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">
            Gramer Bazar
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {routes.map((route) => (
          <NavItem
            key={route.href}
            href={`/${lang}${route.href}`}
            icon={route.icon}
            title={isBn ? route.titleBn : route.title}
            isActive={activeHref === route.href}
          />
        ))}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
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
    seller: sellerRoutes,
    rider: riderRoutes,
    customer: customerRoutes,
  };
  const routes = routesMap[routeType];
  const isBn = lang === "bn";
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push(`/${lang}/login`);
  };

  // Resolve the active route by the LONGEST matching href. A plain `find`
  // returns the first prefix match, so nested pages such as
  // `/[lang]/rider/deliveries` would resolve to the `/rider` dashboard entry.
  const activeHref =
    routes
      .filter(
        (r) =>
          pathname === `/${lang}${r.href}` ||
          pathname.startsWith(`/${lang}${r.href}/`),
      )
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;

  const currentRoute = routes.find((r) => r.href === activeHref);

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] flex-shrink-0 sticky top-0 h-screen">
        <SidebarContent
          routes={routes}
          lang={lang}
          isBn={isBn}
          activeHref={activeHref}
          onLogout={handleLogout}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 h-[72px] bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 border-b shadow-sm">
          <div className="flex items-center gap-4">
            <Sheet>
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
                  activeHref={activeHref}
                  onLogout={handleLogout}
                />
              </SheetContent>
            </Sheet>

            <h1 className="text-xl font-bold hidden sm:block">
              {currentRoute
                ? isBn
                  ? currentRoute.titleBn
                  : currentRoute.title
                : "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <NotificationBell lang={lang} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-muted/50 p-1.5 rounded-full transition-colors">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold overflow-hidden">
                    {user?.firstName?.[0] || "U"}
                  </div>
                  <div className="hidden md:block text-left text-sm mr-1">
                    <p className="font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      {getUserRoles(user)[0]?.toLowerCase() || "User"}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isBn ? "লগআউট" : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
