'use client';

import React, { useMemo, useState } from 'react';
import { ImageOff, Star, Trash2, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { customToast as toast } from '@/components/ui/custom-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomImage } from '@/components/ui/CustomImage';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ImageUploader } from '@/components/upload/ImageUploader';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatBytes } from '@/lib/image-compression';
import {
  useDeleteSellerProductImageMutation,
  useReorderSellerProductImagesMutation,
  useSetSellerProductPrimaryImageMutation,
  useUploadSellerProductImagesMutation,
  type SellerProduct,
} from '@/features/seller';

interface SellerProductImageManagerProps {
  product: SellerProduct;
  isBn: boolean;
  /** Optimistic parent refresh after any mutation. */
  onChanged?: () => void;
}

/**
 * Gallery manager for seller-owned products: add (with client compression),
 * promote to primary, reorder and delete. Every mutation goes through the
 * scoped seller API, which re-checks shop ownership server-side.
 */
export function SellerProductImageManager({
  product,
  isBn,
  onChanged,
}: SellerProductImageManagerProps) {
  const [uploadImages, { isLoading: isUploading }] = useUploadSellerProductImagesMutation();
  const [setPrimary, { isLoading: isSettingPrimary }] = useSetSellerProductPrimaryImageMutation();
  const [reorderImages, { isLoading: isReordering }] = useReorderSellerProductImagesMutation();
  const [deleteImage, { isLoading: isDeleting }] = useDeleteSellerProductImageMutation();

  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  const images = useMemo(
    () => [...product.images].sort((a, b) => a.sortOrder - b.sortOrder),
    [product.images]
  );

  const totalStoredBytes = images.reduce((sum, image) => sum + (image.sizeBytes || 0), 0);

  const handleUpload = async (files: File[]) => {
    const body = new FormData();
    files.forEach((file) => body.append('files', file));
    try {
      await uploadImages({ id: product.id, body }).unwrap();
      toast.success(
        isBn ? 'ছবি আপলোড হয়েছে' : `${files.length} image${files.length > 1 ? 's' : ''} uploaded`
      );
      onChanged?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error, isBn ? 'আপলোড ব্যর্থ' : 'Upload failed'));
      // Re-throw so the uploader can render the inline failure state.
      throw error;
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      await setPrimary({ id: product.id, imageId }).unwrap();
      toast.success(isBn ? 'প্রধান ছবি সেট হয়েছে' : 'Primary image updated');
      onChanged?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error, isBn ? 'পরিবর্তন ব্যর্থ' : 'Update failed'));
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;

    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];

    try {
      await reorderImages({ id: product.id, imageIds: next.map((image) => image.id) }).unwrap();
      toast.success(isBn ? 'ক্রম পরিবর্তন হয়েছে' : 'Image order updated');
      onChanged?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error, isBn ? 'ক্রম পরিবর্তন ব্যর্থ' : 'Reorder failed'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!imageToDelete) return;
    try {
      await deleteImage({ id: product.id, imageId: imageToDelete }).unwrap();
      toast.success(isBn ? 'ছবি মুছে ফেলা হয়েছে' : 'Image removed');
      onChanged?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error, isBn ? 'মুছে ফেলা ব্যর্থ' : 'Delete failed'));
    } finally {
      setImageToDelete(null);
    }
  };

  if (!product.isOwned) {
    return (
      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="text-muted-foreground h-4 w-4" />
            {isBn ? 'প্রোডাক্টের ছবি' : 'Product images'}
          </CardTitle>
          <CardDescription className="text-xs">
            {isBn
              ? 'এই প্রোডাক্টটি প্ল্যাটফর্ম ক্যাটালগের অন্তর্ভুক্ত। ছবি পরিবর্তনের জন্য অ্যাডমিনের সাথে যোগাযোগ করুন — আপনি মূল্য ও স্টক পরিচালনা করতে পারবেন।'
              : 'This product belongs to the platform catalog. Contact support to change its images — you can still manage price and stock.'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{isBn ? 'প্রোডাক্টের ছবি' : 'Product images'}</CardTitle>
        <CardDescription className="text-xs">
          {images.length === 0
            ? isBn
              ? 'কমপক্ষে একটি ছবি যোগ করুন। আপলোডের আগেই স্বয়ংক্রিয়ভাবে অপটিমাইজ হবে।'
              : 'Add at least one image. Files are optimized automatically before upload.'
            : isBn
              ? `${images.length}টি ছবি · মোট ${formatBytes(totalStoredBytes)} সংরক্ষিত`
              : `${images.length} image${images.length > 1 ? 's' : ''} · ${formatBytes(totalStoredBytes)} stored`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {images.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image, index) => (
              <li
                key={image.id}
                className="border-border bg-muted/20 group relative overflow-hidden rounded-xl border"
              >
                <div className="relative aspect-square">
                  <CustomImage
                    src={image.url}
                    alt={image.altText || product.nameEn}
                    fill
                    sizes="(max-width: 640px) 45vw, 200px"
                    className="object-cover"
                  />

                  {image.isPrimary && (
                    <span className="bg-primary text-primary-foreground absolute start-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                      <Star className="h-3 w-3" />
                      {isBn ? 'প্রধান' : 'Primary'}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1 border-t p-2">
                  <div className="flex items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={index === 0 || isReordering}
                      aria-label={isBn ? 'আগে সরান' : 'Move earlier'}
                      onClick={() => void handleMove(index, -1)}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={index === images.length - 1 || isReordering}
                      aria-label={isBn ? 'পরে সরান' : 'Move later'}
                      onClick={() => void handleMove(index, 1)}
                    >
                      <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {!image.isPrimary && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={isSettingPrimary}
                        aria-label={isBn ? 'প্রধান ছবি করুন' : 'Set as primary'}
                        onClick={() => void handleSetPrimary(image.id)}
                      >
                        <Star className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive h-7 w-7"
                      aria-label={isBn ? 'ছবি মুছুন' : 'Delete image'}
                      onClick={() => setImageToDelete(image.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="border-border text-muted-foreground flex flex-col items-center gap-2 rounded-xl border border-dashed py-8 text-center">
            <ImageOff className="h-6 w-6" />
            <p className="text-xs">
              {isBn ? 'এখনও কোনো ছবি যোগ করা হয়নি।' : 'No images added yet.'}
            </p>
          </div>
        )}

        <ImageUploader
          profile="product"
          maxFiles={10}
          upload={handleUpload}
          disabled={isUploading}
          isBn={isBn}
          title={isBn ? 'নতুন ছবি যোগ করুন' : 'Add more images'}
          description={
            isBn
              ? 'সর্বোচ্চ ১০টি · ১২০০×১২০০ পর্যন্ত রিসাইজ · WebP-এ রূপান্তর'
              : 'Up to 10 files · resized to 1200×1200 · converted to WebP'
          }
        />
      </CardContent>

      <ConfirmDialog
        open={!!imageToDelete}
        onOpenChange={(open) => {
          if (!open) setImageToDelete(null);
        }}
        title={isBn ? 'ছবিটি মুছে ফেলবেন?' : 'Delete this image?'}
        description={
          isBn
            ? 'ছবিটি স্টোরেজ থেকেও মুছে ফেলা হবে। এটি ফিরিয়ে আনা যাবে না।'
            : 'The file will also be removed from storage. This cannot be undone.'
        }
        confirmLabel={isBn ? 'মুছে ফেলুন' : 'Delete image'}
        cancelLabel={isBn ? 'বাতিল' : 'Cancel'}
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        isBn={isBn}
      />
    </Card>
  );
}
