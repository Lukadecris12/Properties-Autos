import { Listing, AssetCategory } from './types';

export const FALLBACK_IMAGES: Record<string, string> = {
  RESIDENTIAL: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
  COMMERCIAL: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
  LAND: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200',
  VEHICLE: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1200',
  DEFAULT: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
};

/**
 * Returns a high-definition fallback image based on asset category.
 */
export function getFallbackImage(category?: AssetCategory | string): string {
  if (category && FALLBACK_IMAGES[category.toUpperCase()]) {
    return FALLBACK_IMAGES[category.toUpperCase()];
  }
  return FALLBACK_IMAGES.DEFAULT;
}

/**
 * Resolves an image URL cleanly, handling relative uploaded paths (/uploads/...)
 * and returning an appropriate high-definition fallback if invalid.
 */
export function resolveImageUrl(url?: string | null, category?: AssetCategory | string): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return getFallbackImage(category);
  }
  const clean = url.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return clean;
  }
  // Uploaded media served via Next.js rewrite / FastAPI static route
  if (clean.startsWith('/uploads/') || clean.startsWith('uploads/')) {
    return clean.startsWith('/') ? clean : `/${clean}`;
  }
  return clean.startsWith('/') ? clean : `/${clean}`;
}

/**
 * Retrieves the primary cover image of a listing, prioritizing is_cover=true.
 */
export function getCoverImageUrl(listing?: Partial<Listing> | null): string {
  if (!listing) return FALLBACK_IMAGES.DEFAULT;
  const category = listing.asset_category;

  if (listing.images && listing.images.length > 0) {
    const coverObj = listing.images.find(img => img.is_cover);
    if (coverObj && coverObj.url) {
      return resolveImageUrl(coverObj.url, category);
    }
    if (listing.images[0]?.url) {
      return resolveImageUrl(listing.images[0].url, category);
    }
  }

  return getFallbackImage(category);
}

/**
 * Returns all images for a listing with resolved URLs, sorted with cover photo first.
 */
export function getAllListingImages(listing?: Partial<Listing> | null): Array<{ url: string; caption?: string; is_cover?: boolean }> {
  if (!listing) return [{ url: FALLBACK_IMAGES.DEFAULT, caption: 'Property Photo', is_cover: true }];
  const category = listing.asset_category;

  if (listing.images && listing.images.length > 0) {
    const resolved = listing.images.map((img, idx) => ({
      url: resolveImageUrl(img.url, category),
      caption: img.caption || (category === 'VEHICLE' ? `Auto Photo #${idx + 1}` : `Property Photo #${idx + 1}`),
      is_cover: Boolean(img.is_cover),
    }));

    // Ensure cover photo is at index 0
    resolved.sort((a, b) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0));
    return resolved;
  }

  return [{ url: getFallbackImage(category), caption: 'Cover Photo', is_cover: true }];
}
