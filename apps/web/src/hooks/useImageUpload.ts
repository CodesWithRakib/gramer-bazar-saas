'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  IMAGE_PROFILES,
  ImageValidationError,
  formatBytes,
  optimizeImage,
  type ImageProfileName,
  type OptimizedImage,
} from '@/lib/image-compression';
import { getApiErrorMessage } from '@/lib/apiError';

export type UploadItemStatus = 'optimizing' | 'uploading' | 'done' | 'error';

export interface UploadItem {
  id: string;
  name: string;
  status: UploadItemStatus;
  previewUrl: string;
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
  mimeType: string;
  error?: string;
}

export interface UseImageUploadOptions {
  /** Compression profile applied to every selected file. */
  profile: ImageProfileName;
  /** Performs the actual network upload for a batch of optimized files. */
  upload: (files: File[]) => Promise<unknown>;
  /** Called after a batch uploads successfully (e.g. to close a dialog). */
  onUploaded?: (items: OptimizedImage[]) => void;
  /** Hard limit on how many files a single selection may contain. */
  maxFiles?: number;
  /** Reject thumbnails narrower than this to protect storefront quality. */
  minWidth?: number;
  minHeight?: number;
  isBn?: boolean;
}

let uploadItemSeq = 0;

function createItemId() {
  uploadItemSeq += 1;
  return `upload-${Date.now()}-${uploadItemSeq}`;
}

/**
 * Shared upload pipeline used by every seller image surface.
 *
 * Validate → compress/resize → upload, with per-file progress, failure
 * reporting, duplicate-submission protection and automatic revocation of
 * preview object URLs. Components only supply the profile and the upload call.
 */
export function useImageUpload({
  profile,
  upload,
  onUploaded,
  maxFiles = 1,
  minWidth,
  minHeight,
  isBn = false,
}: UseImageUploadOptions) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastBatch, setLastBatch] = useState<OptimizedImage[]>([]);
  const objectUrls = useRef<string[]>([]);
  const busyRef = useRef(false);

  const profileConfig = IMAGE_PROFILES[profile];

  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.length = 0;
    };
  }, []);

  const trackUrl = useCallback((url: string) => {
    if (url) objectUrls.current.push(url);
  }, []);

  const reset = useCallback(() => {
    setItems([]);
    setError(null);
    setLastBatch([]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const isBusy = isProcessing || items.some((item) => item.status === 'uploading');

  const select = useCallback(
    async (fileList: FileList | File[] | null) => {
      // Guards against double-submits from rapid clicks or duplicate drops.
      if (busyRef.current) return;

      const files = Array.from(fileList ?? []);
      if (files.length === 0) return;

      setError(null);

      if (files.length > maxFiles) {
        setError(
          isBn
            ? `একসাথে সর্বোচ্চ ${maxFiles}টি ফাইল নির্বাচন করা যাবে।`
            : `You can select up to ${maxFiles} file${maxFiles > 1 ? 's' : ''} at once.`
        );
        return;
      }

      busyRef.current = true;
      setIsProcessing(true);

      const queued = files.map<UploadItem>((file) => ({
        id: createItemId(),
        name: file.name,
        status: 'optimizing',
        previewUrl: '',
        originalSize: file.size,
        optimizedSize: 0,
        width: 0,
        height: 0,
        mimeType: file.type,
      }));
      setItems((prev) => [...prev, ...queued]);

      const optimizedByItem = new Map<string, OptimizedImage>();
      const failures: Array<{ id: string; message: string }> = [];

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const queuedItem = queued[index];

        try {
          const result = await optimizeImage(file, profile);

          if (minWidth && result.width > 0 && result.width < minWidth) {
            throw new ImageValidationError(
              isBn
                ? `ছবিটি খুব ছোট। সর্বনিম্ন প্রস্থ ${minWidth}px প্রয়োজন।`
                : `Image is too small. A minimum width of ${minWidth}px is required.`
            );
          }
          if (minHeight && result.height > 0 && result.height < minHeight) {
            throw new ImageValidationError(
              isBn
                ? `ছবিটি খুব ছোট। সর্বনিম্ন উচ্চতা ${minHeight}px প্রয়োজন।`
                : `Image is too small. A minimum height of ${minHeight}px is required.`
            );
          }

          if (result.previewUrl) trackUrl(result.previewUrl);

          optimizedByItem.set(queuedItem.id, result);
          setItems((prev) =>
            prev.map((item) =>
              item.id === queuedItem.id
                ? {
                    ...item,
                    status: 'uploading',
                    previewUrl: result.previewUrl,
                    optimizedSize: result.optimizedSize,
                    width: result.width,
                    height: result.height,
                    mimeType: result.mimeType,
                  }
                : item
            )
          );
        } catch (err) {
          const message =
            err instanceof ImageValidationError
              ? err.message
              : getApiErrorMessage(
                  err,
                  isBn ? 'ছবি প্রক্রিয়া করা যায়নি।' : 'Could not process this image.'
                );
          failures.push({ id: queuedItem.id, message });
          setItems((prev) =>
            prev.map((item) =>
              item.id === queuedItem.id ? { ...item, status: 'error', error: message } : item
            )
          );
        }
      }

      const optimized = Array.from(optimizedByItem.values());

      if (optimized.length > 0) {
        try {
          await upload(optimized.map((item) => item.file));
          setItems((prev) =>
            prev.map((item) => (optimizedByItem.has(item.id) ? { ...item, status: 'done' } : item))
          );
          setLastBatch(optimized);
          onUploaded?.(optimized);
        } catch (err) {
          const message = getApiErrorMessage(
            err,
            isBn ? 'আপলোড ব্যর্থ হয়েছে।' : 'Upload failed. Please try again.'
          );
          setItems((prev) =>
            prev.map((item) =>
              optimizedByItem.has(item.id) ? { ...item, status: 'error', error: message } : item
            )
          );
          setError(message);
        }
      }

      if (failures.length > 0 && optimized.length === 0) {
        setError(failures[0].message);
      }

      setIsProcessing(false);
      busyRef.current = false;
    },
    [isBn, maxFiles, minHeight, minWidth, onUploaded, profile, trackUrl, upload]
  );

  const savings = useMemo(() => {
    const original = items.reduce((sum, item) => sum + item.originalSize, 0);
    const optimized = items.reduce(
      (sum, item) => sum + (item.optimizedSize || item.originalSize),
      0
    );
    return {
      original,
      optimized,
      saved: Math.max(0, original - optimized),
      label:
        original > 0 && optimized > 0 && original !== optimized
          ? `${formatBytes(original)} → ${formatBytes(optimized)}`
          : '',
    };
  }, [items]);

  return {
    items,
    error,
    isProcessing,
    isBusy,
    profileConfig,
    lastBatch,
    savings,
    select,
    reset,
    removeItem,
    clearError: () => setError(null),
  };
}
