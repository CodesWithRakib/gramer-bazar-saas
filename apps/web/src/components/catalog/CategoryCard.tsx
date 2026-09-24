import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { Category } from '@/features/catalog/catalogApi';
import { CustomImage } from '@/components/ui/CustomImage';

interface CategoryCardProps {
  category: Category;
  lang: string;
}

export function CategoryCard({ category, lang }: CategoryCardProps) {
  const name = lang === 'bn' ? category.nameBn : category.nameEn;
  const rawIcon = category.icon || '';
  const rawImage = category.image || '';

  const isImageUrl = (val: string) =>
    val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/') || val.startsWith('/uploads/');

  const imageSrc = isImageUrl(rawImage) ? rawImage : isImageUrl(rawIcon) ? rawIcon : null;
  const emojiIcon = !imageSrc ? rawIcon || '🛍️' : null;

  return (
    <Link href={`/${lang}/categories/${category.slug}`}>
      <Card className="hover:border-primary/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer text-center h-full bg-card shadow-sm border-border/50">
        <CardContent className="p-3 flex flex-col items-center justify-center gap-2">
          <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform group-hover:bg-primary/10">
            {imageSrc ? (
              <CustomImage
                src={imageSrc}
                alt={name}
                width={32}
                height={32}
                className="w-8 h-8 object-contain drop-shadow-sm"
              />
            ) : (
              <span className="text-2xl select-none leading-none" role="img" aria-label={name}>
                {emojiIcon}
              </span>
            )}
          </div>
          <span className="text-[11px] md:text-xs font-semibold line-clamp-2 leading-tight">{name}</span>
        </CardContent>
      </Card>
    </Link>
  );
}
