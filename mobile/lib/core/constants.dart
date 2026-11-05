class ApiConstants {
  // Use 10.0.2.2 for Android emulator, localhost for iOS simulator, or live domain
  static const String baseUrl = 'http://10.0.2.2:8000/api/v1';

  static const String listingsEndpoint = '$baseUrl/listings';
  static const String requirementsEndpoint = '$baseUrl/requirements';
  static const String matchesEndpoint = '$baseUrl/matching';
  static const String searchEndpoint = '$baseUrl/search';
  static const String bookingsEndpoint = '$baseUrl/bookings';
  static const String aiEndpoint = '$baseUrl/ai';
  static const String authEndpoint = '$baseUrl/auth';
}

enum TransactionType { sale, rent, lease }
enum AssetCategory { land, residential, commercial, vehicle }
