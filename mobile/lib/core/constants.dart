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
}

enum TransactionType { sale, rent, lease }
enum AssetCategory { land, residential, commercial, vehicle }
