'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  ShieldCheck,
  Truck,
  Star,
  Heart,
  Share2,
  ChevronRight,
  CheckCircle2,
  ShoppingCart,
  Zap,
  RotateCcw,
  Sparkles,
  Info,
  Clock,
  Layers,
  MapPin,
  AlertTriangle,
  Leaf,
  Ruler,
  Check,
  Trophy,
} from 'lucide-react';
import { FashionSizeChartModal } from '@/components/catalog/FashionSizeChartModal';
import { Button } from '@/components/ui/button';
import { ProductRequestModal } from '@/components/catalog/ProductRequestModal';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { analyticsTracker } from '@/lib/analyticsTracker';
import { SellerProduct, useGetRelatedProductsQuery } from '@/features/catalog/catalogApi';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { addToCart } from '@/store/slices/cartSlice';
import {
  useGetUserWishlistQuery,
  useAddProductToWishlistMutation,
  useRemoveProductFromWishlistMutation,
} from '@/features/wishlists/wishlistsApi';
import { ProductReviews } from '@/components/reviews/ProductReviews';
import { customToast as toast } from '@/components/ui/custom-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomImage } from '@/components/ui/CustomImage';
import { StartChatButton } from '@/components/chat/StartChatButton';
import { getUserRoles } from '@/lib/roles';
import { formatCurrency } from '@/lib/format';

