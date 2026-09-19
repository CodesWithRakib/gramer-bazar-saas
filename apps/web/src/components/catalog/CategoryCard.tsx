import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { Category } from '@/features/catalog/catalogApi';

interface CategoryCardProps {
  category: Category;
  lang: string;
}

export function CategoryCard({ category, lang }: CategoryCardProps) {
  const name = lang === 'bn' ? category.nameBn : category.nameEn;
  const icon = category.icon || 'https://placehold.co/100x100?text=Cat';

  return (
    <Link href={`/${lang}/categories/${category.slug}`}>
      <Card className="hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer text-center h-full bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
            <img src={icon} alt={name} className="w-10 h-10 object-contain" />
          </div>
          <span className="text-sm font-medium line-clamp-2">{name}</span>
        </CardContent>
      </Card>
    </Link>
  );
}
