'use client';

import React, { useId, useRef, useState } from 'react';
import { AlertCircle, ImagePlus, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatBytes, type ImageProfileName } from '@/lib/image-compression';
import { useImageUpload } from '@/hooks/useImageUpload';
import { CustomImage } from '@/components/ui/CustomImage';

export interface ImageUploaderProps {
  /** Compression profile applied to selected files. */
  profile: ImageProfileName;
  /** Performs the network upload for the optimized batch. */
  upload: (files: File[]) => Promise<unknown>;
  /** Called after the batch uploads successfully. */
  onUploaded?: () => void;
  /** How many files a single selection may contain. */
  maxFiles?: number;
  minWidth?: number;
  minHeight?: number;
  isBn?: boolean;
  disabled?: boolean;
  className?: string;
  /** Optional label/description override. */
  title?: string;
  description?: string;
  accept?: string;
  /** Renders a compact single-line picker instead of the large dropzone. */
  compact?: boolean;
}

const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp';

/**
 * Reusable image picker + uploader.
 *
 * Owns validation, compression, progress and failure reporting so no page has
 * to re-implement the pipeline. Selected files are optimized locally first and
 * only the optimized bytes are uploaded.
 */
export function ImageUploader({
  profile,
  upload,
  onUploaded,
  maxFiles = 1,
  minWidth,
  minHeight,
  isBn = false,
  disabled = false,
  className,
  title,
  description,
  accept = DEFAULT_ACCEPT,
  compact = false,
}: ImageUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { items, error, isProcessing, isBusy, savings, select, removeItem, clearError } =
    useImageUpload({
      profile,
      upload,
      onUploaded,
      maxFiles,
      minWidth,
      minHeight,
      isBn,
    });

  const resolvedTitle =
    title ?? (isBn ? 'ছবি আপলোড করুন' : maxFiles > 1 ? 'Add images' : 'Upload image');
  const resolvedDescription =
    description ??
    (isBn
      ? 'JPG, PNG বা WebP — আপলোডের আগে স্বয়ংক্রিয়ভাবে অপটিমাইজ হবে'
      : 'JPG, PNG or WebP — automatically optimized before upload');

  const openPicker = () => {
    if (disabled || isBusy) return;
    inputRef.current?.click();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled || isBusy) return;
    void select(event.dataTransfer.files);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        className="sr-only"
        disabled={disabled || isBusy}
        onChange={(event) => {
          void select(event.target.files);
          // Allow re-selecting the same file after a failure.
          event.target.value = '';
        }}
      />

      {compact ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isBusy}
          onClick={openPicker}
          className="gap-2"
        >
          {isBusy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <UploadCloud className="h-3.5 w-3.5" />
          )}
          {isBusy
            ? isBn
              ? 'আপলোড হচ্ছে...'
              : 'Uploading...'
            : resolvedTitle}
        </Button>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label={resolvedTitle}
          aria-disabled={disabled || isBusy}
          onClick={openPicker}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openPicker();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled && !isBusy) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors',
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
            isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/30 hover:bg-muted/50',
            (disabled || isBusy) && 'cursor-not-allowed opacity-70'
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background">
            {isBusy ? (
              <Loader2 className="text-primary h-5 w-5 animate-spin" />
            ) : (
              <ImagePlus className="text-muted-foreground h-5 w-5" />
            )}
          </div>
          <div className="space-y-0.5">
            <p className="text-foreground text-sm font-medium">
              {isProcessing
                ? isBn
                  ? 'ছবি অপটিমাইজ হচ্ছে...'
                  : 'Optimizing image...'
                : resolvedTitle}
            </p>
            <p className="text-muted-foreground text-xs">{resolvedDescription}</p>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="border-border bg-card flex items-center gap-3 rounded-lg border p-2"
            >
              <div className="bg-muted relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                {item.previewUrl ? (
                  <CustomImage
                    src={item.previewUrl}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                    <ImagePlus className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-xs font-medium">{item.name}</p>
                <p className="text-muted-foreground text-[11px]">
                  {item.status === 'error' ? (
                    <span className="text-destructive">{item.error}</span>
                  ) : item.status === 'done' ? (
                    <>
                      {formatBytes(item.optimizedSize || item.originalSize)}
                      {item.width > 0 && ` · ${item.width}×${item.height}`}
                      {' · '}
                      <span className="text-success">{isBn ? 'সম্পন্ন' : 'Uploaded'}</span>
                    </>
                  ) : item.status === 'uploading' ? (
                    <>
                      {formatBytes(item.optimizedSize || item.originalSize)} ·{' '}
                      {isBn ? 'আপলোড হচ্ছে' : 'Uploading'}
                    </>
                  ) : (
                    isBn ? 'অপটিমাইজ হচ্ছে' : 'Optimizing'
                  )}
                </p>
              </div>

              {item.status === 'uploading' || item.status === 'optimizing' ? (
                <Loader2 className="text-muted-foreground h-4 w-4 shrink-0 animate-spin" />
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive h-8 w-8 shrink-0"
                  aria-label={isBn ? 'সরান' : 'Remove'}
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {savings.label && !error && (
        <p className="text-muted-foreground text-xs">
          {isBn ? 'ফাইল সাইজ:' : 'File size:'} <span className="text-foreground">{savings.label}</span>
          {savings.saved > 0 && (
            <>
              {' '}
              · <span className="text-success">
                {formatBytes(savings.saved)} {isBn ? 'সাশ্রয়' : 'saved'}
              </span>
            </>
          )}
        </p>
      )}

      {error && (
        <p role="alert" className="text-destructive flex items-start gap-1.5 text-xs">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            {error}
            <button
              type="button"
              onClick={clearError}
              className="ms-1 underline underline-offset-2"
            >
              {isBn ? 'বন্ধ করুন' : 'Dismiss'}
            </button>
          </span>
        </p>
      )}
    </div>
  );
}
