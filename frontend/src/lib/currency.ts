export const NGN_PER_USD = 1355;

export interface CurrencyConfig {
  code: string;
  symbol: string;
  label: string;
  rateFromUsd: number;
  countries: string[];
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'NGN', symbol: '₦', label: 'Nigeria (NGN)', rateFromUsd: NGN_PER_USD, countries: ['nigeria', 'ng'] },
  { code: 'USD', symbol: '$', label: 'United States / Global (USD)', rateFromUsd: 1, countries: ['united states', 'usa', 'us'] },
  { code: 'GBP', symbol: '£', label: 'United Kingdom (GBP)', rateFromUsd: 0.79, countries: ['united kingdom', 'uk', 'gb', 'england'] },
  { code: 'EUR', symbol: '€', label: 'Europe (EUR)', rateFromUsd: 0.92, countries: ['germany', 'france', 'spain', 'italy', 'netherlands', 'ireland', 'portugal', 'belgium'] },
  { code: 'CAD', symbol: 'CA$', label: 'Canada (CAD)', rateFromUsd: 1.39, countries: ['canada', 'ca'] },
  { code: 'AUD', symbol: 'A$', label: 'Australia (AUD)', rateFromUsd: 1.53, countries: ['australia', 'au'] },
  { code: 'GHS', symbol: 'GH₵', label: 'Ghana (GHS)', rateFromUsd: 15.8, countries: ['ghana', 'gh'] },
  { code: 'KES', symbol: 'KSh ', label: 'Kenya (KES)', rateFromUsd: 129, countries: ['kenya', 'ke'] },
  { code: 'ZAR', symbol: 'R ', label: 'South Africa (ZAR)', rateFromUsd: 18.1, countries: ['south africa', 'za'] },
  { code: 'AED', symbol: 'AED ', label: 'UAE (AED)', rateFromUsd: 3.67, countries: ['united arab emirates', 'uae', 'ae', 'dubai'] },
];

/**
 * Half-up whole number rounding:
 * >= 0.5 rounds up to next whole number; < 0.5 rounds down to previous whole number.
 */
export function roundHalfUp(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(value + 0.5);
}

/** Converts an NGN plan price to its rounded whole-number USD base price. */
export function ngnToRoundedUsd(priceNgn: number): number {
  if (priceNgn <= 0) return 0;
  return Math.max(1, roundHalfUp(priceNgn / NGN_PER_USD));
}

export function detectCurrencyFromCountry(country?: string | null): CurrencyConfig {
  const normalized = (country || '').trim().toLowerCase();
  if (normalized) {
    const match = SUPPORTED_CURRENCIES.find((c) => c.countries.includes(normalized));
    if (match) return match;
    // Any non-Nigeria country defaults to USD unless matched above
    return SUPPORTED_CURRENCIES[1];
  }

  // Fallback to browser timezone/locale when user isn't logged in yet
  if (typeof window !== 'undefined') {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Lagos')) return SUPPORTED_CURRENCIES[0];
    if (tz.includes('London')) return SUPPORTED_CURRENCIES[2];
    if (tz.includes('Accra')) return SUPPORTED_CURRENCIES[6];
    if (tz.includes('Nairobi')) return SUPPORTED_CURRENCIES[7];
    if (tz.includes('Johannesburg')) return SUPPORTED_CURRENCIES[8];
    if (tz.includes('Dubai')) return SUPPORTED_CURRENCIES[9];
    if (tz.startsWith('Europe/')) return SUPPORTED_CURRENCIES[3];
    if (tz.includes('Toronto') || tz.includes('Vancouver')) return SUPPORTED_CURRENCIES[4];
    if (tz.startsWith('Australia/')) return SUPPORTED_CURRENCIES[5];
    if (tz.startsWith('America/')) return SUPPORTED_CURRENCIES[1];
  }

  return SUPPORTED_CURRENCIES[0];
}

export function formatSubscriptionPrice(priceNgn: number, currency: CurrencyConfig): {
  display: string;
  usdAmount: number;
  localAmount: number;
  isNigeria: boolean;
} {
  if (priceNgn <= 0) {
    return {
      display: `${currency.symbol}0`,
      usdAmount: 0,
      localAmount: 0,
      isNigeria: currency.code === 'NGN',
    };
  }

  const usdAmount = ngnToRoundedUsd(priceNgn);

  // Leave Nigerian prices exactly as they are
  if (currency.code === 'NGN') {
    return {
      display: `₦${priceNgn.toLocaleString()}`,
      usdAmount,
      localAmount: priceNgn,
      isNigeria: true,
    };
  }

  const localAmount =
    currency.code === 'USD'
      ? usdAmount
      : Math.max(1, roundHalfUp(usdAmount * currency.rateFromUsd));

  return {
    display: `${currency.symbol}${localAmount.toLocaleString()}`,
    usdAmount,
    localAmount,
    isNigeria: false,
  };
}
