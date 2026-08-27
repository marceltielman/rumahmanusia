import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import type { Provider } from '@angular/core';

/**
 * NgOptimizedImage loader for Sanity's image CDN.
 *
 * `ngSrc` carries the asset URL resolved at build time; this appends the width
 * and format parameters per request so the browser fetches WebP at the size it
 * actually needs. Non-Sanity URLs pass through untouched.
 */
export function sanityImageLoader({ src, width }: ImageLoaderConfig): string {
  if (!src.startsWith('https://cdn.sanity.io/')) return src;

  const url = new URL(src);
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fit', 'crop');
  url.searchParams.set('q', '78');
  if (width) url.searchParams.set('w', String(width));
  return url.toString();
}

export const provideSanityImageLoader = (): Provider => ({
  provide: IMAGE_LOADER,
  useValue: sanityImageLoader,
});
