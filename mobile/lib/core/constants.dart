class ApiConstants {
  // Connects to local LAN server by default, or live cloud API URL
  static String baseUrl = 'http://192.168.1.125:3000/api/v1';

  static String get listingsEndpoint => '$baseUrl/listings';
  static String get requirementsEndpoint => '$baseUrl/requirements';
  static String get matchesEndpoint => '$baseUrl/matching';
  static String get searchEndpoint => '$baseUrl/search';
  static String get bookingsEndpoint => '$baseUrl/bookings';
  static String get aiEndpoint => '$baseUrl/ai';
  static String get authEndpoint => '$baseUrl/auth';
  static String get investmentsEndpoint => '$baseUrl/investments';
  static String get adminEndpoint => '$baseUrl/admin';
  static String get messagesEndpoint => '$baseUrl/messages';
  static String get agentsEndpoint => '$authEndpoint/agents-developers';
  static String get signupInitiateEndpoint => '$authEndpoint/signup-initiate';
  static String get signupVerifyOtpEndpoint => '$authEndpoint/signup-verify-otp';
  static String get onboardingCompleteEndpoint => '$authEndpoint/onboarding-complete';

  /// Resolves relative media paths (/uploads/...) to absolute network URLs
  /// and provides high-definition fallbacks based on asset category.
  static String resolveImageUrl(String? url, {String? category}) {
    final fallback = category == 'VEHICLE'
        ? 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1000'
        : (category == 'LAND'
            ? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000'
            : (category == 'COMMERCIAL'
                ? 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000'
                : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000'));

    if (url == null || url.trim().isEmpty) {
      return fallback;
    }
    final clean = url.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      return clean;
    }
    // Remove /api/v1 from baseUrl to get origin host (e.g. http://192.168.1.125:3000)
    final origin = baseUrl.replaceAll(RegExp(r'/api/v1/?$'), '');
    final path = clean.startsWith('/') ? clean : '/$clean';
    return '$origin$path';
  }
}

enum TransactionType { sale, rent, lease }
enum AssetCategory { land, residential, commercial, vehicle }

/// RevenueCat Mobile In-App Subscriptions Configuration
/// Replace the placeholder keys with your live API keys from https://app.revenuecat.com
class RevenueCatConstants {
  // Public API Keys from RevenueCat Dashboard -> Project -> API Keys
  static const String apiKeyAndroid = 'goog_YOUR_REVENUECAT_ANDROID_API_KEY';
  static const String apiKeyIOS = 'appl_YOUR_REVENUECAT_IOS_API_KEY';

  // Entitlement Identifiers configured in RevenueCat Dashboard -> Entitlements
  static const String entitlementAgentPro = 'agent_pro_access';
  static const String entitlementDeveloperEnterprise = 'enterprise_access';
  static const String entitlementVIP = 'vip_access';

  // Offering Identifier (defaults to 'default')
  static const String defaultOfferingId = 'default';
}
