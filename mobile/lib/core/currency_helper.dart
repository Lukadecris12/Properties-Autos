import 'dart:ui' as ui;

const double ngnPerUsd = 1355.0;

class CurrencyConfig {
  final String code;
  final String symbol;
  final String label;
  final double rateFromUsd;
  final List<String> countries;

  const CurrencyConfig({
    required this.code,
    required this.symbol,
    required this.label,
    required this.rateFromUsd,
    required this.countries,
  });
}

const List<CurrencyConfig> supportedCurrencies = [
  CurrencyConfig(code: 'NGN', symbol: '₦', label: 'Nigeria (NGN)', rateFromUsd: ngnPerUsd, countries: ['nigeria', 'ng']),
  CurrencyConfig(code: 'USD', symbol: '\$', label: 'United States (USD)', rateFromUsd: 1.0, countries: ['united states', 'united states of america', 'usa', 'us']),
  CurrencyConfig(code: 'GBP', symbol: '£', label: 'United Kingdom (GBP)', rateFromUsd: 0.79, countries: ['united kingdom', 'uk', 'gb', 'england']),
  CurrencyConfig(code: 'EUR', symbol: '€', label: 'Eurozone (EUR)', rateFromUsd: 0.92, countries: ['germany', 'france', 'spain', 'italy', 'netherlands', 'ireland', 'portugal', 'belgium', 'austria', 'finland', 'greece', 'de', 'fr', 'es', 'it', 'nl', 'ie', 'pt', 'be']),
  CurrencyConfig(code: 'CAD', symbol: 'CA\$', label: 'Canada (CAD)', rateFromUsd: 1.39, countries: ['canada', 'ca']),
  CurrencyConfig(code: 'AUD', symbol: 'A\$', label: 'Australia (AUD)', rateFromUsd: 1.53, countries: ['australia', 'au']),
  CurrencyConfig(code: 'NZD', symbol: 'NZ\$', label: 'New Zealand (NZD)', rateFromUsd: 1.67, countries: ['new zealand', 'nz']),
  CurrencyConfig(code: 'CHF', symbol: 'CHF ', label: 'Switzerland (CHF)', rateFromUsd: 0.88, countries: ['switzerland', 'ch']),
  CurrencyConfig(code: 'SEK', symbol: 'kr ', label: 'Sweden (SEK)', rateFromUsd: 10.6, countries: ['sweden', 'se']),
  CurrencyConfig(code: 'NOK', symbol: 'kr ', label: 'Norway (NOK)', rateFromUsd: 10.8, countries: ['norway', 'no']),
  CurrencyConfig(code: 'DKK', symbol: 'kr ', label: 'Denmark (DKK)', rateFromUsd: 6.86, countries: ['denmark', 'dk']),
  CurrencyConfig(code: 'PLN', symbol: 'zł ', label: 'Poland (PLN)', rateFromUsd: 3.98, countries: ['poland', 'pl']),
  CurrencyConfig(code: 'TRY', symbol: '₺', label: 'Turkey (TRY)', rateFromUsd: 34.4, countries: ['turkey', 'türkiye', 'tr']),
  CurrencyConfig(code: 'GHS', symbol: 'GH₵', label: 'Ghana (GHS)', rateFromUsd: 15.8, countries: ['ghana', 'gh']),
  CurrencyConfig(code: 'KES', symbol: 'KSh ', label: 'Kenya (KES)', rateFromUsd: 129.0, countries: ['kenya', 'ke']),
  CurrencyConfig(code: 'ZAR', symbol: 'R ', label: 'South Africa (ZAR)', rateFromUsd: 18.1, countries: ['south africa', 'za']),
  CurrencyConfig(code: 'EGP', symbol: 'E£', label: 'Egypt (EGP)', rateFromUsd: 49.3, countries: ['egypt', 'eg']),
  CurrencyConfig(code: 'MAD', symbol: 'MAD ', label: 'Morocco (MAD)', rateFromUsd: 9.9, countries: ['morocco', 'ma']),
  CurrencyConfig(code: 'TZS', symbol: 'TSh ', label: 'Tanzania (TZS)', rateFromUsd: 2650.0, countries: ['tanzania', 'tz']),
  CurrencyConfig(code: 'UGX', symbol: 'USh ', label: 'Uganda (UGX)', rateFromUsd: 3670.0, countries: ['uganda', 'ug']),
  CurrencyConfig(code: 'RWF', symbol: 'RF ', label: 'Rwanda (RWF)', rateFromUsd: 1365.0, countries: ['rwanda', 'rw']),
  CurrencyConfig(code: 'ETB', symbol: 'Br ', label: 'Ethiopia (ETB)', rateFromUsd: 121.0, countries: ['ethiopia', 'et']),
  CurrencyConfig(code: 'XOF', symbol: 'CFA ', label: 'West Africa CFA (XOF)', rateFromUsd: 605.0, countries: ['senegal', 'ivory coast', 'benin', 'togo', 'mali', 'sn', 'ci', 'bj', 'tg']),
  CurrencyConfig(code: 'XAF', symbol: 'FCFA ', label: 'Central Africa CFA (XAF)', rateFromUsd: 605.0, countries: ['cameroon', 'gabon', 'congo', 'cm', 'ga']),
  CurrencyConfig(code: 'AED', symbol: 'AED ', label: 'UAE (AED)', rateFromUsd: 3.67, countries: ['united arab emirates', 'uae', 'ae', 'dubai']),
  CurrencyConfig(code: 'SAR', symbol: 'SAR ', label: 'Saudi Arabia (SAR)', rateFromUsd: 3.75, countries: ['saudi arabia', 'sa']),
  CurrencyConfig(code: 'QAR', symbol: 'QAR ', label: 'Qatar (QAR)', rateFromUsd: 3.64, countries: ['qatar', 'qa']),
  CurrencyConfig(code: 'INR', symbol: '₹', label: 'India (INR)', rateFromUsd: 84.4, countries: ['india', 'in']),
  CurrencyConfig(code: 'PKR', symbol: 'Rs ', label: 'Pakistan (PKR)', rateFromUsd: 278.0, countries: ['pakistan', 'pk']),
  CurrencyConfig(code: 'BDT', symbol: '৳', label: 'Bangladesh (BDT)', rateFromUsd: 119.5, countries: ['bangladesh', 'bd']),
  CurrencyConfig(code: 'CNY', symbol: '¥', label: 'China (CNY)', rateFromUsd: 7.23, countries: ['china', 'cn']),
  CurrencyConfig(code: 'JPY', symbol: '¥', label: 'Japan (JPY)', rateFromUsd: 154.0, countries: ['japan', 'jp']),
  CurrencyConfig(code: 'KRW', symbol: '₩', label: 'South Korea (KRW)', rateFromUsd: 1395.0, countries: ['south korea', 'korea', 'kr']),
  CurrencyConfig(code: 'SGD', symbol: 'S\$', label: 'Singapore (SGD)', rateFromUsd: 1.34, countries: ['singapore', 'sg']),
  CurrencyConfig(code: 'MYR', symbol: 'RM ', label: 'Malaysia (MYR)', rateFromUsd: 4.47, countries: ['malaysia', 'my']),
  CurrencyConfig(code: 'IDR', symbol: 'Rp ', label: 'Indonesia (IDR)', rateFromUsd: 15850.0, countries: ['indonesia', 'id']),
  CurrencyConfig(code: 'PHP', symbol: '₱', label: 'Philippines (PHP)', rateFromUsd: 58.6, countries: ['philippines', 'ph']),
  CurrencyConfig(code: 'THB', symbol: '฿', label: 'Thailand (THB)', rateFromUsd: 34.8, countries: ['thailand', 'th']),
  CurrencyConfig(code: 'BRL', symbol: 'R\$', label: 'Brazil (BRL)', rateFromUsd: 5.78, countries: ['brazil', 'br']),
  CurrencyConfig(code: 'MXN', symbol: 'MX\$', label: 'Mexico (MXN)', rateFromUsd: 20.4, countries: ['mexico', 'mx']),
];

