export const NGN_PER_USD = 1355;

export interface CurrencyConfig {
  code: string;
  symbol: string;
  label: string;
  rateFromUsd: number;
  countries: string[];
  timezones?: string[];
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'NGN', symbol: '₦', label: 'Nigeria (NGN)', rateFromUsd: NGN_PER_USD, countries: ['nigeria', 'ng'], timezones: ['Africa/Lagos'] },
  { code: 'USD', symbol: '$', label: 'United States (USD)', rateFromUsd: 1, countries: ['united states', 'united states of america', 'usa', 'us'], timezones: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu'] },
  { code: 'GBP', symbol: '£', label: 'United Kingdom (GBP)', rateFromUsd: 0.79, countries: ['united kingdom', 'uk', 'gb', 'england', 'scotland', 'wales'], timezones: ['Europe/London'] },
  { code: 'EUR', symbol: '€', label: 'Eurozone (EUR)', rateFromUsd: 0.92, countries: ['germany', 'france', 'spain', 'italy', 'netherlands', 'ireland', 'portugal', 'belgium', 'austria', 'finland', 'greece', 'luxembourg', 'slovakia', 'slovenia', 'estonia', 'latvia', 'lithuania', 'malta', 'cyprus', 'croatia', 'de', 'fr', 'es', 'it', 'nl', 'ie', 'pt', 'be', 'at', 'fi', 'gr'], timezones: ['Europe/Berlin', 'Europe/Paris', 'Europe/Madrid', 'Europe/Rome', 'Europe/Amsterdam', 'Europe/Dublin', 'Europe/Lisbon', 'Europe/Brussels', 'Europe/Vienna', 'Europe/Helsinki', 'Europe/Athens'] },
  { code: 'CAD', symbol: 'CA$', label: 'Canada (CAD)', rateFromUsd: 1.39, countries: ['canada', 'ca'], timezones: ['America/Toronto', 'America/Vancouver', 'America/Edmonton', 'America/Winnipeg', 'America/Halifax'] },
  { code: 'AUD', symbol: 'A$', label: 'Australia (AUD)', rateFromUsd: 1.53, countries: ['australia', 'au'], timezones: ['Australia/'] },
  { code: 'NZD', symbol: 'NZ$', label: 'New Zealand (NZD)', rateFromUsd: 1.67, countries: ['new zealand', 'nz'], timezones: ['Pacific/Auckland'] },
  { code: 'CHF', symbol: 'CHF ', label: 'Switzerland (CHF)', rateFromUsd: 0.88, countries: ['switzerland', 'ch', 'liechtenstein'], timezones: ['Europe/Zurich'] },
  { code: 'SEK', symbol: 'kr ', label: 'Sweden (SEK)', rateFromUsd: 10.6, countries: ['sweden', 'se'], timezones: ['Europe/Stockholm'] },
  { code: 'NOK', symbol: 'kr ', label: 'Norway (NOK)', rateFromUsd: 10.8, countries: ['norway', 'no'], timezones: ['Europe/Oslo'] },
  { code: 'DKK', symbol: 'kr ', label: 'Denmark (DKK)', rateFromUsd: 6.86, countries: ['denmark', 'dk'], timezones: ['Europe/Copenhagen'] },
  { code: 'PLN', symbol: 'zł ', label: 'Poland (PLN)', rateFromUsd: 3.98, countries: ['poland', 'pl'], timezones: ['Europe/Warsaw'] },
  { code: 'TRY', symbol: '₺', label: 'Turkey (TRY)', rateFromUsd: 34.4, countries: ['turkey', 'türkiye', 'tr'], timezones: ['Europe/Istanbul'] },
  { code: 'GHS', symbol: 'GH₵', label: 'Ghana (GHS)', rateFromUsd: 15.8, countries: ['ghana', 'gh'], timezones: ['Africa/Accra'] },
  { code: 'KES', symbol: 'KSh ', label: 'Kenya (KES)', rateFromUsd: 129, countries: ['kenya', 'ke'], timezones: ['Africa/Nairobi'] },
  { code: 'ZAR', symbol: 'R ', label: 'South Africa (ZAR)', rateFromUsd: 18.1, countries: ['south africa', 'za'], timezones: ['Africa/Johannesburg'] },
  { code: 'EGP', symbol: 'E£', label: 'Egypt (EGP)', rateFromUsd: 49.3, countries: ['egypt', 'eg'], timezones: ['Africa/Cairo'] },
  { code: 'MAD', symbol: 'MAD ', label: 'Morocco (MAD)', rateFromUsd: 9.9, countries: ['morocco', 'ma'], timezones: ['Africa/Casablanca'] },
  { code: 'TZS', symbol: 'TSh ', label: 'Tanzania (TZS)', rateFromUsd: 2650, countries: ['tanzania', 'tz'], timezones: ['Africa/Dar_es_Salaam'] },
  { code: 'UGX', symbol: 'USh ', label: 'Uganda (UGX)', rateFromUsd: 3670, countries: ['uganda', 'ug'], timezones: ['Africa/Kampala'] },
  { code: 'RWF', symbol: 'RF ', label: 'Rwanda (RWF)', rateFromUsd: 1365, countries: ['rwanda', 'rw'], timezones: ['Africa/Kigali'] },
  { code: 'ETB', symbol: 'Br ', label: 'Ethiopia (ETB)', rateFromUsd: 121, countries: ['ethiopia', 'et'], timezones: ['Africa/Addis_Ababa'] },
  { code: 'XOF', symbol: 'CFA ', label: 'West Africa CFA (XOF)', rateFromUsd: 605, countries: ['senegal', 'ivory coast', "cote d'ivoire", 'benin', 'togo', 'mali', 'burkina faso', 'niger', 'sn', 'ci', 'bj', 'tg'], timezones: ['Africa/Dakar', 'Africa/Abidjan'] },
  { code: 'XAF', symbol: 'FCFA ', label: 'Central Africa CFA (XAF)', rateFromUsd: 605, countries: ['cameroon', 'gabon', 'congo', 'chad', 'cm', 'ga'], timezones: ['Africa/Douala', 'Africa/Libreville'] },
  { code: 'AED', symbol: 'AED ', label: 'UAE (AED)', rateFromUsd: 3.67, countries: ['united arab emirates', 'uae', 'ae', 'dubai'], timezones: ['Asia/Dubai'] },
  { code: 'SAR', symbol: 'SAR ', label: 'Saudi Arabia (SAR)', rateFromUsd: 3.75, countries: ['saudi arabia', 'sa'], timezones: ['Asia/Riyadh'] },
  { code: 'QAR', symbol: 'QAR ', label: 'Qatar (QAR)', rateFromUsd: 3.64, countries: ['qatar', 'qa'], timezones: ['Asia/Qatar'] },
  { code: 'INR', symbol: '₹', label: 'India (INR)', rateFromUsd: 84.4, countries: ['india', 'in'], timezones: ['Asia/Kolkata', 'Asia/Calcutta'] },
  { code: 'PKR', symbol: 'Rs ', label: 'Pakistan (PKR)', rateFromUsd: 278, countries: ['pakistan', 'pk'], timezones: ['Asia/Karachi'] },
  { code: 'BDT', symbol: '৳', label: 'Bangladesh (BDT)', rateFromUsd: 119.5, countries: ['bangladesh', 'bd'], timezones: ['Asia/Dhaka'] },
  { code: 'CNY', symbol: '¥', label: 'China (CNY)', rateFromUsd: 7.23, countries: ['china', 'cn'], timezones: ['Asia/Shanghai', 'Asia/Chongqing'] },
  { code: 'JPY', symbol: '¥', label: 'Japan (JPY)', rateFromUsd: 154, countries: ['japan', 'jp'], timezones: ['Asia/Tokyo'] },
  { code: 'KRW', symbol: '₩', label: 'South Korea (KRW)', rateFromUsd: 1395, countries: ['south korea', 'korea', 'kr'], timezones: ['Asia/Seoul'] },
  { code: 'SGD', symbol: 'S$', label: 'Singapore (SGD)', rateFromUsd: 1.34, countries: ['singapore', 'sg'], timezones: ['Asia/Singapore'] },
  { code: 'MYR', symbol: 'RM ', label: 'Malaysia (MYR)', rateFromUsd: 4.47, countries: ['malaysia', 'my'], timezones: ['Asia/Kuala_Lumpur'] },
  { code: 'IDR', symbol: 'Rp ', label: 'Indonesia (IDR)', rateFromUsd: 15850, countries: ['indonesia', 'id'], timezones: ['Asia/Jakarta'] },
  { code: 'PHP', symbol: '₱', label: 'Philippines (PHP)', rateFromUsd: 58.6, countries: ['philippines', 'ph'], timezones: ['Asia/Manila'] },
  { code: 'THB', symbol: '฿', label: 'Thailand (THB)', rateFromUsd: 34.8, countries: ['thailand', 'th'], timezones: ['Asia/Bangkok'] },
  { code: 'BRL', symbol: 'R$', label: 'Brazil (BRL)', rateFromUsd: 5.78, countries: ['brazil', 'br'], timezones: ['America/Sao_Paulo'] },
  { code: 'MXN', symbol: 'MX$', label: 'Mexico (MXN)', rateFromUsd: 20.4, countries: ['mexico', 'mx'], timezones: ['America/Mexico_City'] },
  { code: 'COP', symbol: 'COL$', label: 'Colombia (COP)', rateFromUsd: 4450, countries: ['colombia', 'co'], timezones: ['America/Bogota'] },
  { code: 'ARS', symbol: 'AR$', label: 'Argentina (ARS)', rateFromUsd: 1000, countries: ['argentina', 'ar'], timezones: ['America/Argentina'] },
];

