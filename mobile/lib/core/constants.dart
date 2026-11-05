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
}

enum TransactionType { sale, rent, lease }
enum AssetCategory { land, residential, commercial, vehicle }
