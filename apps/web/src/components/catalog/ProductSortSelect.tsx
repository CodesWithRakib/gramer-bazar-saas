"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductSortSelectProps {
  lang: string;
}

export function ProductSortSelect({ lang }: ProductSortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isBn = lang === "bn";

  const sort = searchParams.get("sort") || "newest";

  const updateSort = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", val);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={sort} onValueChange={updateSort}>
      <SelectTrigger className="w-[180px] h-9">
        <SelectValue placeholder={isBn ? "সর্ট করুন" : "Sort by"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">
          {isBn ? "নতুন পণ্য" : "Newest Arrivals"}
        </SelectItem>
        <SelectItem value="price_asc">
          {isBn ? "দাম: কম থেকে বেশি" : "Price: Low to High"}
        </SelectItem>
        <SelectItem value="price_desc">
          {isBn ? "দাম: বেশি থেকে কম" : "Price: High to Low"}
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