const CURRENCY_STORAGE_KEY = 'propertyhub_selected_currency';

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

export function getCurrencyByCode(code?: string | null): CurrencyConfig | undefined {
  if (!code) return undefined;
  return SUPPORTED_CURRENCIES.find((c) => c.code === code.toUpperCase());
}

export function saveSelectedCurrency(code: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CURRENCY_STORAGE_KEY, code);
  }
}

export function detectCurrencyFromCountry(country?: string | null, ignoreSaved = false): CurrencyConfig {
  if (!ignoreSaved && typeof window !== 'undefined') {
    const saved = getCurrencyByCode(localStorage.getItem(CURRENCY_STORAGE_KEY));
    if (saved) return saved;
  }

  const normalized = (country || '').trim().toLowerCase();
  if (normalized) {
    const match = SUPPORTED_CURRENCIES.find((c) => c.countries.includes(normalized));
    if (match) return match;
  }

  // Fallback to browser timezone
  if (typeof window !== 'undefined') {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const tzMatch = SUPPORTED_CURRENCIES.find((c) =>
      c.timezones?.some((prefix) => tz.startsWith(prefix))
    );
    if (tzMatch) return tzMatch;
  }

  // Only default to USD if nothing else matched
  return SUPPORTED_CURRENCIES[1];
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