int roundHalfUp(double value) {
  if (value <= 0 || value.isNaN || value.isInfinite) return 0;
  return (value + 0.5).floor();
}

int ngnToRoundedUsd(double priceNgn) {
  if (priceNgn <= 0) return 0;
  final v = roundHalfUp(priceNgn / ngnPerUsd);
  return v < 1 ? 1 : v;
}

CurrencyConfig detectMobileCurrency(String? userCountry) {
  final normalized = (userCountry ?? '').trim().toLowerCase();
  if (normalized.isNotEmpty) {
    for (final c in supportedCurrencies) {
      if (c.countries.contains(normalized)) return c;
    }
  }
  final localeCountry = (ui.PlatformDispatcher.instance.locale.countryCode ?? '').trim().toLowerCase();
  if (localeCountry.isNotEmpty) {
    for (final c in supportedCurrencies) {
      if (c.countries.contains(localeCountry)) return c;
    }
  }
  return supportedCurrencies[0];
}

String _withCommas(int n) {
  final s = n.toString();
  final buf = StringBuffer();
  for (int i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 == 0) buf.write(',');
    buf.write(s[i]);
  }
  return buf.toString();
}

class FormattedPlanPrice {
  final String display;
  final int usdAmount;
  final int localAmount;
  final bool isNigeria;

  const FormattedPlanPrice({
    required this.display,
    required this.usdAmount,
    required this.localAmount,
    required this.isNigeria,
  });
}

FormattedPlanPrice formatMobilePlanPrice(double priceNgn, CurrencyConfig currency) {
  if (priceNgn <= 0) {
    return FormattedPlanPrice(
      display: 'Free',
      usdAmount: 0,
      localAmount: 0,
      isNigeria: currency.code == 'NGN',
    );
  }

  final usdAmount = ngnToRoundedUsd(priceNgn);
  if (currency.code == 'NGN') {
    final ngnInt = priceNgn.round();
    return FormattedPlanPrice(
      display: '₦${_withCommas(ngnInt)}',
      usdAmount: usdAmount,
      localAmount: ngnInt,
      isNigeria: true,
    );
  }

  final localAmount = currency.code == 'USD'
      ? usdAmount
      : (roundHalfUp(usdAmount * currency.rateFromUsd) < 1 ? 1 : roundHalfUp(usdAmount * currency.rateFromUsd));

  return FormattedPlanPrice(
    display: '${currency.symbol}${_withCommas(localAmount)}',
    usdAmount: usdAmount,
    localAmount: localAmount,
    isNigeria: false,
  );
}
