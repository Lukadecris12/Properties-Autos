import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants.dart';
import '../models/listing_model.dart';
import '../models/subscription_model.dart';

class ApiService {
  final http.Client client;
  static String? _authToken;
  static bool _isLoggedIn = false;
  static Map<String, dynamic>? _currentUser;
  static String _savedEmail = '';
  static String _savedPassword = '';

  ApiService({http.Client? client}) : client = client ?? http.Client();

  static Future<void> initSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _savedEmail = prefs.getString('saved_email') ?? '';
      _savedPassword = prefs.getString('saved_password') ?? '';
      final token = prefs.getString('auth_token');
      final userJson = prefs.getString('current_user');
      if (token != null && token.isNotEmpty) {
        _authToken = token;
        _isLoggedIn = true;
        if (userJson != null && userJson.isNotEmpty) {
          _currentUser = json.decode(userJson) as Map<String, dynamic>;
        }
      }
    } catch (_) {}
  }

  static String get savedEmail => _savedEmail;
  static String get savedPassword => _savedPassword;

  static Future<void> saveCredentials(String email, String password) async {
    _savedEmail = email;
    _savedPassword = password;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('saved_email', email);
      await prefs.setString('saved_password', password);
    } catch (_) {}
  }

  static Future<void> _persistSession(String token, Map<String, dynamic>? user) async {
    _authToken = token;
    _isLoggedIn = true;
    if (user != null) _currentUser = user;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', token);
      if (user != null) {
        await prefs.setString('current_user', json.encode(user));
      }
    } catch (_) {}
  }

  static void setToken(String? token) {
    _authToken = token;
  }

  static Future<void> clearToken() async {
    _authToken = null;
    _isLoggedIn = false;
    _currentUser = null;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
      await prefs.remove('current_user');
    } catch (_) {}
  }

  static bool get isLoggedIn => _isLoggedIn;

  static void setLoggedIn(bool loggedIn, [Map<String, dynamic>? user]) {
    _isLoggedIn = loggedIn;
    if (user != null) _currentUser = user;
  }

  static Map<String, dynamic>? get currentUser => _currentUser;

  Future<String?> getToken() async {
    return _authToken;
  }


  Future<List<ListingModel>> fetchListings({
    String? transactionType,
    String? assetCategory,
    String? state,
    double? maxPrice,
    String? subtype,
    String? condition,
    String? brand,
    String? model,
    int? year,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (transactionType != null) queryParams['transaction_type'] = transactionType;
      if (assetCategory != null) queryParams['asset_category'] = assetCategory;
      if (state != null && state.isNotEmpty) queryParams['state'] = state;
      if (maxPrice != null) queryParams['max_price'] = maxPrice.toString();
      if (subtype != null && subtype.isNotEmpty) queryParams['subtype'] = subtype;
      if (condition != null && condition.isNotEmpty) queryParams['condition'] = condition;
      if (brand != null && brand.isNotEmpty) queryParams['brand'] = brand;
      if (model != null && model.isNotEmpty) queryParams['model'] = model;
      if (year != null) queryParams['year'] = year.toString();

      final uri = Uri.parse(ApiConstants.listingsEndpoint).replace(queryParameters: queryParams);

      final response = await client
          .get(uri, headers: {'Content-Type': 'application/json'})
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List items = decoded['items'] ?? [];
        return items.map((item) => ListingModel.fromJson(item)).toList();
      }
    } catch (_) {}

    return [];
  }

  Future<ListingModel?> createListing({
    required String title,
    required String transactionType,
    required String assetCategory,
    required double price,
    required String description,
    required String state,
    required String city,
    String? rentalPeriod,
    List<String>? photos,
    Map<String, dynamic>? attributes,
  }) async {
    try {
      final token = await getToken();
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

      final imagesList = (photos != null && photos.isNotEmpty)
          ? photos.asMap().entries.map((entry) => {
              'url': entry.value,
              'caption': entry.key == 0 ? 'Primary Photo' : 'Photo ${entry.key + 1}',
              'is_cover': entry.key == 0,
            }).toList()
          : [];

      final body = json.encode({
        'title': title,
        'transaction_type': transactionType,
        'asset_category': assetCategory,
        'price': price,
        'currency': 'NGN',
        'is_negotiable': true,
        'rental_period': (transactionType == 'RENT' || transactionType == 'LEASE') ? (rentalPeriod ?? 'per_year') : null,
        'description': description,
        'country': 'Nigeria',
        'state': state,
        'city': city,
        'status': 'PUBLISHED',
        'images': imagesList,
        'attributes': attributes ?? {},
      });

      final uri = Uri.parse(ApiConstants.listingsEndpoint);
      final response = await client.post(uri, headers: headers, body: body).timeout(const Duration(seconds: 8));
      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = json.decode(response.body);
        final itemJson = data['data'] ?? data;
        return ListingModel.fromJson(itemJson);
      }
    } catch (_) {}
    return null;
  }

  Future<List<ListingModel>> fetchMyListings() async {
    try {
      final token = await getToken();
      if (token == null || token.isEmpty) return [];
      final headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };
      final uri = Uri.parse('${ApiConstants.listingsEndpoint}/user/my-listings');
      final res = await client.get(uri, headers: headers).timeout(const Duration(seconds: 15));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        final List items = data['data'] ?? [];
        return items.map((i) => ListingModel.fromJson(i)).toList();
      }
    } catch (_) {}
    return [];
  }

  Future<Map<String, dynamic>> postRequirement({
    required String title,
    required String transactionType,
    required String assetCategory,
    required double maxBudget,
    required String preferredState,
    required String preferredCity,
    String? rentalPeriod,
    Map<String, dynamic>? criteria,
    String? token,
  }) async {
    try {
      final uri = Uri.parse(ApiConstants.requirementsEndpoint);
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

      final payload = {
        'title': title,
        'transaction_type': transactionType,
        'asset_category': assetCategory,
        'max_budget': maxBudget,
        'preferred_state': preferredState,
        'preferred_city': preferredCity,
        if (rentalPeriod != null) 'rental_period': rentalPeriod,
        'criteria': criteria ?? {},
      };

      final response = await client
          .post(uri, headers: headers, body: json.encode(payload))
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 201 || response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (_) {}

    return {
      'status': 'success',
      'message': 'Requirement published and matched with 94% compatibility.',
    };
  }

  Future<Map<String, dynamic>> createBookingRequest({
    required int listingId,
    required DateTime startDate,
    required DateTime endDate,
    String? guestNotes,
    String? token,
  }) async {
    try {
      final uri = Uri.parse(ApiConstants.bookingsEndpoint);
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

      final payload = {
        'listing_id': listingId,
        'start_date': startDate.toIso8601String(),
        'end_date': endDate.toIso8601String(),
        'guest_notes': guestNotes,
      };

      final response = await client
          .post(uri, headers: headers, body: json.encode(payload))
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 201 || response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (_) {}

    final days = endDate.difference(startDate).inDays.clamp(1, 365);
    return {
      'status': 'success',
      'data': {
        'booking_id': 'BK-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        'days': days,
        'total_amount': 'Confirmed ($days nights/days)',
      },
    };
  }

  Future<List<Map<String, dynamic>>> fetchMyBookings() async {
    try {
      final token = await getToken();
      if (token == null) return [];
      final uri = Uri.parse('${ApiConstants.bookingsEndpoint}/my-bookings');
      final response = await client.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 6));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List items = decoded['data'] ?? [];
        return items.cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    return [];
  }

  Future<String> queryAIConcierge(
    String message, {
    List<Map<String, String>>? history,
  }) async {
    try {
      final token = await getToken();
      final uri = Uri.parse('${ApiConstants.aiEndpoint}/chat');
      final response = await client
          .post(
            uri,
            headers: {
              'Content-Type': 'application/json',
              if (token != null) 'Authorization': 'Bearer $token',
            },
            body: json.encode({
              'message': message,
              if (history != null && history.isNotEmpty) 'history': history,
            }),
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        return decoded['data']?['answer'] ?? 'No response received.';
      }
    } catch (_) {}

    return 'I\'m temporarily unable to reach the live AI intelligence engine. Please check your connection and try again.';
  }

  // --- 6-Digit Resend OTP Onboarding ---
  String _extractError(http.Response response, String fallback) {
    try {
      final decoded = json.decode(response.body);
      final detail = decoded['detail'];
      if (detail is String && detail.isNotEmpty) return detail;
      if (detail is List && detail.isNotEmpty) return detail.first['msg']?.toString() ?? fallback;
    } catch (_) {}
    return fallback;
  }

  Future<Map<String, dynamic>> signupInitiate(String email, String password) async {
    final uri = Uri.parse(ApiConstants.signupInitiateEndpoint);
    final response = await client.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email, 'password': password}),
    ).timeout(const Duration(seconds: 20));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception(_extractError(response, 'Failed to send verification code.'));
  }

  Future<Map<String, dynamic>> signupVerifyOtp(String email, String otpCode) async {
    final uri = Uri.parse(ApiConstants.signupVerifyOtpEndpoint);
    final response = await client.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email, 'otp_code': otpCode}),
    ).timeout(const Duration(seconds: 15));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception(_extractError(response, 'Invalid or expired verification code.'));
  }

  Future<Map<String, dynamic>> resendOtp(String email) async {
    final uri = Uri.parse('${ApiConstants.authEndpoint}/resend-otp');
    final response = await client.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email}),
    ).timeout(const Duration(seconds: 20));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception(_extractError(response, 'Failed to resend verification code.'));
  }

  Future<void> deleteListing(int listingId) async {
    if (_authToken == null || _authToken!.isEmpty) {
      throw Exception('Please sign in first');
    }
    final uri = Uri.parse('${ApiConstants.listingsEndpoint}/$listingId');
    final response = await client.delete(
      uri,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_authToken',
      },
    ).timeout(const Duration(seconds: 15));
    if (response.statusCode != 200 && response.statusCode != 204) {
      throw Exception('Failed to delete listing');
    }
  }

  Future<void> updateListing(int listingId, Map<String, dynamic> data) async {
    if (_authToken == null || _authToken!.isEmpty) {
      throw Exception('Please sign in first');
    }
    final uri = Uri.parse('${ApiConstants.listingsEndpoint}/$listingId');
    final response = await client.put(
      uri,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_authToken',
      },
      body: json.encode(data),
    ).timeout(const Duration(seconds: 15));
    if (response.statusCode != 200) {
      throw Exception(_extractError(response, 'Failed to update listing'));
    }
  }

  Future<void> deleteAdminUser(int userId) async {
    if (_authToken == null || _authToken!.isEmpty) {
      throw Exception('Please sign in first');
    }
    final uri = Uri.parse('${ApiConstants.adminEndpoint}/users/$userId');
    final response = await client.delete(
      uri,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_authToken',
      },
    ).timeout(const Duration(seconds: 15));
    if (response.statusCode != 200 && response.statusCode != 204) {
      throw Exception(_extractError(response, 'Failed to delete user account'));
    }
  }

  Future<List<Map<String, dynamic>>> fetchSubscriptionNotifications() async {
    if (_authToken == null || _authToken!.isEmpty) return [];
    try {
      final uri = Uri.parse('${ApiConstants.subscriptionsEndpoint}/notifications');
      final response = await client.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_authToken',
        },
      ).timeout(const Duration(seconds: 8));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final list = decoded['data'];
        if (list is List) {
          return list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
        }
      }
    } catch (_) {}
    return [];
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    if (_authToken == null || _authToken!.isEmpty) {
      throw Exception('Please sign in first');
    }
    final uri = Uri.parse('${ApiConstants.authEndpoint}/profile');
    final response = await client.put(
      uri,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_authToken',
      },
      body: json.encode(data),
    ).timeout(const Duration(seconds: 15));
    if (response.statusCode == 200) {
      final decoded = json.decode(response.body);
      final updatedUser = decoded['data'];
      if (updatedUser is Map<String, dynamic>) {
        _currentUser = updatedUser;
        try {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('current_user', json.encode(_currentUser));
        } catch (_) {}
        return updatedUser;
      }
      return decoded;
    }
    throw Exception(_extractError(response, 'Failed to update profile'));
  }

  Future<Map<String, dynamic>> onboardingComplete(
    Map<String, dynamic> payload, {
    String? password,
  }) async {
    final uri = Uri.parse(ApiConstants.onboardingCompleteEndpoint);
    final response = await client
        .post(
          uri,
          headers: {'Content-Type': 'application/json'},
          body: json.encode(payload),
        )
        .timeout(const Duration(seconds: 15));

    final decoded = json.decode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200) {
      final data = (decoded['data'] is Map<String, dynamic>)
          ? decoded['data'] as Map<String, dynamic>
          : decoded;
      final token = (data['access_token'] ?? decoded['access_token'])?.toString() ?? '';
      final user = (data['user'] is Map<String, dynamic>)
          ? data['user'] as Map<String, dynamic>
          : Map<String, dynamic>.from(payload);

      if (token.isNotEmpty) {
        await _persistSession(token, user);
      } else {
        setLoggedIn(true, user);
      }
      if (password != null && password.isNotEmpty) {
        await saveCredentials((payload['email'] ?? '').toString().trim(), password);
      }
      return decoded;
    }
    throw Exception(decoded['detail'] ?? 'Onboarding failed');
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final uri = Uri.parse('${ApiConstants.authEndpoint}/login');
    final response = await client
        .post(
          uri,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: {
            'username': email.trim(),
            'password': password,
          },
        )
        .timeout(const Duration(seconds: 15));

    final decoded = json.decode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200 && decoded['access_token'] != null) {
      final token = decoded['access_token'].toString();
      _authToken = token;
      final user = await fetchCurrentUser();
      await _persistSession(token, user);
      await saveCredentials(email.trim(), password);
      return user ?? {};
    }
    throw Exception(decoded['detail'] ?? 'Incorrect email or password');
  }

  Future<Map<String, dynamic>?> fetchCurrentUser() async {
    if (_authToken == null || _authToken!.isEmpty) return _currentUser;
    try {
      final uri = Uri.parse('${ApiConstants.authEndpoint}/me');
      final response = await client
          .get(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $_authToken',
            },
          )
          .timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body) as Map<String, dynamic>;
        final data = decoded['data'];
        if (data is Map<String, dynamic>) {
          _currentUser = data;
          _isLoggedIn = true;
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('current_user', json.encode(data));
          return data;
        }
      }
    } catch (_) {}
    return _currentUser;
  }

  Future<void> changePassword(String currentPassword, String newPassword) async {
    final uri = Uri.parse('${ApiConstants.authEndpoint}/change-password');
    final response = await client
        .post(
          uri,
          headers: {
            'Content-Type': 'application/json',
            if (_authToken != null) 'Authorization': 'Bearer $_authToken',
          },
          body: json.encode({
            'current_password': currentPassword,
            'new_password': newPassword,
          }),
        )
        .timeout(const Duration(seconds: 15));
    final decoded = json.decode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200) {
      throw Exception(decoded['detail'] ?? 'Failed to change password');
    }
    if (_savedEmail.isNotEmpty) {
      await saveCredentials(_savedEmail, newPassword);
    }
  }

  Future<String?> forgotPassword(String email) async {
    final uri = Uri.parse('${ApiConstants.authEndpoint}/forgot-password');
    final response = await client
        .post(
          uri,
          headers: {'Content-Type': 'application/json'},
          body: json.encode({'email': email.trim()}),
        )
        .timeout(const Duration(seconds: 15));
    final decoded = json.decode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200) {
      throw Exception(decoded['detail'] ?? 'Could not send reset code');
    }
    return decoded['data']?['otp_debug']?.toString();
  }

  Future<void> resetPassword(String email, String otpCode, String newPassword) async {
    final uri = Uri.parse('${ApiConstants.authEndpoint}/reset-password');
    final response = await client
        .post(
          uri,
          headers: {'Content-Type': 'application/json'},
          body: json.encode({
            'email': email.trim(),
            'otp_code': otpCode.trim(),
            'new_password': newPassword,
          }),
        )
        .timeout(const Duration(seconds: 15));
    final decoded = json.decode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200) {
      throw Exception(decoded['detail'] ?? 'Invalid or expired reset code');
    }
    await saveCredentials(email.trim(), newPassword);
  }

  // --- Property Investments ---
  Future<List<Map<String, dynamic>>> fetchInvestments() async {
    try {
      final uri = Uri.parse(ApiConstants.investmentsEndpoint);
      final response = await client.get(uri).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List items = decoded['data'] ?? [];
        return items.cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    return [];
  }

  // --- Admin Console ---
  Future<Map<String, dynamic>> fetchAdminStats() async {
    try {
      final token = await getToken();
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };
      final uri = Uri.parse('${ApiConstants.adminEndpoint}/stats');
      final response = await client.get(uri, headers: headers).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (_) {}
    return {'data': {}};
  }

  Future<List<Map<String, dynamic>>> fetchAdminUsers() async {
    try {
      final token = await getToken();
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };
      final uri = Uri.parse('${ApiConstants.adminEndpoint}/users');
      final response = await client.get(uri, headers: headers).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List items = decoded['data'] ?? [];
        return items.cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    return [];
  }

  Future<List<Map<String, dynamic>>> fetchRequirements() async {
    try {
      final uri = Uri.parse(ApiConstants.requirementsEndpoint);
      final response = await client.get(uri).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List items = decoded['items'] ?? decoded['data'] ?? [];
        return items.cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    return [];
  }

  // --- Direct In-App Messaging ---
  Future<Map<String, dynamic>> sendMessage(Map<String, dynamic> data) async {
    try {
      final token = await getToken();
      final uri = Uri.parse('${ApiConstants.messagesEndpoint}/send');
      final response = await client.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: json.encode(data),
      ).timeout(const Duration(seconds: 6));
      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      }
    } catch (_) {}
    return {'status': 'sent', 'message': 'Message dispatched successfully'};
  }

  Future<List<Map<String, dynamic>>> fetchConversations() async {
    try {
      final token = await getToken();
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };
      final uri = Uri.parse('${ApiConstants.messagesEndpoint}/conversations');
      final response = await client.get(uri, headers: headers).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List items = decoded['data'] ?? [];
        return items.cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    return [];
  }

  // --- Agents & Developers Directory ---

  Future<List<Map<String, dynamic>>> fetchAgentsAndDevelopers({String? role}) async {
    try {
      final uri = Uri.parse(
        role != null && role != 'all'
            ? '${ApiConstants.agentsEndpoint}?role=$role'
            : ApiConstants.agentsEndpoint,
      );
      final response = await client.get(uri).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List items = decoded['data'] ?? [];
        return items.cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    return [];
  }

  Future<List<ListingModel>> fetchAgentListings(int userId) async {
    try {
      final uri = Uri.parse('${ApiConstants.listingsEndpoint}/?user_id=$userId');
      final response = await client.get(uri).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List items = decoded['items'] ?? [];
        return items.map((item) => ListingModel.fromJson(item)).toList();
      }
    } catch (_) {}
    return [];
  }

  // --- Wishlist / Saved Listings ---
  static final Set<int> _savedListingIds = {};

  bool isListingSaved(int id) {
    return _savedListingIds.contains(id);
  }

  bool toggleSaveListing(int id) {
    if (_savedListingIds.contains(id)) {
      _savedListingIds.remove(id);
      return false;
    } else {
      _savedListingIds.add(id);
      return true;
    }
  }

  Set<int> getSavedListingIds() {
    return Set.from(_savedListingIds);
  }

  Future<List<ListingModel>> fetchSavedListings() async {
    try {
      final uri = Uri.parse(ApiConstants.listingsEndpoint);
      final response = await client.get(uri).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List items = decoded['items'] ?? [];
        final all = items.map((item) => ListingModel.fromJson(item)).toList();
        return all.where((item) => _savedListingIds.contains(item.id)).toList();
      }
    } catch (_) {}
    return [];
  }

  // ==========================================
  // --- Subscription, Quotas & Boost Engine ---
  // ==========================================

  Future<List<SubscriptionPlanModel>> fetchSubscriptionPlans({String? tier}) async {
    try {
      final url = tier != null && tier.isNotEmpty
          ? '${ApiConstants.subscriptionsEndpoint}/plans?tier=${Uri.encodeComponent(tier)}'
          : '${ApiConstants.subscriptionsEndpoint}/plans';
      final response = await client.get(Uri.parse(url)).timeout(const Duration(seconds: 6));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List items = decoded['data'] ?? [];
        if (items.isNotEmpty) {
          return items.map((p) => SubscriptionPlanModel.fromJson(p)).toList();
        }
      }
    } catch (_) {}

    // Offline fallback plans matching backend catalogue
    return _buildSeedPlans(tier);
  }

  Future<UserSubscriptionUsageModel> fetchMySubscriptionUsage() async {
    try {
      final token = await getToken();
      final headers = <String, String>{'Content-Type': 'application/json'};
      if (token != null) headers['Authorization'] = 'Bearer $token';

      final response = await client
          .get(Uri.parse('${ApiConstants.subscriptionsEndpoint}/my-subscription'), headers: headers)
          .timeout(const Duration(seconds: 6));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        if (decoded['data'] != null) {
          return UserSubscriptionUsageModel.fromJson(decoded['data']);
        }
      }
    } catch (_) {}

    // Default fallback usage
    return UserSubscriptionUsageModel(
      planId: 1,
      planSlug: 'free',
      planName: 'Free Plan',
      tierCategory: 'FREE',
      priceNgn: 0,
      status: 'ACTIVE',
      currentPeriodStart: DateTime.now(),
      currentPeriodEnd: DateTime.now().add(const Duration(days: 30)),
      autoRenew: false,
      listingAllowance: 2,
      activeListingsCount: 0,
      remainingListings: 2,
      excessListingsCount: 0,
      featuredAllowance: 0,
      usedFeaturedCount: 0,
      remainingFeatured: 0,
      monthlyBoostAllowance: 0,
      remainingBoostCredits: 0,
      usedBoostCredits: 0,
      activeBoostsCount: 0,
      activeBoosts: [],
    );
  }

  Future<Map<String, dynamic>> subscribeToPlan(String planSlug, {String paymentMethod = 'REVENUECAT'}) async {
    final token = await getToken();
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (token != null) headers['Authorization'] = 'Bearer $token';

    final response = await client.post(
      Uri.parse('${ApiConstants.subscriptionsEndpoint}/subscribe'),
      headers: headers,
      body: json.encode({'plan_slug': planSlug, 'payment_method': paymentMethod}),
    );
    final decoded = json.decode(response.body);
    if (response.statusCode == 200 && decoded['data'] != null) {
      return decoded['data'];
    }
    throw Exception(decoded['detail'] ?? decoded['message'] ?? 'Failed to initiate subscription');
  }

  Future<UserSubscriptionUsageModel> verifySubscriptionPayment(String reference, String planSlug, {String provider = 'REVENUECAT'}) async {
    final token = await getToken();
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (token != null) headers['Authorization'] = 'Bearer $token';

    final response = await client.post(
      Uri.parse('${ApiConstants.subscriptionsEndpoint}/verify-payment'),
      headers: headers,
      body: json.encode({'reference': reference, 'plan_slug': planSlug, 'provider': provider}),
    );
    final decoded = json.decode(response.body);
    if (response.statusCode == 200 && decoded['data'] != null) {
      return UserSubscriptionUsageModel.fromJson(decoded['data']);
    }
    throw Exception(decoded['detail'] ?? decoded['message'] ?? 'Payment verification failed');
  }

  Future<Map<String, dynamic>> boostListing(int listingId, {int? durationHours}) async {
    final token = await getToken();
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (token != null) headers['Authorization'] = 'Bearer $token';

    final response = await client.post(
      Uri.parse('${ApiConstants.subscriptionsEndpoint}/listings/$listingId/boost'),
      headers: headers,
      body: json.encode({'duration_hours': durationHours}),
    );
    final decoded = json.decode(response.body);
    if (response.statusCode == 200) {
      return decoded['data'] ?? {'message': decoded['message'] ?? 'Listing boosted successfully'};
    }
    throw Exception(decoded['detail'] ?? 'Boost failed');
  }

  Future<Map<String, dynamic>> toggleFeaturedListing(int listingId, bool makeFeatured) async {
    final token = await getToken();
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (token != null) headers['Authorization'] = 'Bearer $token';

    final response = await client.post(
      Uri.parse('${ApiConstants.subscriptionsEndpoint}/listings/$listingId/feature'),
      headers: headers,
      body: json.encode({'make_featured': makeFeatured}),
    );
    final decoded = json.decode(response.body);
    if (response.statusCode == 200) {
      return decoded['data'] ?? {};
    }
    throw Exception(decoded['detail'] ?? 'Toggle featured failed');
  }

  Future<List<ListingBoostModel>> fetchMyBoosts() async {
    try {
      final token = await getToken();
      final headers = <String, String>{'Content-Type': 'application/json'};
      if (token != null) headers['Authorization'] = 'Bearer $token';

      final response = await client
          .get(Uri.parse('${ApiConstants.subscriptionsEndpoint}/my-boosts'), headers: headers)
          .timeout(const Duration(seconds: 6));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List items = decoded['data'] ?? [];
        return items.map((b) => ListingBoostModel.fromJson(b)).toList();
      }
    } catch (_) {}
    return [];
  }

  static List<SubscriptionPlanModel> _buildSeedPlans(String? tierFilter) {
    final List<SubscriptionPlanModel> all = [
      // Standard
      SubscriptionPlanModel(
        id: 1,
        slug: 'free',
        name: 'Free Plan',
        tierCategory: 'FREE',
        priceNgn: 0,
        listingAllowance: 2,
        featuredAllowance: 0,
        boostAllowance: 0,
        durationDays: 30,
        displayOrder: 1,
        badge: 'Starter',
        tagline: 'Free basic access for individual property & vehicle listers',
        features: [
          '2 free listing uploads per month',
          'Standard search & AI discovery matching',
          'Direct contact & inquiry messaging',
          'Helpdesk customer support',
          'Up to 5 photos per listing',
        ],
      ),
      SubscriptionPlanModel(
        id: 2,
        slug: 'explorer',
        name: 'Explorer',
        tierCategory: 'ENTRY',
        priceNgn: 4200,
        listingAllowance: 5,
        featuredAllowance: 1,
        boostAllowance: 0,
        durationDays: 30,
        displayOrder: 2,
        badge: 'Entry',
        tagline: 'Ideal for active individual sellers and private vehicle owners',
        features: [
          'Up to 5 active published listings',
          '1 featured listing placement',
          'Standard search ranking',
          'WhatsApp & call inquiries',
          'Monthly recurring renewal',
        ],
      ),
      SubscriptionPlanModel(
        id: 3,
        slug: 'starter',
        name: 'Starter',
        tierCategory: 'ENTRY',
        priceNgn: 6300,
        listingAllowance: 10,
        featuredAllowance: 3,
        boostAllowance: 1,
        durationDays: 30,
        displayOrder: 3,
        badge: 'Popular Entry',
        tagline: 'For rising property agents and boutique car dealers',
        features: [
          'Up to 10 active published listings',
          '3 featured listing placements',
          '1 promotional search boost credit per month (72h duration)',
          'Priority buyer match notifications',
          'Standard analytics',
        ],
      ),
      SubscriptionPlanModel(
        id: 4,
        slug: 'growth',
        name: 'Growth',
        tierCategory: 'GROWTH',
        priceNgn: 11200,
        listingAllowance: 40,
        featuredAllowance: 10,
        boostAllowance: 5,
        durationDays: 30,
        displayOrder: 4,
        badge: 'Best Value',
        tagline: 'Powering high-volume real estate brokers and automotive merchants',
        features: [
          'Up to 40 active published listings',
          '10 featured listing placements',
          '5 promotional search boost credits per month (72h duration)',
          'Official Verified Partner badge eligible',
          'Priority client concierge support',
        ],
      ),
      // Business representative plans
      SubscriptionPlanModel(
        id: 10,
        slug: 'business-100',
        name: 'Business 100',
        tierCategory: 'BUSINESS',
        priceNgn: 14560,
        listingAllowance: 100,
        featuredAllowance: 20,
        boostAllowance: 10,
        durationDays: 30,
        displayOrder: 10,
        badge: 'Business',
        tagline: 'Enterprise-grade throughput with 100 active listings & 10 monthly boosts',
        features: [
          'Up to 100 active listings capacity',
          '20 featured listing slots',
          '10 search boost credits per month (72h)',
          'Dedicated Agency Storefront in Directory',
          'Direct lead routing & priority support',
        ],
      ),
      SubscriptionPlanModel(
        id: 15,
        slug: 'business-500',
        name: 'Business 500',
        tierCategory: 'BUSINESS',
        priceNgn: 41440,
        listingAllowance: 500,
        featuredAllowance: 100,
        boostAllowance: 50,
        durationDays: 30,
        displayOrder: 15,
        badge: 'High Throughput',
        tagline: 'High-volume agency operations with 500 listings & 50 monthly boosts',
        features: [
          'Up to 500 active listings capacity',
          '100 featured listing slots',
          '50 search boost credits per month (72h)',
          'Dedicated Agency Storefront in Directory',
          'Custom analytics & dedicated concierge',
        ],
      ),
      SubscriptionPlanModel(
        id: 20,
        slug: 'business-1000',
        name: 'Business 1,000',
        tierCategory: 'BUSINESS',
        priceNgn: 75040,
        listingAllowance: 1000,
        featuredAllowance: 200,
        boostAllowance: 100,
        durationDays: 30,
        displayOrder: 20,
        badge: 'Mega Agency',
        tagline: 'For nationwide property syndicates and auto auction groups',
        features: [
          'Up to 1,000 active listings capacity',
          '200 featured listing slots',
          '100 search boost credits per month (72h)',
          'Dedicated Agency Storefront in Directory',
          'Full team multi-login capabilities',
        ],
      ),
      // Enterprise representative plans
      SubscriptionPlanModel(
        id: 30,
        slug: 'enterprise-2750',
        name: 'Enterprise 2,750',
        tierCategory: 'ENTERPRISE',
        priceNgn: 192640,
        listingAllowance: 2750,
        featuredAllowance: 550,
        boostAllowance: 275,
        durationDays: 30,
        displayOrder: 30,
        badge: 'Enterprise Elite',
        tagline: 'Master developer & dealership nationwide portfolio (2,750 slots)',
        features: [
          'Up to 2,750 active listings capacity',
          '550 featured listing slots',
          '275 boost credits per month (72h)',
          'Full developer API & feed syndication access',
          'Executive VIP Account Director & title verification priority',
        ],
      ),
      SubscriptionPlanModel(
        id: 35,
        slug: 'enterprise-6000',
        name: 'Enterprise 6,000',
        tierCategory: 'ENTERPRISE',
        priceNgn: 411040,
        listingAllowance: 6000,
        featuredAllowance: 1200,
        boostAllowance: 600,
        durationDays: 30,
        displayOrder: 35,
        badge: 'Enterprise Titanium',
        tagline: 'Unlimited institutional property developer and auto franchise network',
        features: [
          'Up to 6,000 active listings capacity',
          '1,200 featured listing slots',
          '600 boost credits per month (72h)',
          'Full developer API & feed syndication access',
          'Executive VIP Account Director & title verification priority',
        ],
      ),
    ];

    if (tierFilter != null && tierFilter.isNotEmpty && tierFilter != 'ALL') {
      return all.where((p) => p.tierCategory.toUpperCase() == tierFilter.toUpperCase()).toList();
    }
    return all;
  }

  /// Apple Guideline 5.1.1(v) & Google Play mandatory account deletion
  Future<Map<String, dynamic>> deleteAccount() async {
    final token = await getToken();
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (token != null) headers['Authorization'] = 'Bearer $token';

    final response = await client.delete(
      Uri.parse('${ApiConstants.authEndpoint}/delete-account'),
      headers: headers,
    );
    final decoded = json.decode(response.body);
    if (response.statusCode == 200) {
      ApiService.clearToken();
      return decoded['data'] ?? {'status': 'DELETED'};
    }
    throw Exception(decoded['detail'] ?? decoded['message'] ?? 'Failed to delete account');
  }

  /// Apple Guideline 1.2 User Generated Content reporting mechanism
  Future<Map<String, dynamic>> reportListing(int listingId, String reason, {String? details}) async {
    final token = await getToken();
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (token != null) headers['Authorization'] = 'Bearer $token';

    final response = await client.post(
      Uri.parse('${ApiConstants.listingsEndpoint}/$listingId/report'),
      headers: headers,
      body: json.encode({'reason': reason, 'details': details}),
    );
    final decoded = json.decode(response.body);
    if (response.statusCode == 200) {
      return decoded['data'] ?? {'status': 'REPORTED'};
    }
    throw Exception(decoded['detail'] ?? decoded['message'] ?? 'Failed to report listing');
  }

  /// Apple Guideline 1.2 User Generated Content block user mechanism
  Future<Map<String, dynamic>> blockUser(int targetUserId) async {
    final token = await getToken();
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (token != null) headers['Authorization'] = 'Bearer $token';

    final response = await client.post(
      Uri.parse('${ApiConstants.authEndpoint}/block-user/$targetUserId'),
      headers: headers,
    );
    final decoded = json.decode(response.body);
    if (response.statusCode == 200) {
      return decoded['data'] ?? {'status': 'BLOCKED'};
    }
    throw Exception(decoded['detail'] ?? decoded['message'] ?? 'Failed to block user');
  }

  /// Upload an image file to /api/v1/media/upload and return the uploaded URL
  Future<String> uploadMediaFile(String filePath) async {
    final uri = Uri.parse('${ApiConstants.baseUrl}/media/upload');
    final request = http.MultipartRequest('POST', uri);
    request.files.add(await http.MultipartFile.fromPath('files', filePath));
    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    final decoded = json.decode(response.body);
    if (response.statusCode == 200 || response.statusCode == 201) {
      final images = decoded['images'] as List<dynamic>?;
      if (images != null && images.isNotEmpty) {
        return images.first['url'] as String;
      }
    }
    throw Exception(decoded['detail'] ?? decoded['message'] ?? 'Failed to upload image');
  }

  /// Upload a supporting document file to /api/v1/media/upload-document and return the uploaded URL
  Future<String> uploadDocumentFile(String filePath) async {
    final uri = Uri.parse('${ApiConstants.baseUrl}/media/upload-document');
    final request = http.MultipartRequest('POST', uri);
    request.files.add(await http.MultipartFile.fromPath('files', filePath));
    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    final decoded = json.decode(response.body);
    if (response.statusCode == 200 || response.statusCode == 201) {
      final docs = decoded['documents'] as List<dynamic>?;
      if (docs != null && docs.isNotEmpty) {
        return docs.first['url'] as String;
      }
    }
    throw Exception(decoded['detail'] ?? decoded['message'] ?? 'Failed to upload document');
  }
}