export function ProductDetailsClient({
  products,
  lang,
}: {
  products: SellerProduct[];
  lang: string;
}) {
  const isBn = lang === 'bn';
  const dispatch = useDispatch();
  const router = useRouter();

  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const product = products?.[selectedVariantIdx];
  const images = product?.productVariant.images?.length
    ? product.productVariant.images
    : ['/placeholder.jpg'];

  const [activeImage, setActiveImage] = useState(images[0]);
  const [prevVariantId, setPrevVariantId] = useState(product?.productVariant.id);
  if (product?.productVariant.id !== prevVariantId) {
    setPrevVariantId(product?.productVariant.id);
    setActiveImage(images[0]);
  }

  const slug = product?.productVariant.product.slug;
  const { data: relatedProducts } = useGetRelatedProductsQuery(slug as string, {
    skip: !slug,
  });
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const userRoles = getUserRoles(user);
  const isStaffOrSeller = userRoles.some((r: string) =>
    ['SELLER', 'RIDER', 'ADMIN', 'SUPER_ADMIN'].includes(r)
  );
  const { data: wishlist } = useGetUserWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [addToWishlist, { isLoading: isAddingWishlist }] = useAddProductToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingWishlist }] =
    useRemoveProductFromWishlistMutation();

  useEffect(() => {
    if (product) {
      analyticsTracker.track('VIEW', {
        productId: product.productVariant.product.id,
        categoryId: product.productVariant.product.category?.id,
      });
    }
  }, [product?.productVariant?.product?.id, product?.productVariant?.product?.category?.id]);

  if (!products || products.length === 0 || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">
          {isBn ? 'পণ্য পাওয়া যায়নি' : 'Product not found'}
        </h1>
        <p className="text-muted-foreground mb-6">
          {isBn
            ? 'আপনি যে পণ্যটি খুঁজছেন তা বর্তমানে স্টকে নেই বা সরিয়ে নেওয়া হয়েছে।'
            : 'The product you are looking for is currently out of stock or has been removed.'}
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href={`/${lang}/search`}>
              {isBn ? 'অন্য পণ্য খুঁজুন' : 'Search other products'}
            </Link>
          </Button>
          <ProductRequestModal lang={lang} />
        </div>
      </div>
    );
  }

  // Proper Product Title Resolution
  const masterProduct = product.productVariant.product;
  const productName = isBn ? masterProduct.nameBn : masterProduct.nameEn;
  const variantName = isBn ? product.productVariant.nameBn : product.productVariant.nameEn;
  const hasDistinctVariant =
    variantName &&
    variantName.toLowerCase() !== 'standard' &&
    variantName.toLowerCase() !== 'default' &&
    variantName !== 'স্ট্যান্ডার্ড' &&
    variantName !== 'ডিফল্ট' &&
    variantName !== productName;
  const displayName = hasDistinctVariant ? `${productName} (${variantName})` : productName;

  const description = isBn ? masterProduct.descriptionBn : masterProduct.descriptionEn;
  const shortDescription = isBn
    ? masterProduct.shortDescriptionBn
    : masterProduct.shortDescriptionEn;
  // Structured specifications generated from the product type attribute schema.
  const specGroups = masterProduct.specGroups ?? [];
  const hasStructuredSpecs = specGroups.some((group) => group.specs.length > 0);

  // Resolve Price and Discount safely
  const rawPrice = Number(product.price);
  const rawDiscount = product.discountPrice ? Number(product.discountPrice) : null;
  const compareAt = masterProduct.compareAtPrice ? Number(masterProduct.compareAtPrice) : null;

  let currentPrice = rawPrice;
  let originalPrice: number | null = null;

  if (rawDiscount && rawDiscount < rawPrice) {
    currentPrice = rawDiscount;
    originalPrice = rawPrice;
  } else if (compareAt && compareAt > rawPrice) {
    currentPrice = rawPrice;
    originalPrice = compareAt;
  } else if (rawDiscount && rawDiscount > rawPrice) {
    currentPrice = rawPrice;
    originalPrice = rawDiscount;
  }

  const discountPercent =
    originalPrice && originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : null;

  const stock = product.inventory?.quantity || 0;
  const isOutOfStock = stock <= 0;
  const unit = masterProduct.unit;
  const brand = masterProduct.brand;
  const manufacturer = masterProduct.manufacturer;
  const requiresPrescription = masterProduct.requiresPrescription;
  const category = masterProduct.category;
  const subCategory = masterProduct.subCategory;
  const categoryPath = `${category?.path || ''} ${category?.slug || ''}`.toLowerCase();
  const isMedicine =
    !!requiresPrescription ||
    categoryPath.includes('medicine') ||
    categoryPath.includes('health') ||
    categoryPath.includes('pharma');
  const isGrocery =
    categoryPath.includes('grocery') ||
    categoryPath.includes('fresh') ||
    categoryPath.includes('food') ||
    categoryPath.includes('vegetable') ||
    categoryPath.includes('fruit') ||
    categoryPath.includes('meat') ||
    categoryPath.includes('fish') ||
    categoryPath.includes('grain') ||
    categoryPath.includes('rice') ||
    categoryPath.includes('dal') ||
    categoryPath.includes('dairy');
  const isFashion =
    categoryPath.includes('fashion') ||
    categoryPath.includes('clothing') ||
    categoryPath.includes('apparel') ||
    categoryPath.includes('mens') ||
    categoryPath.includes('womens') ||
    categoryPath.includes('kid') ||
    categoryPath.includes('shoe') ||
    categoryPath.includes('footwear');
  const isCosmetics =
    categoryPath.includes('cosmetics') ||
    categoryPath.includes('skin-care') ||
    categoryPath.includes('hair-care') ||
    categoryPath.includes('makeup') ||
    categoryPath.includes('fragrance') ||
    categoryPath.includes('beauty') ||
    categoryPath.includes('personal-care');
  const isHomeKitchen =
    categoryPath.includes('home') ||
    categoryPath.includes('kitchen') ||
    categoryPath.includes('furniture') ||
    categoryPath.includes('appliances') ||
    categoryPath.includes('bedding') ||
    categoryPath.includes('cookware') ||
    categoryPath.includes('decor') ||
    categoryPath.includes('lighting');
  const isBabyKids =
    categoryPath.includes('baby') ||
    categoryPath.includes('kid') ||
    categoryPath.includes('diaper') ||
    categoryPath.includes('nursery') ||
    categoryPath.includes('stroller') ||
    categoryPath.includes('toy');
  const isAutomotive =
    categoryPath.includes('automotive') ||
    categoryPath.includes('auto') ||
    categoryPath.includes('car') ||
    categoryPath.includes('motorcycle') ||
    categoryPath.includes('tire') ||
    categoryPath.includes('brake') ||
    categoryPath.includes('engine');
  const isSports =
    categoryPath.includes('sport') ||
    categoryPath.includes('fitness') ||
    categoryPath.includes('gym') ||
    categoryPath.includes('cricket') ||
    categoryPath.includes('football') ||
    categoryPath.includes('badminton') ||
    categoryPath.includes('cycling') ||
    categoryPath.includes('yoga') ||
    categoryPath.includes('treadmill') ||
    categoryPath.includes('dumbbell') ||
    categoryPath.includes('boxing');

  // Attribute helper
  const getSpec = (slug: string) => {
    for (const group of specGroups) {
      for (const spec of group.specs) {
        if (spec.slug === slug) return spec;
      }
    }
    return null;
  };

  // Grocery Specs
  const originSpec = getSpec('grocery-origin');
  const organicSpec = getSpec('grocery-organic');
  const storageSpec = getSpec('grocery-storage-type');
  const shelfLifeSpec = getSpec('grocery-shelf-life');
  const varietySpec = getSpec('grocery-variety');

  // Fashion Specs
  const materialSpec = getSpec('fashion-material');
  const fitSpec = getSpec('fashion-fit');
  const patternSpec = getSpec('fashion-pattern');
  const genderSpec = getSpec('fashion-gender');
  const sleeveSpec = getSpec('fashion-sleeve-type');
  const neckSpec = getSpec('fashion-neck-type');
  const careSpec = getSpec('fashion-care-instructions');

  // Cosmetics Specs
  const spfSpec = getSpec('cosmetics-spf');
  const skinTypeSpec = getSpec('cosmetics-skin-type');
  const finishSpec = getSpec('cosmetics-finish');
  const coverageSpec = getSpec('cosmetics-coverage');
  const claimsSpec = getSpec('cosmetics-claims');
  const benefitSpec = getSpec('cosmetics-benefit');
  const scentSpec = getSpec('cosmetics-scent-family');

  // Home & Kitchen Specs
  const homeMaterialSpec = getSpec('home-material');
  const homeCapacitySpec = getSpec('home-capacity');
  const homePowerSpec = getSpec('home-power');
  const homeEnergySpec = getSpec('home-energy-rating');
  const homeWarrantySpec = getSpec('home-warranty');
  const homeRoomSpec = getSpec('home-room');
  const homeDimensionsSpec = getSpec('home-dimensions');
  const homeAssemblySpec = getSpec('home-assembly');
  const homePackSizeSpec = getSpec('home-pack-size');

  // Baby & Kids Specs
  const babyAgeSpec = getSpec('baby-age-group');
  const babyDiaperSizeSpec = getSpec('baby-diaper-size');
  const babyWeightSpec = getSpec('baby-weight-range');
  const babyGenderSpec = getSpec('baby-gender');
  const babyMaterialSpec = getSpec('baby-material');
  const babyPackSpec = getSpec('baby-pack-size');
  const babySafetySpec = getSpec('baby-safety-claims');
  const babyWarningSpec = getSpec('baby-warning');
  const babyVolumeSpec = getSpec('baby-volume');
  const babyFootwearSizeSpec = getSpec('baby-footwear-size');
  const babyOriginSpec = getSpec('baby-country-of-origin');

  // Automotive Specs & Vehicle Fitment
  const autoVehicleTypeSpec = getSpec('auto-vehicle-type');
  const autoCompatibleMakeSpec = getSpec('auto-compatible-make');
  const autoCompatibleModelSpec = getSpec('auto-compatible-model');
  const autoFitmentTypeSpec = getSpec('auto-fitment-type');
  const autoOemSpec = getSpec('auto-oem-classification');
  const autoPositionSpec = getSpec('auto-position');
  const autoViscositySpec = getSpec('auto-oil-viscosity');
  const autoVolumeSpec = getSpec('auto-volume');
  const autoTireSizeSpec = getSpec('auto-tire-size');
  const autoBatteryCapacitySpec = getSpec('auto-battery-capacity');
  const autoPackSpec = getSpec('auto-pack-size');
  const autoWarrantySpec = getSpec('auto-warranty');
  const autoOriginSpec = getSpec('auto-country-of-origin');

  // Sports & Fitness Specs
  const sportsTypeSpec = getSpec('sports-type');
  const sportsActivitySpec = getSpec('sports-activity');
  const sportsSkillSpec = getSpec('sports-skill-level');
  const sportsGenderSpec = getSpec('sports-gender');
  const sportsMaterialSpec = getSpec('sports-material');
  const sportsSizeSpec = getSpec('sports-size');
  const sportsWeightSpec = getSpec('sports-weight-capacity');
  const sportsGloveSizeSpec = getSpec('sports-glove-size');
  const sportsFootwearSizeSpec = getSpec('sports-footwear-size');
  const sportsPackSpec = getSpec('sports-pack-size');
  const sportsWarrantySpec = getSpec('sports-warranty');
  const sportsOriginSpec = getSpec('sports-country-of-origin');

  // Multi-variant parsing for Fashion (Color × Size), Cosmetics (Shade × Volume), Home, Baby, and Automotive (Pack / Volume / Viscosity / Tire / Battery)
  const COLOR_HEX_MAP: Record<string, string> = {
    black: '#1a1a1a',
    white: '#ffffff',
    red: '#d32f2f',
    blue: '#1565c0',
    green: '#2e7d32',
    yellow: '#f9a825',
    pink: '#ec407a',
    purple: '#6a1b9a',
    brown: '#6d4c41',
    grey: '#757575',
    gray: '#757575',
    orange: '#ef6c00',
    navy: '#1a237e',
    maroon: '#800000',
    beige: '#d7c4a3',
    // Home & Kitchen Colors
    silver: '#c0c0c0',
    'navy blue': '#1a237e',
    'natural wood': '#d7c4a3',
    'walnut brown': '#5c4033',
    gold: '#d4af37',
    // Cosmetics Shades & Hex Swatches
    '01 ivory': '#f6ebd9',
    ivory: '#f6ebd9',
    '02 natural ivory': '#f3e3ce',
    'natural ivory': '#f3e3ce',
    '03 classic nude': '#edd0b0',
    'classic nude': '#edd0b0',
    '04 natural beige': '#e4be96',
    'natural beige': '#e4be96',
    '05 pure beige': '#dfb48b',
    'pure beige': '#dfb48b',
    '06 sun beige': '#d7a57a',
    'sun beige': '#d7a57a',
    '07 warm honey': '#cb915f',
    'warm honey': '#cb915f',
    'ruby red': '#b31b2c',
    'pink rose': '#d94e77',
    'nude coral': '#d47a65',
    'berry plum': '#7d2248',
    'velvet crimson': '#8a1325',
    'black onyx': '#1a1a1a',
    // Baby & Kids Colors
    'pastel pink': '#f472b6',
    'sky blue': '#38bdf8',
    'mint green': '#4ade80',
    'sunny yellow': '#facc15',
    'pure white': '#ffffff',
    'soft grey': '#9ca3af',
    'vibrant red': '#ef4444',
    'lavender purple': '#c084fc',
    'peach coral': '#fb923c',
  };

  const COLOR_BN_MAP: Record<string, string> = {
    black: 'কালো',
    white: 'সাদা',
    red: 'লাল',
    blue: 'নীল',
    green: 'সবুজ',
    yellow: 'হলুদ',
    pink: 'গোলাপি',
    purple: 'বেগুনি',
    brown: 'বাদামি',
    grey: 'ধূসর',
    gray: 'ধূসর',
    orange: 'কমলা',
    navy: 'নেভি ব্লু',
    maroon: 'মেরুন',
    beige: 'বেইজ',
    // Home & Kitchen Colors Bangla
    silver: 'সিলভার',
    'navy blue': 'নেভি ব্লু',
    'natural wood': 'ন্যাচারাল উড',
    'walnut brown': 'ওয়ালনাট ব্রাউন',
    gold: 'গোল্ডেন',
    // Cosmetics Shades Bangla
    '01 ivory': '০১ আইভরি',
    ivory: 'আইভরি',
    '02 natural ivory': '০২ ন্যাচারাল আইভরি',
    'natural ivory': 'ন্যাচারাল আইভরি',
    '03 classic nude': '০৩ ক্লাসিক নুড',
    'classic nude': 'ক্লাসিক নুড',
    '04 natural beige': '০৪ ন্যাচারাল বেইজ',
    'natural beige': 'ন্যাচারাল বেইজ',
    '05 pure beige': '০৫ পিওর বেইজ',
    'pure beige': 'পিওর বেইজ',
    '06 sun beige': '০৬ সান বেইজ',
    'sun beige': 'সান বেইজ',
    '07 warm honey': '০৭ ওয়ার্ম হানি',
    'warm honey': 'ওয়ার্ম হানি',
    'ruby red': 'রুবি রেড',
    'pink rose': 'পিংক রোজ',
    'nude coral': 'নুড কোরাল',
    'berry plum': 'বেরি প্লাম',
    'velvet crimson': 'ভেলভেট ক্রিমসন',
    'black onyx': 'ব্ল্যাক অনিক্স',
    // Baby & Kids Colors Bangla
    'pastel pink': 'প্যাস্টেল পিংক',
    'sky blue': 'স্কাই ব্লু',
    'mint green': 'মিন্ট গ্রিন',
    'sunny yellow': 'সানি ইয়েলো',
    'pure white': 'পিওর হোয়াইট',
    'soft grey': 'সফট গ্রে',
    'vibrant red': 'ভাইব্র্যান্ট রেড',
    'lavender purple': 'ল্যাভেন্ডার পার্পল',
    'peach coral': 'পিচ কোরাল',
  };

  const parsedVariants = products.map((p, idx) => {
    const v = p.productVariant;
    const attrs = ((v as any).attributes || {}) as Record<string, any>;
    let color =
      attrs['fashion-color'] ||
      attrs['cosmetics-shade'] ||
      attrs['home-color'] ||
      attrs['baby-color'];
    let size =
      attrs['fashion-size-clothing'] ||
      attrs['fashion-size-numeric'] ||
      attrs['fashion-size-kids'] ||
      attrs['fashion-size-shoe-eu'] ||
      attrs['fashion-size-shoe-uk'] ||
      attrs['fashion-size-shoe-us'] ||
      attrs['cosmetics-volume'] ||
      attrs['home-capacity'] ||
      attrs['home-pack-size'] ||
      attrs['home-bed-size'] ||
      attrs['home-dimensions'] ||
      attrs['baby-diaper-size'] ||
      attrs['baby-age-group'] ||
      attrs['baby-pack-size'] ||
      attrs['baby-volume'] ||
      attrs['baby-footwear-size'] ||
      attrs['auto-volume'] ||
      attrs['auto-tire-size'] ||
      attrs['auto-battery-capacity'] ||
      attrs['auto-pack-size'] ||
      attrs['auto-oil-viscosity'] ||
      attrs['sports-size'] ||
      attrs['sports-weight-capacity'] ||
      attrs['sports-glove-size'] ||
      attrs['sports-footwear-size'] ||
      attrs['sports-pack-size'];

    if (!color && !size && v.nameEn && v.nameEn.includes('/')) {
      const parts = v.nameEn.split('/').map((s) => s.trim());
      if (parts.length >= 2) {
        color = parts[0];
        size = parts[1];
      }
    }

    const vStock = p.inventory?.quantity ?? 0;
    return {
      index: idx,
      product: p,
      color: color ? String(color) : null,
      size: size ? String(size) : null,
      stock: vStock,
      isOutOfStock: vStock <= 0,
    };
  });

  const distinctColors = Array.from(
    new Set(parsedVariants.map((pv) => pv.color).filter((c): c is string => !!c))
  );
  const distinctSizes = Array.from(
    new Set(parsedVariants.map((pv) => pv.size).filter((s): s is string => !!s))
  );
  const hasColorAxis = distinctColors.length > 0;
  const hasSizeAxis = distinctSizes.length > 0;

  const activeParsed = parsedVariants[selectedVariantIdx];
  const activeColor = activeParsed?.color || distinctColors[0] || null;
  const activeSize = activeParsed?.size || distinctSizes[0] || null;

  const handleSelectColor = (newColor: string) => {
    let match = parsedVariants.find(
      (pv) => pv.color === newColor && pv.size === activeSize && !pv.isOutOfStock
    );
    if (!match) {
      match = parsedVariants.find((pv) => pv.color === newColor && !pv.isOutOfStock);
    }
    if (!match) {
      match = parsedVariants.find((pv) => pv.color === newColor);
    }
    if (match) {
      setSelectedVariantIdx(match.index);
      setQuantity(1);
      if (match.product.productVariant.images?.[0]) {
        setActiveImage(match.product.productVariant.images[0]);
      }
    }
  };

  const handleSelectSize = (newSize: string) => {
    let match = parsedVariants.find(
      (pv) => (hasColorAxis ? pv.color === activeColor : true) && pv.size === newSize
    );
    if (!match) {
      match = parsedVariants.find((pv) => pv.size === newSize);
    }
    if (match) {
      setSelectedVariantIdx(match.index);
      setQuantity(1);
    }
  };

  const avgRating = masterProduct.averageRating || 0;
  const totalReviews = masterProduct.totalReviews || 0;

  const isWishlisted = wishlist?.some((item) => item.productId === masterProduct.id);

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error(isBn ? 'দয়া করে লগইন করুন' : 'Please login first');
      return;
    }
    try {
      if (isWishlisted) {
        await removeFromWishlist(masterProduct.id).unwrap();
        toast.success(isBn ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'Removed from wishlist');
      } else {
        await addToWishlist(masterProduct.id).unwrap();
        toast.success(isBn ? 'উইশলিস্টে যোগ করা হয়েছে' : 'Added to wishlist');
      }
    } catch {
      toast.error(isBn ? 'একটি ত্রুটি হয়েছে' : 'An error occurred');
    }
  };

  const handleAddToCart = (): boolean => {
    if (isStaffOrSeller) {
      toast.info(
        isBn
          ? 'কার্ট ও পণ্য ক্রয় শুধুমাত্র কাস্টমার অ্যাকাউন্টের জন্য প্রযোজ্য।'
          : 'Shopping and cart actions are reserved for customer accounts.'
      );
      return false;
    }
    dispatch(
      addToCart({
        sellerProductId: product.id,
        quantity,
        price: currentPrice,
        nameEn: masterProduct.nameEn,
        nameBn: masterProduct.nameBn,
        image: activeImage,
        sellerNameEn: product.shop.nameEn,
        sellerNameBn: product.shop.nameBn,
        maxQuantity: stock,
        slug: masterProduct.slug,
      })
    );
    analyticsTracker.track('ADD_TO_CART', {
      productId: masterProduct.id,
      categoryId: masterProduct.category?.id,
    });
    toast.success(isBn ? 'কার্টে যোগ করা হয়েছে' : 'Added to cart');
    return true;
  };

  const handleBuyNow = () => {
    const success = handleAddToCart();
    if (success) {
      router.push(`/${lang}/customer/checkout`);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.75)',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)',
    });
  };

  return (
    <div className="bg-muted/10 min-h-screen pb-36 md:pb-16">
      <div className="container mx-auto px-4 py-5 max-w-7xl">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center text-xs md:text-sm text-muted-foreground mb-6 gap-2"
        >
          <Link href={`/${lang}`} className="hover:text-primary transition-colors">
            {isBn ? 'হোম' : 'Home'}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 rtl:rotate-180" />
          <Link href={`/${lang}/categories`} className="hover:text-primary transition-colors">
            {isBn ? 'ক্যাটাগরি' : 'Categories'}
          </Link>
          {category && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 rtl:rotate-180" />
              <Link
                href={`/${lang}/categories/${category.slug}`}
                className="hover:text-primary transition-colors"
              >
                {isBn ? category.nameBn : category.nameEn}
              </Link>
            </>
          )}
          {category && subCategory && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 rtl:rotate-180" />
              <Link
                href={`/${lang}/categories/${category.slug}/${subCategory.slug}`}
                className="hover:text-primary transition-colors"
              >
                {isBn ? subCategory.nameBn : subCategory.nameEn}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 rtl:rotate-180" />
          <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-xs">
            {displayName}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT 7 COLS: Image Gallery & Detailed Tabs */}
          <div className="lg:col-span-7 space-y-8">
            {/* Main Image Gallery Card */}
            <div className="bg-card rounded-3xl p-5 md:p-7 shadow-xs border border-border/80">
              <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-6">
                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[480px] no-scrollbar shrink-0">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`relative w-18 h-18 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                          activeImage === img
                            ? 'border-primary ring-2 ring-primary/30 shadow-xs'
                            : 'border-border/60 hover:border-primary/50 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <CustomImage
                          src={img}
                          fill
                          sizes="72px"
                          className="object-cover"
                          alt={`Thumbnail ${idx + 1}`}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Primary Image with Zoom */}
                <div
                  ref={imageContainerRef}
                  className="bg-muted/30 rounded-2xl overflow-hidden aspect-square flex-1 flex items-center justify-center p-4 relative group cursor-zoom-in border border-border/40"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <CustomImage
                    src={activeImage}
                    alt={displayName}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain p-6 transition-transform duration-200 ease-out"
                    priority
                    style={zoomStyle}
                  />

                  {/* Badges */}
                  {discountPercent !== null && discountPercent > 0 && !isOutOfStock && (
                    <div className="absolute top-4 start-4 bg-destructive text-destructive-foreground text-xs font-black px-3 py-1 rounded-full shadow-md z-10 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>-{discountPercent}% ছাড়</span>
                    </div>
                  )}

                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-xs flex items-center justify-center z-10">
                      <span className="bg-zinc-900/95 text-white font-extrabold px-6 py-2.5 rounded-full text-base shadow-xl">
                        {isBn ? 'স্টক শেষ' : 'SOLD OUT'}
                      </span>
                    </div>
                  )}

                  {/* Top Right Action Overlay (Share & Wishlist) */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-9 w-9 rounded-full shadow-sm bg-background/90 hover:bg-background transition-transform active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(window.location.href);
                        toast.success(isBn ? 'লিঙ্ক কপি করা হয়েছে' : 'Link copied to clipboard');
                      }}
                      title={isBn ? 'শেয়ার করুন' : 'Share'}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className={`h-9 w-9 rounded-full shadow-sm bg-background/90 hover:bg-background transition-transform active:scale-95 ${
                        isWishlisted ? 'text-destructive' : 'text-foreground'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist();
                      }}
                      disabled={isAddingWishlist || isRemovingWishlist}
                      title={
                        isWishlisted
                          ? isBn
                            ? 'উইশলিস্ট থেকে সরান'
                            : 'Remove from wishlist'
                          : isBn
                            ? 'উইশলিস্টে যোগ করুন'
                            : 'Add to wishlist'
                      }
                    >
                      <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Tabs Section */}
            <div className="bg-card rounded-3xl p-6 shadow-xs border border-border/80">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 h-11 bg-muted/60 rounded-xl p-1">
                  <TabsTrigger
                    value="details"
                    className="rounded-lg text-xs md:text-sm font-semibold"
                  >
                    {isBn ? 'বিস্তারিত বিবরণ' : 'Description'}
                  </TabsTrigger>
                  <TabsTrigger
                    value="specs"
                    className="rounded-lg text-xs md:text-sm font-semibold"
                  >
                    {isBn ? 'স্পেসিফিকেশন' : 'Specifications'}
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="rounded-lg text-xs md:text-sm font-semibold"
                  >
                    {isBn ? `রিভিউ (${totalReviews})` : `Reviews (${totalReviews})`}
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Detailed Description */}
                <TabsContent value="details" className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground">
                    {isBn ? 'পণ্যের পূর্ণ বিবরণ' : 'Product Full Description'}
                  </h3>
                  {description ? (
                    <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                      {description}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      {isBn
                        ? 'এই পণ্যের কোন বিস্তারিত বিবরণ যোগ করা হয়নি।'
                        : 'No full description provided for this product.'}
                    </p>
                  )}
                </TabsContent>

                {/* Tab 2: Specifications Table */}
                <TabsContent value="specs" className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground">
                    {isBn ? 'পণ্যের বৈশিষ্ট্য ও তথ্য' : 'Product Specifications'}
                  </h3>
                  {/* Attribute-driven grouped specs (Processor, Monitor, …) */}
                  {hasStructuredSpecs && (
                    <div className="space-y-4">
                      {specGroups.map((group) => (
                        <div
                          key={group.specGroup}
                          className="border border-border/70 rounded-2xl overflow-hidden divide-y divide-border/60"
                        >
                          <div className="px-3 py-2 bg-primary/5 text-xs md:text-sm font-bold text-foreground">
                            {group.specGroup}
                          </div>
                          {group.specs.map((spec, index) => (
                            <div
                              key={spec.attributeId}
                              className={
                                index % 2 === 1
                                  ? 'grid grid-cols-3 p-3 text-xs md:text-sm bg-muted/20'
                                  : 'grid grid-cols-3 p-3 text-xs md:text-sm'
                              }
                            >
                              <span className="font-semibold text-muted-foreground">
                                {isBn ? spec.nameBn : spec.nameEn}
                              </span>
                              <span className="col-span-2 font-medium text-foreground">
                                {isBn ? spec.displayValueBn : spec.displayValueEn}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border border-border/70 rounded-2xl overflow-hidden divide-y divide-border/60">
                    <div className="grid grid-cols-3 p-3 text-xs md:text-sm bg-muted/20">
                      <span className="font-semibold text-muted-foreground">
                        {isBn ? 'পণ্য' : 'Product'}
                      </span>
                      <span className="col-span-2 font-medium text-foreground">{productName}</span>
                    </div>
                    {category && (
                      <div className="grid grid-cols-3 p-3 text-xs md:text-sm">
                        <span className="font-semibold text-muted-foreground">
                          {isBn ? 'ক্যাটাগরি' : 'Category'}
                        </span>
                        <span className="col-span-2 font-medium text-foreground">
                          {isBn ? category.nameBn : category.nameEn}
                        </span>
                      </div>
                    )}
                    {subCategory && (
                      <div className="grid grid-cols-3 p-3 text-xs md:text-sm bg-muted/20">
                        <span className="font-semibold text-muted-foreground">
                          {isBn ? 'উপ-ক্যাটাগরি' : 'Subcategory'}
                        </span>
                        <span className="col-span-2 font-medium text-foreground">
                          {isBn ? subCategory.nameBn : subCategory.nameEn}
                        </span>
                      </div>
                    )}
                    {brand && (
                      <div className="grid grid-cols-3 p-3 text-xs md:text-sm">
                        <span className="font-semibold text-muted-foreground">
                          {isBn ? 'ব্র্যান্ড' : 'Brand'}
                        </span>
                        <span className="col-span-2 font-medium text-foreground">
                          {isBn ? brand.nameBn : brand.nameEn}
                        </span>
                      </div>
                    )}
                    {manufacturer && (
                      <div className="grid grid-cols-3 p-3 text-xs md:text-sm bg-muted/20">
                        <span className="font-semibold text-muted-foreground">
                          {isBn ? 'প্রস্তুতকারক' : 'Manufacturer'}
                        </span>
                        <span className="col-span-2 font-medium text-foreground">
                          {isBn ? manufacturer.nameBn : manufacturer.nameEn}
                          {manufacturer.country ? ` (${manufacturer.country})` : ''}
                        </span>
                      </div>
                    )}
                    {unit && (
                      <div className="grid grid-cols-3 p-3 text-xs md:text-sm bg-muted/20">
                        <span className="font-semibold text-muted-foreground">
                          {isBn ? 'পরিমাপ ইউনিট' : 'Unit'}
                        </span>
                        <span className="col-span-2 font-medium text-foreground">{unit}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-3 p-3 text-xs md:text-sm">
                      <span className="font-semibold text-muted-foreground">
                        {isBn ? 'স্টক প্রাপ্যতা' : 'Availability'}
                      </span>
                      <span className="col-span-2 font-medium text-foreground">
                        {isOutOfStock
                          ? isBn
                            ? 'স্টক শেষ'
                            : 'Out of Stock'
                          : isBn
                            ? `${stock} টি স্টকে আছে`
                            : `${stock} units available`}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 3: Reviews */}
                <TabsContent value="reviews">
                  <ProductReviews productId={masterProduct.id} isBn={isBn} lang={lang} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Related Products Carousel / Grid */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  {isBn ? 'সংশ্লিষ্ট জনপ্রিয় পণ্য' : 'Related Products'}
                </h2>
                {category && (
                  <Link
                    href={`/${lang}/categories/${category.slug}`}
                    className="text-xs md:text-sm text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>{isBn ? 'আরও দেখুন' : 'View more'}</span>
                    <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                  </Link>
                )}
              </div>
              {relatedProducts && relatedProducts.length > 0 ? (
                <ProductGrid products={relatedProducts} isLoading={false} lang={lang} />
              ) : (
                <p className="text-muted-foreground bg-card p-6 rounded-2xl text-center border border-border/70 text-sm">
                  {isBn ? 'কোন সংশ্লিষ্ট পণ্য পাওয়া যায়নি।' : 'No related products found.'}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT 5 COLS: Sticky Buy Box & Value Props */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Purchase Box Card */}
            <div className="bg-card rounded-3xl p-6 shadow-md border border-border/80 flex flex-col">
              {/* Brand and Categories Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {brand && (
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {isBn ? brand.nameBn : brand.nameEn}
                  </span>
                )}
                {manufacturer && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                    {isBn ? 'প্রস্তুতকারক: ' : 'Mfg: '}
                    {isBn ? manufacturer.nameBn : manufacturer.nameEn}
                  </span>
                )}
                {subCategory && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {isBn ? subCategory.nameBn : subCategory.nameEn}
                  </span>
                )}
                {requiresPrescription && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <span className="font-serif font-black">Rx</span>
                    <span>{isBn ? 'প্রেসক্রিপশন আবশ্যক' : 'Prescription Required'}</span>
                  </span>
                )}

                {/* Grocery-Specific Badges */}
                {organicSpec && (organicSpec.displayValueEn.toLowerCase().includes('organic') || organicSpec.displayValueBn.includes('জৈব')) && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Leaf className="h-3 w-3" />
                    <span>{isBn ? '১০০% জৈব (Organic)' : '100% Organic'}</span>
                  </span>
                )}
                {originSpec && originSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{isBn ? `উৎস: ${originSpec.displayValueBn}` : `Origin: ${originSpec.displayValueEn}`}</span>
                  </span>
                )}
                {storageSpec && storageSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{isBn ? `সংরক্ষণ: ${storageSpec.displayValueBn}` : `Storage: ${storageSpec.displayValueEn}`}</span>
                  </span>
                )}

                {/* Fashion-Specific Badges */}
                {materialSpec && materialSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    <span>{isBn ? `উপাদান: ${materialSpec.displayValueBn}` : `Material: ${materialSpec.displayValueEn}`}</span>
                  </span>
                )}
                {fitSpec && fitSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                    {isBn ? `ফিট: ${fitSpec.displayValueBn}` : `Fit: ${fitSpec.displayValueEn}`}
                  </span>
                )}

                {/* Cosmetics-Specific Badges */}
                {spfSpec && spfSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>{spfSpec.displayValueEn}</span>
                  </span>
                )}
                {skinTypeSpec && skinTypeSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{isBn ? `ত্বক: ${skinTypeSpec.displayValueBn}` : `Skin: ${skinTypeSpec.displayValueEn}`}</span>
                  </span>
                )}
                {finishSpec && finishSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-500/20">
                    {isBn ? `ফিনিশ: ${finishSpec.displayValueBn}` : `Finish: ${finishSpec.displayValueEn}`}
                  </span>
                )}
                {coverageSpec && coverageSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-700 dark:text-pink-300 border border-pink-500/20">
                    {isBn ? `কাভারেজ: ${coverageSpec.displayValueBn}` : `Coverage: ${coverageSpec.displayValueEn}`}
                  </span>
                )}
                {claimsSpec && claimsSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                    {isBn ? claimsSpec.displayValueBn : claimsSpec.displayValueEn}
                  </span>
                )}

                {/* Home & Kitchen Badges */}
                {homeWarrantySpec && homeWarrantySpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>{isBn ? `ওয়ারেন্টি: ${homeWarrantySpec.displayValueBn}` : `Warranty: ${homeWarrantySpec.displayValueEn}`}</span>
                  </span>
                )}
                {homePowerSpec && homePowerSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span>{homePowerSpec.displayValueEn}</span>
                  </span>
                )}
                {homeEnergySpec && homeEnergySpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>{homeEnergySpec.displayValueEn}</span>
                  </span>
                )}
                {homeMaterialSpec && homeMaterialSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    <span>{isBn ? `উপাদান: ${homeMaterialSpec.displayValueBn}` : `Material: ${homeMaterialSpec.displayValueEn}`}</span>
                  </span>
                )}
                {homeAssemblySpec && homeAssemblySpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                    {isBn ? homeAssemblySpec.displayValueBn : homeAssemblySpec.displayValueEn}
                  </span>
                )}

                {/* Baby & Kids Badges */}
                {babySafetySpec && babySafetySpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>{isBn ? babySafetySpec.displayValueBn : babySafetySpec.displayValueEn}</span>
                  </span>
                )}
                {babyAgeSpec && babyAgeSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>{isBn ? `বয়স: ${babyAgeSpec.displayValueBn}` : `Age: ${babyAgeSpec.displayValueEn}`}</span>
                  </span>
                )}
                {babyDiaperSizeSpec && babyDiaperSizeSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    <span>{isBn ? `সাইজ: ${babyDiaperSizeSpec.displayValueBn}` : `Size: ${babyDiaperSizeSpec.displayValueEn}`}</span>
                  </span>
                )}
                {babyWeightSpec && babyWeightSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    <span>{isBn ? `ওজন: ${babyWeightSpec.displayValueBn}` : `Weight: ${babyWeightSpec.displayValueEn}`}</span>
                  </span>
                )}
                {babyMaterialSpec && babyMaterialSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 flex items-center gap-1">
                    <Leaf className="h-3 w-3" />
                    <span>{isBn ? `উপাদান: ${babyMaterialSpec.displayValueBn}` : `Material: ${babyMaterialSpec.displayValueEn}`}</span>
                  </span>
                )}

                {/* Automotive & Vehicle Fitment Badges */}
                {autoCompatibleModelSpec && autoCompatibleModelSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{isBn ? `উপযোগী: ${autoCompatibleModelSpec.displayValueBn}` : `Fitment: ${autoCompatibleModelSpec.displayValueEn}`}</span>
                  </span>
                )}
                {autoFitmentTypeSpec && autoFitmentTypeSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span>{isBn ? autoFitmentTypeSpec.displayValueBn : autoFitmentTypeSpec.displayValueEn}</span>
                  </span>
                )}
                {autoOemSpec && autoOemSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>{isBn ? autoOemSpec.displayValueBn : autoOemSpec.displayValueEn}</span>
                  </span>
                )}
                {autoPositionSpec && autoPositionSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    {isBn ? `পজিশন: ${autoPositionSpec.displayValueBn}` : `Position: ${autoPositionSpec.displayValueEn}`}
                  </span>
                )}
                {autoWarrantySpec && autoWarrantySpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>{isBn ? `ওয়ারেন্টি: ${autoWarrantySpec.displayValueBn}` : `Warranty: ${autoWarrantySpec.displayValueEn}`}</span>
                  </span>
                )}

                {/* Sports & Fitness Badges */}
                {sportsTypeSpec && sportsTypeSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    <span>{isBn ? sportsTypeSpec.displayValueBn : sportsTypeSpec.displayValueEn}</span>
                  </span>
                )}
                {sportsSkillSpec && sportsSkillSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>{isBn ? `লেভেল: ${sportsSkillSpec.displayValueBn}` : `Level: ${sportsSkillSpec.displayValueEn}`}</span>
                  </span>
                )}
                {sportsMaterialSpec && sportsMaterialSpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    <span>{isBn ? `উপাদান: ${sportsMaterialSpec.displayValueBn}` : `Material: ${sportsMaterialSpec.displayValueEn}`}</span>
                  </span>
                )}
                {sportsWarrantySpec && sportsWarrantySpec.displayValueEn !== 'Not Specified' && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>{isBn ? `ওয়ারেন্টি: ${sportsWarrantySpec.displayValueBn}` : `Warranty: ${sportsWarrantySpec.displayValueEn}`}</span>
                  </span>
                )}
              </div>

              {/* Main Product Title */}
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-snug mb-2">
                {displayName}
              </h1>

              {/* Short Description */}
              {shortDescription && (
                <p className="text-xs md:text-sm text-muted-foreground mb-4 line-clamp-2">
                  {shortDescription}
                </p>
              )}

              {/* Rating & Review Counter */}
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border/60">
                <div className="flex items-center text-amber-500">
                  <Star
                    className={`h-4 w-4 ${avgRating > 0 ? 'fill-current' : 'text-muted-foreground/30'}`}
                  />
                  <span className="text-sm font-bold text-foreground ms-1.5">
                    {avgRating > 0 ? avgRating.toFixed(1) : isBn ? 'নতুন' : 'New'}
                  </span>
                </div>
                <span className="text-muted-foreground text-xs">•</span>
                <span className="text-xs text-muted-foreground">
                  {totalReviews} {isBn ? 'টি রিভিউ' : 'reviews'}
                </span>
                <span className="text-muted-foreground text-xs">•</span>
                {/* Stock Status Tag */}
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isOutOfStock
                      ? 'bg-destructive/10 text-destructive'
                      : stock <= 5
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-emerald-500/10 text-emerald-600'
                  }`}
                >
                  {isOutOfStock
                    ? isBn
                      ? 'স্টক শেষ'
                      : 'Out of Stock'
                    : stock <= 5
                      ? isBn
                        ? `মাত্র ${stock}টি বাকি!`
                        : `Only ${stock} left!`
                      : isBn
                        ? 'স্টকে আছে'
                        : 'In Stock'}
                </span>
              </div>

              {/* Pricing Box */}
              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 mb-5">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl md:text-4xl font-black text-primary tabular-nums">
                    {formatCurrency(currentPrice, lang)}
                  </span>
                  {originalPrice && originalPrice > currentPrice && (
                    <span className="text-base text-muted-foreground line-through tabular-nums">
                      {formatCurrency(originalPrice, lang)}
                    </span>
                  )}
                  {unit && (
                    <span className="text-xs text-muted-foreground font-medium">/ {unit}</span>
                  )}
                  {discountPercent !== null && discountPercent > 0 && (
                    <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-md ms-auto">
                      {isBn ? `${discountPercent}% ছাড়` : `${discountPercent}% OFF`}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {isBn ? 'ভ্যাট সহ অন্তর্ভুক্ত মূল্য' : 'Inclusive of all local taxes'}
                </p>
              </div>

              {/* Multi-Variant Selector (if multiple variants available) */}
              {products.length > 1 && (
                <div className="mb-5 space-y-4">
                  {/* Fashion Color / Cosmetics Shade Swatches */}
                  {hasColorAxis && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <span>{isCosmetics ? (isBn ? 'শেড (Shade):' : 'Shade:') : (isBn ? 'রঙ (Color):' : 'Color:')}</span>
                          <span className="text-primary normal-case font-extrabold">
                            {activeColor && isBn ? (COLOR_BN_MAP[activeColor.toLowerCase()] || activeColor) : activeColor}
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        {distinctColors.map((colorName) => {
                          const isSelected = activeColor === colorName;
                          const hex = COLOR_HEX_MAP[colorName.toLowerCase()] || '#6b7280';
                          const hexLower = hex.toLowerCase();
                          const isLight =
                            hexLower === '#ffffff' ||
                            hexLower === '#fffdd0' ||
                            hexLower === '#d7c4a3' ||
                            hexLower === '#f6ebd9' ||
                            hexLower === '#f3e3ce' ||
                            hexLower === '#edd0b0' ||
                            hexLower === '#e4be96';
                          const colorStock = parsedVariants
                            .filter((pv) => pv.color === colorName)
                            .reduce((sum, cur) => sum + cur.stock, 0);
                          const isColorOutOfStock = colorStock <= 0;

                          return (
                            <button
                              key={colorName}
                              type="button"
                              onClick={() => handleSelectColor(colorName)}
                              disabled={isColorOutOfStock}
                              title={`${colorName}${isColorOutOfStock ? ' (Out of Stock)' : ''}`}
                              aria-label={`Select ${isCosmetics ? 'Shade' : 'Color'} ${colorName}`}
                              className={`group relative flex items-center justify-center h-9 w-9 rounded-full transition-all ${
                                isSelected
                                  ? 'ring-2 ring-primary ring-offset-2 scale-110 shadow-sm'
                                  : isColorOutOfStock
                                    ? 'opacity-40 cursor-not-allowed border border-dashed border-border'
                                    : 'hover:scale-105 border border-border/80'
                              }`}
                              style={{ backgroundColor: hex }}
                            >
                              {isSelected && (
                                <Check className={`h-4 w-4 ${isLight ? 'text-zinc-900' : 'text-white'}`} />
                              )}
                              {isColorOutOfStock && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <span className="w-full h-0.5 bg-destructive rotate-45" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Fashion Size / Cosmetics Volume / Home Capacity Selector Pills */}
                  {hasSizeAxis && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <span>
                            {isCosmetics
                              ? (isBn ? 'ভলিউম (Volume):' : 'Volume:')
                              : isHomeKitchen
                                ? (isBn ? 'ক্যাপাসিটি / সাইজ (Capacity / Size):' : 'Capacity / Size:')
                                : isBabyKids
                                  ? (babyDiaperSizeSpec ? (isBn ? 'ডায়াপার সাইজ (Diaper Size):' : 'Diaper Size:') : (isBn ? 'বয়স / সাইজ (Age / Size):' : 'Age / Size:'))
                                  : isAutomotive
                                    ? (autoViscositySpec ? (isBn ? 'সান্দ্রতা / গ্রেড (Viscosity):' : 'Viscosity Grade:') : autoTireSizeSpec ? (isBn ? 'টায়ার সাইজ (Tire Size):' : 'Tire Size:') : autoBatteryCapacitySpec ? (isBn ? 'ধারণক্ষমতা (Capacity):' : 'Battery Capacity:') : autoVolumeSpec ? (isBn ? 'পরিমাণ (Volume):' : 'Volume:') : (isBn ? 'প্যাক / অপশন (Option):' : 'Option:'))
                                    : isSports
                                      ? (sportsWeightSpec ? (isBn ? 'ওজন / ক্যাপাসিটি (Weight):' : 'Weight / Capacity:') : sportsGloveSizeSpec ? (isBn ? 'গ্লাভস সাইজ (Glove Size):' : 'Glove Size:') : sportsFootwearSizeSpec ? (isBn ? 'জুতার সাইজ (Shoe Size):' : 'Shoe Size:') : sportsPackSpec ? (isBn ? 'প্যাক সাইজ (Pack Size):' : 'Pack Size:') : (isBn ? 'সাইজ (Size):' : 'Size:'))
                                      : (isBn ? 'সাইজ (Size):' : 'Size:')}
                          </span>
                          <span className="text-primary normal-case font-extrabold">{activeSize}</span>
                        </span>
                        {isFashion && (
                          <FashionSizeChartModal
                            lang={lang}
                            categorySlug={category?.slug}
                            productTypeName={masterProduct.productType?.nameEn}
                          />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {distinctSizes.map((sizeName) => {
                          const sizeVariant = parsedVariants.find(
                            (pv) => (hasColorAxis ? pv.color === activeColor : true) && pv.size === sizeName
                          );
                          const isSelected = activeSize === sizeName;
                          const isSizeOutOfStock = !sizeVariant || sizeVariant.isOutOfStock;

                          return (
                            <button
                              key={sizeName}
                              type="button"
                              disabled={isSizeOutOfStock}
                              onClick={() => handleSelectSize(sizeName)}
                              aria-label={isSizeOutOfStock ? `${sizeName} — Out of Stock` : sizeName}
                              className={`min-w-11 h-9 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center select-none ${
                                isSizeOutOfStock
                                  ? 'border-border/50 bg-muted/40 text-muted-foreground line-through opacity-50 cursor-not-allowed'
                                  : isSelected
                                    ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                                    : 'border-border/80 hover:border-primary/50 bg-card text-foreground'
                              }`}
                            >
                              {sizeName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* All Sellable Variant Combinations Grid */}
                  <div>
                    <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      {isBn ? 'বিকল্পসমূহ নির্বাচন করুন:' : 'Select Option:'}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {products.map((p, idx) => {
                        const pName = isBn
                          ? p.productVariant.nameBn || p.productVariant.product.nameBn
                          : p.productVariant.nameEn || p.productVariant.product.nameEn;
                        const pPrice = p.discountPrice || p.price;
                        const isSelected = selectedVariantIdx === idx;
                        const pOutOfStock = (p.inventory?.quantity ?? 0) <= 0;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            disabled={pOutOfStock}
                            onClick={() => {
                              setSelectedVariantIdx(idx);
                              setQuantity(1);
                              if (p.productVariant.images?.[0]) {
                                setActiveImage(p.productVariant.images[0]);
                              }
                            }}
                            aria-label={pOutOfStock ? `${pName} — Out of Stock` : pName}
                            className={`p-2.5 rounded-xl border text-start transition-all flex flex-col justify-between ${
                              pOutOfStock
                                ? 'border-border/50 bg-muted/40 opacity-60 cursor-not-allowed'
                                : isSelected
                                  ? 'border-primary bg-primary/10 shadow-xs'
                                  : 'border-border/70 hover:border-primary/40 bg-card'
                            }`}
                          >
                            <span
                              className={`text-xs font-semibold truncate ${isSelected && !pOutOfStock ? 'text-primary' : 'text-foreground'}`}
                            >
                              {pName}
                            </span>
                            {pOutOfStock ? (
                              <span className="text-[10px] font-bold text-destructive mt-0.5">
                                {isBn ? 'স্টক নেই' : 'Out of Stock'}
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-foreground mt-1 tabular-nums">
                                {formatCurrency(pPrice, lang)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {isBn ? 'পরিমাণ:' : 'Quantity:'}
                </span>
                <div className="flex items-center bg-muted/60 border border-border/80 rounded-xl p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="h-8 w-8 p-0 rounded-lg font-bold text-base hover:bg-background"
                  >
                    -
                  </Button>
                  <span className="text-sm font-bold w-10 text-center text-foreground">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    disabled={quantity >= stock || isOutOfStock}
                    className="h-8 w-8 p-0 rounded-lg font-bold text-base hover:bg-background"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Two High-Converting Action Buttons */}
              <div className="space-y-2.5">
                <Button
                  size="lg"
                  className="w-full h-12 text-sm font-bold rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                >
                  <Zap className="h-4 w-4 fill-current" />
                  <span>{isBn ? 'এখনই অর্ডার করুন' : 'Buy Now'}</span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-12 text-sm font-bold rounded-xl border-primary/30 text-primary hover:bg-primary/5 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>{isBn ? 'কার্টে যোগ করুন' : 'Add to Cart'}</span>
                </Button>
              </div>

              {/* Trust & Guarantee Highlights */}
              <div className="grid grid-cols-2 gap-3 pt-6 mt-6 border-t border-border/60">
                <div className="flex items-start gap-2.5">
                  <Truck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-foreground">
                      {isBn ? 'দ্রুত হোম ডেলিভারি' : 'Fast Delivery'}
                    </h5>
                    <p className="text-[11px] text-muted-foreground">
                      {isBn ? '২৪ ঘণ্টার মধ্যে নিশ্চিত' : 'Within 24 hours'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-foreground">
                      {isBn ? '১০০% খাঁটি পণ্য' : '100% Genuine'}
                    </h5>
                    <p className="text-[11px] text-muted-foreground">
                      {isBn ? 'খামার থেকে সরাসরি' : 'Direct from farms'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-foreground">
                      {isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
                    </h5>
                    <p className="text-[11px] text-muted-foreground">
                      {isBn ? 'হাতে পেয়ে মূল্য দিন' : 'Pay upon delivery'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <RotateCcw className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-foreground">
                      {isBn ? 'সহজ রিটার্ন' : 'Easy Return'}
                    </h5>
                    <p className="text-[11px] text-muted-foreground">
                      {isBn ? 'সমস্যা হলে তাৎক্ষণিক' : 'Instant hassle-free'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Medicine Safety Disclaimer Advisory (if medicine/pharma product) */}
              {isMedicine && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs space-y-1.5 text-amber-950 dark:text-amber-200 mt-5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>{isBn ? 'ঔষধ ব্যবহারের সাধারণ নিরাপত্তা পরামর্শ' : 'Medicine & Healthcare Safety Advisory'}</span>
                  </div>
                  <p className="leading-relaxed opacity-90">
                    {isBn
                      ? 'রেজিস্টার্ড চিকিৎসকের নির্দেশনা অনুযায়ী সেবন করুন। প্রস্তাবিত মাত্রার অতিরিক্ত গ্রহণ করবেন না। সরাসরি আলো ও আর্দ্রতা থেকে দূরে, ঠাণ্ডা ও শুষ্ক স্থানে সংরক্ষণ করুন। শিশুদের নাগালের বাইরে রাখুন।'
                      : 'Use strictly as directed by a registered medical practitioner. Do not exceed the recommended dose. Store in a cool, dry place away from direct light and moisture. Keep out of reach of children.'}
                  </p>
                </div>
              )}

              {/* Grocery Freshness & Cold Chain Assurance */}
              {isGrocery && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-xs space-y-1.5 text-emerald-950 dark:text-emerald-200 mt-5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-400">
                    <Leaf className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{isBn ? 'খামার তাজা ও স্বাস্থ্যকর পণ্য নিশ্চয়তা' : 'Fresh Farm & Quality Hygiene Guarantee'}</span>
                  </div>
                  <p className="leading-relaxed opacity-90">
                    {isBn
                      ? 'আমাদের খাদ্য ও মুদি পণ্য সরাসরি বিশ্বস্ত কৃষক এবং অনুমোদিত প্রস্তুতকারকদের কাছ থেকে সংগৃহীত। স্বাস্থ্যসম্মত উপায়ে প্যাকেজিং ও দ্রুততম ডেলিভারির মাধ্যমে পণ্যের সতেজতা নিশ্চিত করা হয়।'
                      : 'Sourced directly from verified farmers and certified food producers. Packed hygienically and delivered under strict temperature-controlled standards to preserve natural freshness.'}
                  </p>
                </div>
              )}

              {/* Fashion Size & Hassle-Free Exchange Advisory */}
              {isFashion && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 text-xs space-y-1.5 text-purple-950 dark:text-purple-200 mt-5">
                  <div className="flex items-center gap-1.5 font-bold text-purple-800 dark:text-purple-400">
                    <Ruler className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
                    <span>{isBn ? 'সাইজ ও ফিটিং নিশ্চয়তা — সহজ এক্সচেঞ্জ' : 'Fit & Size Guarantee — 7-Day Easy Exchange'}</span>
                  </div>
                  <p className="leading-relaxed opacity-90">
                    {isBn
                      ? 'সাইজে অমিল হলে ৭ দিনের মধ্যে সহজে সাইজ পরিবর্তন (Exchange) করার সুবিধা রয়েছে। অনুগ্রহ করে সাইজ চার্ট দেখে অর্ডার করুন।'
                      : 'Need a different size? Enjoy our hassle-free 7-day size exchange guarantee on all unworn apparel with original tags attached.'}
                  </p>
                </div>
              )}

              {/* Cosmetics Safety & Dermatological Patch Test Advisory */}
              {isCosmetics && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-xs space-y-1.5 text-rose-950 dark:text-rose-200 mt-5">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-400">
                    <Sparkles className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span>{isBn ? 'প্রসাধন ও রূপচর্চা পণ্যের নির্দেশিকা' : 'Dermatological & Skin Safety Advisory'}</span>
                  </div>
                  <p className="leading-relaxed opacity-90">
                    {isBn
                      ? 'নতুন স্কিনকেয়ার বা কসমেটিক্স ব্যবহারের পূর্বে কব্জি বা কানের পেছনে সামান্য পরিমাণ লাগিয়ে ২৪ ঘণ্টার প্যাচ টেস্ট (Patch Test) করার পরামর্শ দেওয়া হচ্ছে। সরাসরি সূর্যালোক থেকে দূরে শীতল স্থানে সংরক্ষণ করুন।'
                      : 'We recommend performing a 24-hour patch test behind the ear or inside wrist before first application. Discontinue use if irritation occurs. Store in a cool, dry place away from direct sunlight.'}
                  </p>
                </div>
              )}

              {/* Home & Kitchen Appliance & Furniture Care Advisory */}
              {isHomeKitchen && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs space-y-1.5 text-amber-950 dark:text-amber-200 mt-5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-400">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>{isBn ? 'হোম ও কিচেন ওয়ারেন্টি এবং ডেলিভারি নির্দেশিকা' : 'Home & Kitchen Warranty & Installation Guide'}</span>
                  </div>
                  <p className="leading-relaxed opacity-90">
                    {isBn
                      ? 'বৈদ্যুতিক যন্ত্রপাতির অফিসিয়াল ওয়ারেন্টি সুবিধা পেতে ক্যাশ মেমো ও ওয়ারেন্টি কার্ড সংরক্ষণ করুন। ভঙ্গুর কাচ বা ভারী আসবাবপত্রের ক্ষেত্রে আনপ্যাকিংয়ের সময় ডেলিভারি রাইডারের উপস্থিতিতে পণ্যটি যাচাই করে নিন।'
                      : 'Please retain the invoice and warranty card to claim official manufacturer warranty on appliances. For heavy furniture and fragile glassware, kindly inspect the package upon doorstep delivery.'}
                  </p>
                </div>
              )}

              {/* Baby & Kids Care & Safety Advisory */}
              {isBabyKids && (
                <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-4 text-xs space-y-1.5 text-sky-950 dark:text-sky-200 mt-5">
                  <div className="flex items-center gap-1.5 font-bold text-sky-800 dark:text-sky-400">
                    <Heart className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                    <span>{isBn ? 'শিশুর যত্ন ও পণ্য ব্যবহারের নিরাপত্তা নির্দেশিকা' : 'Baby Care & Child Safety Advisory'}</span>
                  </div>
                  <p className="leading-relaxed opacity-90">
                    {isBn
                      ? 'শিশুদের খেলনা ও স্ট্রোলার ব্যবহারের সময় সর্বদা বয়স্কদের প্রত্যক্ষ নজরদারি বজায় রাখুন। ছোট যন্ত্রাংশ শিশুদের গিলে ফেলার ঝুঁকি তৈরি করতে পারে। স্কিনকেয়ার ও বেবি ফুড ব্যবহারের ক্ষেত্রে প্যাকেটের গায়ে উল্লেখিত প্রস্তুত ও মেয়াদোত্তীর্ণের তারিখ এবং সংরক্ষণ নির্দেশিকা মেনে চলুন।'
                      : 'Always ensure adult supervision during toy play, feeding, and stroller use. Keep small parts away from infants to prevent choking hazards. For baby skincare and infant food, please review allergen labels, expiry dates, and proper hygiene guidelines on the package.'}
                  </p>
                </div>
              )}

              {/* Automotive Fitment & Technical Installation Advisory */}
              {isAutomotive && (
                <div className="bg-slate-500/10 border border-slate-500/30 rounded-2xl p-4 text-xs space-y-1.5 text-slate-950 dark:text-slate-200 mt-5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-300">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-slate-600 dark:text-slate-400" />
                    <span>{isBn ? 'গাড়ির ফিটমেন্ট ও টেকনিক্যাল ইনস্টলেশন পরামর্শ' : 'Vehicle Fitment & Technical Installation Advisory'}</span>
                  </div>
                  <p className="leading-relaxed opacity-90">
                    {isBn
                      ? 'অর্ডার করার পূর্বে আপনার গাড়ির মেক, মডেল এবং ম্যানুফ্যাকচারিং সাল স্পেসিফিকেশনের সাথে মিলিয়ে নিন। ব্রেক প্যাড, স্পার্ক প্লাগ ও ইলেকট্রিক্যাল যন্ত্রাংশ দক্ষ মেকানিক বা সার্টিফাইড অটোমোটিভ টেকনিশিয়ান দ্বারা ইনস্টল করার পরামর্শ দেওয়া হচ্ছে। অফিসিয়াল ওয়ারেন্টির জন্য ইনভয়েস ও ওয়ারেন্টি কার্ড সংরক্ষণ করুন।'
                      : 'Please verify vehicle make, model, and year compatibility against product specifications before ordering. Critical components such as brake pads, spark plugs, and electrical wiring should be installed by a certified automotive technician. Retain your invoice and warranty slip for manufacturer guarantee.'}
                  </p>
                </div>
              )}

              {/* Sports Equipment Safety & Ergonomics Advisory */}
              {isSports && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-xs space-y-1.5 text-emerald-950 dark:text-emerald-200 mt-5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{isBn ? 'স্পোর্টস গিয়ার ও ফিটনেস ইকুইপমেন্ট ব্যবহার নির্দেশিকা' : 'Sports Equipment Safety & Ergonomic Advisory'}</span>
                  </div>
                  <p className="leading-relaxed opacity-90">
                    {isBn
                      ? 'শরীরচর্চা বা খেলাধুলার পূর্বে যথাযথ ওয়ার্ম-আপ করুন এবং সুরক্ষামূলক গিয়ার (হেলমেট, গার্ড, প্যাড) পরিধান করুন। মোটরচালিত ট্রেডমিল ও জিম ইকুইপমেন্ট ব্যবহারের সময় প্রস্তাবিত সর্বোচ্চ ওজন সীমা মেনে চলুন। র‍্যাকেট ও ব্যাটের ক্ষেত্রে স্ট্রিং বা গ্রিপের নিয়মিত যত্ন নিন।'
                      : 'Always warm up properly before athletic activities and wear certified protective gear (helmets, guards, pads). Observe maximum user weight limits on motorized treadmills and gym equipment. Maintain proper racket string tension and grip hygiene to prevent sports injury.'}
                  </p>
                </div>
              )}
            </div>

            {/* Merchant / Shop Information Card */}
            <div className="bg-card rounded-3xl p-5 shadow-xs border border-border/80">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                    <Store className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {isBn ? 'বিক্রেতা দোকান' : 'Sold by'}
                    </span>
                    <h4 className="font-bold text-sm text-foreground">
                      {isBn ? product.shop.nameBn : product.shop.nameEn}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{isBn ? 'ভেরিফাইড মার্চেন্ট' : 'Verified Merchant'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs rounded-xl h-8"
                >
                  <Link href={`/${lang}/shops/${product.shop.id}`}>
                    <Store className="h-3.5 w-3.5 me-1" />
                    <span>{isBn ? 'দোকান ভিজিট করুন' : 'Visit Shop'}</span>
                  </Link>
                </Button>
                {isAuthenticated && (
                  <StartChatButton
                    participantId={product.shop.sellerId}
                    lang={lang}
                    referenceId={product.id}
                    referenceType="PRODUCT"
                    buttonText={isBn ? 'মেসেজ দিন' : 'Chat'}
                    redirectPath={`/${lang}/messages`}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Floating Order Bar */}
      <div className="lg:hidden fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-0 inset-x-0 p-3 bg-background/95 backdrop-blur-md border-t border-border shadow-md z-40 flex items-center justify-between gap-3">
        <div className="flex flex-col ps-1">
          <span className="text-[10px] text-muted-foreground font-semibold">
            {isBn ? 'মোট মূল্য' : 'Total'}
          </span>
          <span className="text-base font-black text-primary tabular-nums">
            {formatCurrency(currentPrice * quantity, lang)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-10 text-xs font-bold rounded-xl border-primary/40 text-primary px-3"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3.5 w-3.5 me-1" />
            <span>{isBn ? 'কার্ট' : 'Cart'}</span>
          </Button>
          <Button
            size="sm"
            className="h-10 text-xs font-bold rounded-xl px-5 shadow-sm"
            disabled={isOutOfStock}
            onClick={handleBuyNow}
          >
            <Zap className="h-3.5 w-3.5 fill-current me-1" />
            <span>{isBn ? 'অর্ডার করুন' : 'Buy Now'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
