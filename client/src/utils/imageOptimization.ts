/**
 * Image optimization utilities for mobile performance
 */

export interface ImageOptimizationOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Optimize image file for mobile performance
 */
export async function optimizeImage(
  file: File, 
  options: ImageOptimizationOptions = {}
): Promise<File> {
  const {
    quality = 0.8,
    maxWidth = 1920,
    maxHeight = 1080,
    format = 'webp'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate optimized dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now()
            });
            resolve(optimizedFile);
          } else {
            reject(new Error('Failed to optimize image'));
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Progressive image loading with blur effect
 */
export function createProgressiveImageLoader(
  lowQualitySrc: string,
  highQualitySrc: string,
  onLoad?: () => void
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      onLoad?.();
      resolve(img);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = highQualitySrc;
    
    // Preload low quality version
    const lowQualityImg = new Image();
    lowQualityImg.src = lowQualitySrc;
  });
}

/**
 * Generate responsive image srcSet
 */
export function generateSrcSet(baseSrc: string, sizes: number[]): string {
  return sizes
    .map(size => `${baseSrc}?w=${size} ${size}w`)
    .join(', ');
}

/**
 * Preload critical images
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(url => 
      new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to preload ${url}`));
        img.src = url;
      })
    )
  );
}