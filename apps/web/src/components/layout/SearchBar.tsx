"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  lang: string;
  className?: string;
  id?: string;
}

export function SearchBar({ lang, className, id }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const isBn = lang === "bn";

  useEffect(() => {
    setSearchTerm(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/${lang}/search?q=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push(`/${lang}/search`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className={cn("relative flex w-full items-center", className)}
    >
      <Input
        id={id}
        type="search"
        placeholder={isBn ? "পণ্য খুঁজুন..." : "Search for products..."}
        className="w-full pr-12 rounded-full bg-muted/50 border-muted focus-visible:ring-primary shadow-none"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full w-12 rounded-r-full text-muted-foreground hover:text-foreground hover:bg-transparent"
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">{isBn ? "খুঁজুন" : "Search"}</span>
      </Button>
    </form>
  );
}
