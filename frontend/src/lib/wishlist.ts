// Wishlist / Saved Listings Storage Helper

export const getWishlistIds = (): number[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('propertyhub_saved_listings');
    return raw ? JSON.parse(raw) : [1, 2]; // Default saved luxury listings for demo
  } catch {
    return [1, 2];
  }
};

export const isWishlistSaved = (id: number): boolean => {
  const ids = getWishlistIds();
  return ids.includes(id);
};

export const toggleWishlistId = (id: number): boolean => {
  if (typeof window === 'undefined') return false;
  const ids = getWishlistIds();
  let updated: number[];
  let isSavedNow: boolean;

  if (ids.includes(id)) {
    updated = ids.filter((item) => item !== id);
    isSavedNow = false;
  } else {
    updated = [...ids, id];
    isSavedNow = true;
  }

  try {
    localStorage.setItem('propertyhub_saved_listings', JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlist-updated'));
  } catch (e) {
    console.error('Failed to update wishlist in localStorage:', e);
  }

  return isSavedNow;
};
