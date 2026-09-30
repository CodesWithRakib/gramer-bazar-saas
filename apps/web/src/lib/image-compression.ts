/**
 * Client-side image validation + compression engine.
 *
 * One implementation, many purposes: every seller upload surface (product
 * gallery, shop logo, shop cover, avatar) goes through `optimizeImage` with a
 * named profile instead of re-implementing resizing per component.
 *
 * The engine only ever *downscales* — an image smaller than the profile bounds
 * is left at its natural size so quality is never wasted on upscaling — and it
 * keeps transparency when the source needs it, so logos do not get flattened.
 *
 * The backend independently re-validates magic bytes, MIME type and size, so
 * nothing here is trusted as a security boundary; this layer exists purely for
 * upload size and perceived quality.
 */

/** Maximum accepted upload size, mirrored by the API (`SupabaseStorageService`). */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Image MIME types the platform accepts (matches the API allow-list). */
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type ImageProfileName = 'product' | 'shopLogo' | 'shopCover' | 'avatar' | 'document';

export interface ImageProfile {
  /** Human label used in error messages. */
  label: string;
  /** Longest edge / bounding box the output is fitted into. */
  maxWidth: number;
  maxHeight: number;
  /** Encoder quality for lossy formats (0-1). */
  quality: number;
  /** Keep alpha as PNG instead of flattening into WebP/JPEG. */
  preferPngWhenTransparent: boolean;
  /** Accepted MIME types before optimization. */
  accept: string[];
  /** Hard cap on the *source* file before we even attempt to decode it. */
  maxSourceBytes: number;
}

export const IMAGE_PROFILES: Record<ImageProfileName, ImageProfile> = {
  product: {
    label: 'Product image',
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.82,
    preferPngWhenTransparent: false,
    accept: [...ALLOWED_IMAGE_MIME_TYPES],
    maxSourceBytes: 20 * 1024 * 1024,
  },
  shopLogo: {
    label: 'Shop logo',
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.92,
    preferPngWhenTransparent: true,
    accept: [...ALLOWED_IMAGE_MIME_TYPES],
    maxSourceBytes: 15 * 1024 * 1024,
  },
  shopCover: {
    label: 'Shop cover',
    maxWidth: 1600,
    maxHeight: 900,
    quality: 0.82,
    preferPngWhenTransparent: false,
    accept: [...ALLOWED_IMAGE_MIME_TYPES],
    maxSourceBytes: 20 * 1024 * 1024,
  },
  avatar: {
    label: 'Profile image',
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.88,
    preferPngWhenTransparent: false,
    accept: [...ALLOWED_IMAGE_MIME_TYPES],
    maxSourceBytes: 10 * 1024 * 1024,
  },
  document: {
    label: 'Document',
    maxWidth: 0,
    maxHeight: 0,
    quality: 1,
    preferPngWhenTransparent: false,
    accept: ['application/pdf'],
    maxSourceBytes: 10 * 1024 * 1024,
  },
};

export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageValidationError';
  }
}

export interface OptimizedImage {
  /** Optimized file ready to be appended to FormData. */
  file: File;
  /** Output dimensions after resizing. */
  width: number;
  height: number;
  /** Source dimensions, kept so the UI can show what changed. */
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  optimizedSize: number;
  /** Output MIME type. */
  mimeType: string;
  /** Compression ratio, e.g. 0.18 means the file got 82% smaller. */
  ratio: number;
  /** `true` when the file was already optimal and passed through unchanged. */
  skipped: boolean;
  /** Object URL of the optimized blob, for instant local preview. */
  previewUrl: string;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Reads the leading bytes and confirms the payload really is the claimed image. */
async function detectImageMime(file: File): Promise<string | null> {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return 'image/jpeg';
  if (
    head[0] === 0x89 &&
    head[1] === 0x50 &&
    head[2] === 0x4e &&
    head[3] === 0x47 &&
    head[4] === 0x0d &&
    head[5] === 0x0a &&
    head[6] === 0x1a &&
    head[7] === 0x0a
  ) {
    return 'image/png';
  }
  const ascii = new TextDecoder('ascii').decode(head);
  if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP') return 'image/webp';
  if (ascii.startsWith('%PDF-')) return 'application/pdf';
  return null;
}

/**
 * Validates type (extension + declared MIME + real content) and size before a
 * single byte leaves the browser.
 */
export async function validateUploadFile(
  file: File,
  profileName: ImageProfileName,
): Promise<{ detectedMime: string | null }> {
  const profile = IMAGE_PROFILES[profileName];

  const extension = file.name.includes('.')
    ? `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`
    : '';
  const dangerousExtensions = ['.svg', '.html', '.htm', '.js', '.exe', '.php', '.sh', '.bat'];
  if (dangerousExtensions.includes(extension)) {
    throw new ImageValidationError(`${extension} files are not allowed.`);
  }

  if (file.size === 0) {
    throw new ImageValidationError('This file is empty.');
  }

  if (file.size > profile.maxSourceBytes) {
    throw new ImageValidationError(
      `${profile.label} is too large (${formatBytes(file.size)}). Maximum is ${formatBytes(profile.maxSourceBytes)}.`,
    );
  }

  const detectedMime = await detectImageMime(file);

  if (profileName === 'document') {
    if (detectedMime !== 'application/pdf') {
      throw new ImageValidationError('Only PDF documents are supported.');
    }
    return { detectedMime };
  }

  if (!detectedMime || !profile.accept.includes(detectedMime)) {
    throw new ImageValidationError('Only JPG, PNG or WebP images are supported.');
  }

  // The declared type must agree with the actual bytes we detected.
  if (file.type && file.type !== detectedMime) {
    throw new ImageValidationError(
      'This file looks mislabelled. Please re-save it and try again.',
    );
  }

  return { detectedMime };
}

interface DecodedSource {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}

async function decodeImage(file: File): Promise<DecodedSource> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      };
    } catch {
      // fall through to the <img> decoder below
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new ImageValidationError('This image could not be read.'));
      element.src = url;
    });
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

