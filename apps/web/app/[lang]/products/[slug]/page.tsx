import React from 'react';
import { ProductDetailsClient } from '@/components/catalog/ProductDetailsClient';
import { Metadata } from 'next';

// We fetch data directly on the server to populate SEO tags and pass down to client
async function getProductData(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  const res = await fetch(`${baseUrl}/public/catalog/${slug}`, { next: { revalidate: 60 } });
  
  if (!res.ok) {
    return null;
  }
  
  return res.json();
}

type Props = {
  params: Promise<{ lang: string; slug: string }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { slug, lang } = await params;
  const products = await getProductData(slug);
  
  if (!products || products.length === 0) {
    return {
      title: 'Product Not Found - Gramer Bazar',
    };
  }

  const product = products[0];
  const isBn = lang === 'bn';
  const name = isBn ? (product.productVariant.nameBn || product.productVariant.product.nameBn) : (product.productVariant.nameEn || product.productVariant.product.nameEn);
  const description = isBn ? product.productVariant.product.descriptionBn : product.productVariant.product.descriptionEn;
  const image = product.productVariant.images?.[0] || '/placeholder.jpg';

  return {
    title: `${name} | Gramer Bazar`,
    description: description || `Buy ${name} at Gramer Bazar.`,
    openGraph: {
      title: name,
      description: description || `Buy ${name} at Gramer Bazar.`,
      images: [image],
    },
    alternates: {
      canonical: `/${lang}/products/${slug}`,
      languages: {
        'en-US': `/en/products/${slug}`,
        'bn-BD': `/bn/products/${slug}`,
      },
    },
  };
}

export default async function ProductDetailsPage({ params }: Props) {
  const { lang, slug } = await params;
  const products = await getProductData(slug);

  if (!products || products.length === 0) {
    return <div>Product not found</div>;
  }

  const product = products[0];
  const isBn = lang === 'bn';
  const name = isBn ? (product.productVariant.nameBn || product.productVariant.product.nameBn) : (product.productVariant.nameEn || product.productVariant.product.nameEn);
  const description = isBn ? product.productVariant.product.descriptionBn : product.productVariant.product.descriptionEn;
  const image = product.productVariant.images?.[0] || '/placeholder.jpg';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: name,
    image: image,
    description: description,
    sku: product.productVariant.sku,
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${lang}/products/${slug}`,
      priceCurrency: 'BDT',
      price: product.discountPrice ? Number(product.discountPrice) : Number(product.price),
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inventory?.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailsClient products={products} lang={lang} />
    </>
  );
}
