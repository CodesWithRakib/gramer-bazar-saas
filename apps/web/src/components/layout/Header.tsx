"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchBar } from "./SearchBar";
import { UserActions } from "./UserActions";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  lang: string;
}

export function Header({ lang }: HeaderProps) {
  const isBn = lang === "bn";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left Section: Logo & Mobile Menu Trigger */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="md:hidden -ml-2">
            <Menu className="h-6 w-6" />
            <span className="sr-only">{isBn ? "মেনু" : "Menu"}</span>
          </Button>
          <Link href={`/${lang}`} className="flex items-center">
            <Image
              src="/logo.jpg"
              alt={isBn ? "গ্রামের বাজার" : "Gramer Bazar"}
              width={256}
              height={80}
              className="w-36 sm:w-48 h-10 sm:h-14 object-cover object-left mix-blend-multiply"
              priority
            />
          </Link>
        </div>

        {/* Center Section: Search Bar (Desktop only) */}
        <div className="hidden md:flex flex-1 max-w-2xl px-4">
          <SearchBar lang={lang} />
        </div>

        {/* Right Section: User Actions & Cart */}
        <UserActions lang={lang} />
      </div>
      
      {/* Mobile Search Bar (Only shown below md breakpoint) */}
      <div className="md:hidden px-4 py-3 border-t bg-muted/20">
        <SearchBar lang={lang} />
      </div>
    </header>
  );
}