/** Samples the alpha channel to decide whether transparency must be preserved. */
function canvasHasTransparency(context: CanvasRenderingContext2D, width: number, height: number) {
  const { data } = context.getImageData(0, 0, width, height);
  for (let index = 3; index < data.length; index += 4 * 16) {
    if (data[index] < 250) return true;
  }
  return false;
}

function fitWithin(width: number, height: number, maxWidth: number, maxHeight: number) {
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new ImageValidationError('Image optimization failed. Please try again.'));
      },
      mimeType,
      quality,
    );
  });
}

function renameForMime(originalName: string, mimeType: string): string {
  const base = originalName.replace(/\.[^./\\]+$/, '') || 'image';
  const extension =
    mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  return `${base}.${extension}`;
}

/**
 * Compresses and resizes an image according to its profile.
 *
 * - Never upscales
 * - Never inflates: if the optimized blob is not smaller, the original is kept
 * - Preserves alpha as PNG when the profile asks for it
 * - Falls back to JPEG when the browser cannot encode WebP
 */
export async function optimizeImage(
  file: File,
  profileName: ImageProfileName,
): Promise<OptimizedImage> {
  const profile = IMAGE_PROFILES[profileName];
  const { detectedMime } = await validateUploadFile(file, profileName);

  if (profileName === 'document') {
    return {
      file,
      width: 0,
      height: 0,
      originalWidth: 0,
      originalHeight: 0,
      originalSize: file.size,
      optimizedSize: file.size,
      mimeType: detectedMime ?? file.type,
      ratio: 1,
      skipped: true,
      previewUrl: '',
    };
  }

  const decoded = await decodeImage(file);

  try {
    const target = fitWithin(decoded.width, decoded.height, profile.maxWidth, profile.maxHeight);
    const canvas = createCanvas(target.width, target.height);
    const context = canvas.getContext('2d');

    if (!context) {
      throw new ImageValidationError('Image optimization is not supported in this browser.');
    }

    // Flatten JPEG sources onto white; everything else keeps its alpha channel.
    if (detectedMime === 'image/jpeg') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, target.width, target.height);
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(decoded.source, 0, 0, target.width, target.height);

    const needsAlpha = profile.preferPngWhenTransparent
      ? canvasHasTransparency(context, target.width, target.height)
      : false;

    const candidates: Array<{ mimeType: string; quality: number }> = needsAlpha
      ? [{ mimeType: 'image/png', quality: 1 }]
      : [
          { mimeType: 'image/webp', quality: profile.quality },
          { mimeType: 'image/jpeg', quality: profile.quality },
        ];

    let best: { blob: Blob; mimeType: string } | null = null;
    for (const candidate of candidates) {
      let blob: Blob;
      try {
        blob = await canvasToBlob(canvas, candidate.mimeType, candidate.quality);
      } catch {
        continue;
      }
      if (!best || blob.size < best.blob.size) {
        best = { blob, mimeType: candidate.mimeType };
      }
      // WebP/PNG support confirmed — no need to try the next format.
      if (candidate.mimeType !== 'image/jpeg') break;
    }

    if (!best) {
      throw new ImageValidationError('Image optimization failed. Please try again.');
    }

    // Never ship something bigger than what the user picked.
    if (best.blob.size >= file.size && file.size <= MAX_UPLOAD_BYTES) {
      return {
        file,
        width: decoded.width,
        height: decoded.height,
        originalWidth: decoded.width,
        originalHeight: decoded.height,
        originalSize: file.size,
        optimizedSize: file.size,
        mimeType: detectedMime ?? file.type,
        ratio: 1,
        skipped: true,
        previewUrl: URL.createObjectURL(file),
      };
    }

    const optimizedFile = new File([best.blob], renameForMime(file.name, best.mimeType), {
      type: best.mimeType,
      lastModified: Date.now(),
    });

    return {
      file: optimizedFile,
      width: target.width,
      height: target.height,
      originalWidth: decoded.width,
      originalHeight: decoded.height,
      originalSize: file.size,
      optimizedSize: optimizedFile.size,
      mimeType: best.mimeType,
      ratio: file.size > 0 ? optimizedFile.size / file.size : 1,
      skipped: false,
      previewUrl: URL.createObjectURL(optimizedFile),
    };
  } finally {
    decoded.release();
  }
}
